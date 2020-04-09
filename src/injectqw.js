var browser = require('webextension-polyfill');

// TO DO
// * exclude qwant home page ? how ?
// * onload addeventlistener is not enough for refreshed queries. We have to add a listener to enter key pressed or other event when a new query is entered
// * Idem for more search results clicked > class result_load__more

// (MODULE 1) GET SERP RESULTS FOR QWANT
//----------------------------
// Scrap the Search Engine Result Page and send request to the filter module

function onError(e) {
  console.error(e);
}

function getSerp(storedSettings) {
  if (storedSettings.extensionswitch != 'off') {
    //if extension is switched on, proceed
    var resultslist = document.getElementsByClassName('result--web'); //parent is result_fragment--first or result_fragment
    var querystring = document.getElementsByName('q')[0].value;
    var resultjson = [];
    // fo each result, store id (from array index) and url (from href) in the resultjson array
    for (var i = 0; i < resultslist.length; i++) {
      var el = resultslist[i].getElementsByTagName('h3'); // test if result has expected child. prevents code from breaking when a special info box occurs.
      if (el.length > 0) {
        resultjson.push({
          id: i,
          url: resultslist[i].querySelector('h3').querySelector('a').href,
        });
      }
    }

    var requestjson = { request: querystring, results: resultjson, type: 'GET_SERP' };
    document.querySelector('.result_load__more').addEventListener('click', event => {
      getSerp();
    });

    notifyBackgroundPage(requestjson);
  } else {
    console.log('extension is switched off');
  }
}

//trigger the getSerp module on page load event
window.addEventListener('load', function() {
  const getStoredSettings = browser.storage.local.get();

  //test url params to detect new searches on Qwant SERP
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  if (urlParams.has('q')) {
    getStoredSettings.then(getSerp, onError);
  }

  var interval = window.setInterval(startWatch, 2000);
  function startWatch() {
    var newqueryString = window.location.search;
    if (newqueryString != queryString) {
      queryString = newqueryString;
      // WE SHOULD FACTORIZE THIS (adding display more results listener)
      var target = document.querySelector('.results-column');
      if (target) {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes[0].classList.contains('result_fragment')) {
              getStoredSettings.then(getSerp, onError);
            }
          });
        });
        var config = { childList: true };
        observer.observe(target, config);
      }
      getStoredSettings.then(getSerp, onError);
    }
  }

  //listen to the "display more results" button by watching new results nodes addidition to the results div
  var target = document.querySelector('.results-column');
  if (target) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        //console.log(mutation.addedNodes[0]);
        if (mutation.addedNodes[0].classList.contains('result_fragment')) {
          getStoredSettings.then(getSerp, onError);
        }
      });
    });
    var config = { childList: true };
    observer.observe(target, config);
  }
});

// (MODULE 2) FILTER
//--------------------------
// Send a single message to event listeners within the extension
// Response will be processed in background.js and sent back through the handler
function handleResponse(enrichedjson) {
  //console.log(enrichedjson);
  highlight(enrichedjson);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(json) {
  var sending = browser.runtime.sendMessage(json);
  //console.log('request : source de confiance');
  sending.then(handleResponse, handleError);
}

// (MODULE 3) HIGHLIGHT
//-------------------------
// Parse API response and apply new style and position to trusted results

function highlight(enrichedjson) {
  var resultslist = document.getElementsByClassName('result--web');
  var firstresult = true;

  for (var i = 0; i < enrichedjson.length; i++) {
    if (enrichedjson[i].status == 'trusted') {
      resultslist[enrichedjson[i].id].classList.add('trusted');
      resultslist[enrichedjson[i].id]
        .querySelector('h3')
        .querySelector('.result__url')
        .querySelector('span')
        .classList.add('trustedurl');

      if (firstresult) {
        resultslist[enrichedjson[i].id].classList.add('trustedfirst');
        resultslist[enrichedjson[i].id].classList.add('tooltipfirst');

        var para = document.createElement('span');
        para.classList.add('tooltipfirsttext');
        para.appendChild(document.createTextNode('Source de confiance '));
        let newNode = resultslist[enrichedjson[i].id];
        newNode.appendChild(para);
        var parentDiv = document.getElementsByClassName('result_fragment--first')[0];
        var firstChildNode = document.getElementsByClassName('result_fragment--first')[0].firstElementChild;
        parentDiv.insertBefore(newNode, firstChildNode);
        firstresult = false;
      }
    }
  }

  var pictourl = browser.runtime.getURL('assets/icons/sdc-24.png');
  // CSS injection - Define style for .trusted class
  var newstyles = `
    .result__url__long {
      color :#777;
    }

    .trustedurl.result__url__long{
      color: #34a853;
    }

    .trusted:before {
      content: " ";
      color: #44ba3a;
      width:24px;
      height:24px;
      display:block;
      float:left;
      margin-left:-26px;
      background-image:url(${pictourl});
    }
    .trustedfirst {
      padding: 16px 5px 5px 16px;
      border: 1px solid #dfe1e5;
      border-radius: 8px;
      box-shadow: none;
      width:630px;    }
      .trustedfirst cite {
        color: #34a853;
      }
      .trustedfirst:before {
        content: " ";
        color: #44ba3a;
        width:24px;
        /* height:40px; */
        height:24px;
        display:block;
        float:right;
        margin-left:-15px;
        margin-top:-17px;
        background-image:url(${pictourl});
      }
      /* Tooltip container */
      .tooltipfirst {
       position: relative;
       display: inline-block;
      }
      /* Tooltip text */
      .tooltipfirst .tooltipfirsttext {
       visibility: hidden;
       width: 150px;
       background-color: #BBB;
       color: #fff;
       text-align: center;
       padding: 5px 0;
       border-radius: 6px;
       /* Position the tooltip text */
       position: absolute;
       z-index: 1;
       bottom: 100%;
       left: 100%;
       margin-left: -92px;
       margin-bottom: 6px;
       /* Fade in tooltip */
       opacity: 0;
       transition: opacity 0.3s;
      }
      /* Tooltip arrow */
      .tooltipfirst .tooltipfirsttext::after {
       content: "";
       position: absolute;
       top: 100%;
       left: 50%;
       margin-left: -5px;
       border-width: 5px;
       border-style: solid;
       border-color: #BBB transparent transparent transparent;
      }
      /* Show the tooltip text when you mouse over the tooltip container */
      .tooltipfirst:hover .tooltipfirsttext {
       visibility: visible;
       opacity: 1;
      }
    `;

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = newstyles;
  document.head.appendChild(styleSheet);
}

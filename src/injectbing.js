// INITIALIZATION

var browser = require('webextension-polyfill');

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(getSerp, onError);
function onError(e) {
  console.error(e);
}

// (MODULE 1) GET SERP RESULTS
//----------------------------
// Scrap the Search Engine Result Page and send request to the filter module
function getSerp(storedSettings) {
  if (storedSettings.extensionswitch != 'off') {
    //if extension is switched on, proceed
    const resultslist = document.getElementsByClassName('b_algo');
    const querystring = document.getElementsByName('q')[0].value;
    var resultjson = [];
    // fo each result, store id (from array index) and url (from href) in the resultjson array
    for (var i = 0; i < resultslist.length; i++) {
      console.log(resultslist);
      if (resultslist[i].getElementsByTagName('h2').length) {
        //normal result
        console.log(resultslist[i].querySelector('h2').getElementsByTagName('a'));
        if (resultslist[i].querySelector('h2').getElementsByTagName('a').length) {
          var elementurl = resultslist[i].querySelector('h2').querySelector('a').href;
          resultjson.push({
            id: i,
            url: elementurl,
          });
          console.log(resultjson);
        } else if (resultslist[i].getElementsByClassName('b_title').length) {
          //knowledge box result (title)
          var elementurl = resultslist[i].querySelector('.b_title').querySelector('a').href;
          resultjson.push({
            id: i,
            url: elementurl,
          });
        }
      } else if (resultslist[i].getElementsByTagName('a').length) {
        //knowledge box result (subresult)
        var elementurl = resultslist[i].querySelector('a').href;
        resultjson.push({
          id: i,
          url: elementurl,
        });
      }
    }
    var apiserver = 'https://sourcesdeconfiance.org/api/trusted';
    if (storedSettings.apiserver) {
      apiserver = storedSettings.apiserver;
      console.log('using ' + apiserver);
    }
    var requestjson = { request: querystring, results: resultjson, userAgent: window.navigator.userAgent, apiserver: apiserver, searchengine: 'bing', type: 'GET_SERP' };
    notifyBackgroundPage(requestjson);
  } else {
    console.log('extension is switched off');
  }
}

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
  const resultslist = document.getElementsByClassName('b_algo');
  //check if it is the first result page, to apply specific style to the first result entry
  if (window.location.href.indexOf('&first=1&') != -1) {
    firstresult = true;
  } else if (window.location.href.indexOf('?first=') != -1) {
    firstresult = false;
  } else if (window.location.href.indexOf('&first=') != -1) {
    firstresult = false;
  } else {
    var firstresult = true;
  }

  for (var i = 0; i < enrichedjson.length; i++) {
    if (enrichedjson[i].status == 'trusted') {
      resultslist[enrichedjson[i].id].classList.add('trusted');
      if (firstresult) {
        resultslist[enrichedjson[i].id].classList.add('trustedfirst');
        resultslist[enrichedjson[i].id].classList.add('tooltip');
        var para = document.createElement('span');
        para.classList.add('tooltiptext');
        para.appendChild(document.createTextNode('Source de confiance '));
        let newNode = resultslist[enrichedjson[i].id];
        newNode.appendChild(para);
        var parentDiv = document.getElementById('b_results');
        var firstChildNode = document.getElementById('b_results').firstElementChild;
        if (firstChildNode.classList.contains('b_ad')) {
          //if first element is an ad, consider that the first real result is the next element
          firstChildNode = firstChildNode.nextSibling;
        }
        parentDiv.insertBefore(newNode, firstChildNode);
        firstresult = false;
      }
    }
  }

  var pictourl = browser.runtime.getURL('assets/icons/sdc-24.png');
  // CSS injection - Define style for .trusted class
  var newstyles = `
    .trusted {
   }

   cite, #b_results {
     color: #555;
   }

    .trusted cite {
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
        margin-top:-11px;
        background-image:url(${pictourl});
      }
      /* Tooltip container */
      .tooltip {
       position: relative;
       display: inline-block;
      }
      /* Tooltip text */
      .tooltip .tooltiptext {
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
       margin-left: -107px;
       margin-bottom: 6px;
       /* Fade in tooltip */
       opacity: 0;
       transition: opacity 0.3s;
      }
      /* Tooltip arrow */
      .tooltip .tooltiptext::after {
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
      .tooltip:hover .tooltiptext {
       visibility: visible;
       opacity: 1;
      }
    `;

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = newstyles;
  document.head.appendChild(styleSheet);
}

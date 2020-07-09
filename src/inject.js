import Vue from 'vue';
import SdcTab from './sdcTab';
import SdcFrame from './sdcFrame';

// Start the Vue engine for our space
//
// First the agregate frame itself
// Shared agreates data with Vue view (getters & setters)
// var agregates = {
//   get a() {
//     return frameVue.agregates;
//   },
//   set a(b) {
//     console.log('dans laffectation');
//     frameVue.agregates = b;
//   },
// };

export var agregates = [1, 2, 3];

const frameDiv = document.createElement('div');
document.getElementById('cnt').append(frameDiv);
var frameVue = new Vue({
  el: frameDiv,
  render: h => {
    // return h(SdcFrame, {
    //   props: {
    //     agregates: agregates
    //   }
    // });
    return h(SdcFrame);
  },
});

// Then the menu Tab
const menuDiv = document.createElement('div');
document.getElementById('hdtb-msb-vis').append(menuDiv);
var tabVue = new Vue({
  el: menuDiv,
  render: h => {
    return h(SdcTab, {
      props: {
        frameVue: frameVue,
      },
    });
  },
});

export function getFilteredResults() {
  console.log('agregates=' + agregates);
}

// INITIALIZATION
var browser = require('webextension-polyfill');

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(getSerp, onError);
function onError(e) {
  console.error(e);
}

// EDIT SERP INTERFACE FOR SDC
// function addElement() {
//   var sdcButton = document.createElement('a');
//   sdcButton.id = 'sdc';
//   sdcButton.setAttribute('class', 'hdtb-mitem');
//   var newContent = document.createTextNode('Sources de confiance');
//   sdcButton.appendChild(newContent);
//   sdcButton.addEventListener('click', sdcFrame);
//   var currentDiv = document.getElementById('hdtb-msb');
//   currentDiv.appendChild(sdcButton);
// }

//addElement();
// function sdcFrame() {
//   var selectedMenuItem = document.getElementsByClassName('hdtb-msel');
//   if (selectedMenuItem.length > 0) {
//     selectedMenuItem[0].classList.remove('hdtb-msel');
//   }
//   document.getElementById('sdc').classList.add('hdtb-msel');
//   document.getElementById('appbar').remove();
//   var node = document.getElementById('rcnt');
//   node.querySelectorAll('*').forEach(n => n.remove());
//   var sdcR = document.createElement('p');
//   sdcR.appendChild(document.createTextNode('Hello world !'));
//   node.appendChild(sdcR);

//   document.getElementById('footcnt').remove();
// }

// (MODULE 1) GET SERP RESULTS
//----------------------------
// Scrap the Search Engine Result Page and send request to the filter module
function getSerp(storedSettings) {
  if (storedSettings.extensionswitch != 'off') {
    //if extension is switched on, proceed
    const resultslist = document.getElementsByClassName('g');
    const querystring = document.getElementsByName('q')[0].value;
    var resultjson = [];
    // fo each result, store id (from array index) and url (from href) in the resultjson array
    for (var i = 0; i < resultslist.length; i++) {
      var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
      if (el.length > 0 && !resultslist[i].classList.contains('kno-kp')) {
        //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
        resultjson.push({
          id: i,
          url: resultslist[i]
            .querySelector('.rc')
            .querySelector('.r')
            .querySelector('a').href,
        });
      }
    }
    var apiserver = 'https://sourcesdeconfiance.org/api/trusted';
    if (storedSettings.apiserver) {
      apiserver = storedSettings.apiserver;
      console.log('using ' + apiserver);
    }

    // Calculate results per page
    var results = document.querySelectorAll('.g .rc');
    var startResult = 0;
    var currentPage = 1;
    var resultsPerPage = 10;
    var url = new URL(window.location.href);
    if (window.location.href.indexOf('?start=') != -1 || window.location.href.indexOf('&start=') != -1) {
      var startResult = parseInt(url.searchParams.get('start'));
      var currentPage = 1 + startResult / resultsPerPage;
    }
    if (currentPage == 1 && results.length > 10) {
      //quickfix for first SERP results number variable due to knowledge boxes
      resultsPerPage = Math.round(results.length / 10) * 10;
    }
    var nextResultIndex = resultsPerPage + startResult;

    var requestjson = {
      request: querystring,
      results: resultjson,
      userAgent: window.navigator.userAgent,
      apiserver: apiserver,
      searchengine: 'google',
      resultsPerPage: resultsPerPage,
      currentPage: currentPage,
      nextResultIndex: nextResultIndex,
      type: 'GET_SERP',
    };
    //notify background page
    browser.runtime.sendMessage(requestjson);
    //test results search on page 2
    console.log('startResult ' + startResult);
    console.log('resultsPerPage : ' + resultsPerPage);
    console.log('currentPage : ' + currentPage);
    console.log('Next result index : ' + nextResultIndex);
    var testjson = {
      request: querystring,
      userAgent: window.navigator.userAgent,
      apiserver: apiserver,
      searchengine: 'google',
      resultsPerPage: resultsPerPage,
      currentPage: currentPage,
      nextResultIndex: nextResultIndex,
      type: 'GET_NEXT_RESULTS',
    };
    browser.runtime.sendMessage(testjson);
  } else {
    console.log('extension is switched off');
  }
}

// (MODULE 2) FILTER
//--------------------------
// Send a single message to event listeners within the extension
// Response will be processed in background.js and sent back through the handler
function filterTrusted(el) {
  return el.status == 'trusted';
}

function handleMessage(request, sender, sendResponse) {
  if (request.message === 'HIGHLIGHT') {
    highlight(request.json);
  }
  if (request.message === 'NEXT_RESULTS') {
    console.log('Next results :');
    console.log(request.json);
    console.log('Next trusted results :');
    console.log(request.json.filter(filterTrusted));
  }
  if (request.message === 'KB_DELIB') {
    console.log('Deliberations :');
    console.log(request.json.filter(filterTrusted));
  }
  if (request.message === 'KB_LOI') {
    console.log('Lois :');
    console.log(request.json.filter(filterTrusted));
  }
  if (request.message === 'KB_GOUV') {
    console.log('Gouv :');
    console.log(request.json.filter(filterTrusted));
  }
}

browser.runtime.onMessage.addListener(handleMessage);

// (MODULE 3) HIGHLIGHT
//-------------------------
// Parse API response and apply new style and position to trusted results

function highlight(enrichedjson) {
  const resultslist = document.getElementsByClassName('g');
  //check if it is the first result page, to apply specific style to the first result entry
  if (window.location.href.indexOf('&start=0') != -1) {
    firstresult = true;
  } else if (window.location.href.indexOf('?start=') != -1) {
    firstresult = false;
  } else if (window.location.href.indexOf('&start=') != -1) {
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
        var parentDiv = document.getElementById('rso');
        var firstChildNode = document.getElementById('rso').firstElementChild;
        parentDiv.insertBefore(newNode, firstChildNode);
        firstresult = false;
        if (resultslist[enrichedjson[i].id].classList.contains('g-blk')) {
          //styling - only if the first trusted result is a special box mnr-c g-blk - could be improved
          resultslist[enrichedjson[i].id].classList.remove('trustedfirst');
          resultslist[enrichedjson[i].id].classList.add('trusted');
        }
      }
    }
  }

  var pictourl = browser.runtime.getURL('assets/icons/sdc-24.png');
  var pictooffurl = browser.runtime.getURL('assets/icons/sdc-off-24.png');
  var sdcCss = browser.runtime.getURL('assets/styles/sdc.css');
  console.log(sdcCss);

  // <link href="/static/build/styles/react-header.78d662924939.css" rel="stylesheet" type="text/css">
  var styleSheet = document.createElement('link');
  styleSheet.href = sdcCss;
  styleSheet.rel = 'stylesheet';
  styleSheet.type = 'text/css';
  document.head.appendChild(styleSheet);
  // CSS injection - Define style for .trusted class
  // var newstyles = `
  //   a#sdc {
  //     cursor: pointer;
  //   }
  //   a#sdc:before {
  //     content: " ";
  //     color: #44ba3a;
  //     width:24px;
  //     height:24px;
  //     display:block;
  //     float:left;
  //     background-image:url(${pictooffurl});
  //   }

  //   .g.trusted {
  //  }

  //   .trusted cite {
  //     color: #34a853;
  //   }

  //   .trusted:before {
  //     content: " ";
  //     color: #44ba3a;
  //     width:24px;
  //     height:24px;
  //     display:block;
  //     float:left;
  //     margin-left:-26px;
  //     background-image:url(${pictourl});
  //   }
  //   .g.trustedfirst {
  //     padding: 16px 5px 5px 16px;
  //     border: 1px solid #dfe1e5;
  //     border-radius: 8px;
  //     box-shadow: none;
  //     width:630px;    }
  //     .trustedfirst cite {
  //       color: #34a853;
  //     }
  //     .trustedfirst:before {
  //       content: " ";
  //       color: #44ba3a;
  //       width:24px;
  //       /* height:40px; */
  //       height:24px;
  //       display:block;
  //       float:right;
  //       margin-left:-15px;
  //       margin-top:-17px;
  //       background-image:url(${pictourl});
  //     }
  //     /* Tooltip container */
  //     .tooltip {
  //      position: relative;
  //      display: inline-block;
  //     }
  //     /* Tooltip text */
  //     .tooltip .tooltiptext {
  //      visibility: hidden;
  //      width: 150px;
  //      background-color: #BBB;
  //      color: #fff;
  //      text-align: center;
  //      padding: 5px 0;
  //      border-radius: 6px;
  //      /* Position the tooltip text */
  //      position: absolute;
  //      z-index: 1;
  //      bottom: 100%;
  //      left: 100%;
  //      margin-left: -92px;
  //      margin-bottom: 6px;
  //      /* Fade in tooltip */
  //      opacity: 0;
  //      transition: opacity 0.3s;
  //     }
  //     /* Tooltip arrow */
  //     .tooltip .tooltiptext::after {
  //      content: "";
  //      position: absolute;
  //      top: 100%;
  //      left: 50%;
  //      margin-left: -5px;
  //      border-width: 5px;
  //      border-style: solid;
  //      border-color: #BBB transparent transparent transparent;
  //     }
  //     /* Show the tooltip text when you mouse over the tooltip container */
  //     .tooltip:hover .tooltiptext {
  //      visibility: visible;
  //      opacity: 1;
  //     }
  //   `;
  // var styleSheet = document.createElement('style');
  // styleSheet.type = 'text/css';
  // styleSheet.innerText = sdcStyles;
  // document.head.appendChild(styleSheet);
}

var browser = require('webextension-polyfill');

// DEFAULT SETTINGS
// If there is nothing in storage, use these values.
//-------------------------
var defaultsettings = {
  extensionswitch: 'on',
  apiserver: 'https://sourcesdeconfiance.org/api/trusted',
};

const extensionversion = '1.0.42';

browser.runtime.onMessage.addListener(handleMessage);

function checkAPI() {
  var start_time = new Date().getTime();
  var dailyhello = { version: extensionversion, userAgent: window.navigator.userAgent };
  var url = 'https://sourcesdeconfiance.org/api/version';
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Content-Type', 'data/json');
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      //LOGS FOR DEBUGGING
      var request_time = new Date().getTime() - start_time;
      console.log('Sources de confiance v' + extensionversion + ' - API check resolved in ' + request_time + 'ms');
      console.log(xhr.response);
    } else {
      console.log(xhr.statusText);
    }
  };
  xhr.onerror = () => reject(xhr.statusText);
  xhr.send(JSON.stringify(dailyhello));
}

function checkStoredSettings(storedsettings) {
  // COULD BE FACTORIZED
  var today = new Date();
  if (!storedsettings.extensionswitch) {
    defaultsettings.lastcheck = today;
    checkAPI();
    browser.browserAction.setIcon({ path: '../assets/icons/sdc-48.png' });
    browser.storage.local.set(defaultsettings);
  } else {
    if (storedsettings.extensionswitch == 'off') {
      browser.browserAction.setIcon({ path: '../assets/icons/sdc-off-48.png' });
    }
    if (!storedsettings.lastcheck) {
      storedsettings.lastcheck = today;
      checkAPI();
      browser.storage.local.set(storedsettings);
    } else {
      var diff = Math.floor((Date.parse(today) - Date.parse(storedsettings.lastcheck)) / 86400000);
      if (diff > 0) {
        storedsettings.lastcheck = today;
        checkAPI();
        browser.storage.local.set(storedsettings);
      } else {
        console.log(storedsettings);
        console.log('Sources de confiance v' + extensionversion + ' - everything up to date');
      }
    }
  }
}

function onError(e) {
  console.error(`Error: ${e}`);
}

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(checkStoredSettings, onError);

// FILTER MODULE
// Get message from inject.js and send back the enrichedjson response
//------------------------------
function handleMessage(json, sender, sendResponse) {
  console.log('>handleMessage: json.type=' + json.type);

  // switch (json.type) {
  //   case 'GET_SERP':
  //     break;
  //   case 'GET_NEXT_RESULTS':
  //     break;
  // }

  if (json.type == 'GET_SERP' || json.type == 'CATEGORIZE') {
    checkTrusted(json).then(
      function(enrichedjson) {
        browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'HIGHLIGHT' });
      },
      function(Error) {
        console.log(Error);
      }
    );
  }

  if (json.type == 'GET_NEXT_RESULTS' || json.type == 'FETCH_AND_CATEGORIZE') {
    // var searchText = json.request;
    // var searchStart = json.start;
    // var resultsNumber = json.resultsPerPage;
    var searchUrl = 'https://www.google.fr/search?q=' + json.request + '&start=' + json.start + '&num=' + json.resultsPerPage.toString();
    console.log(searchUrl);
    getHTML(searchUrl, function(response) {
      parseGoogle(response, json, function(resultsjson) {
        checkTrusted(resultsjson).then(
          function(enrichedjson) {
            //send next trusted results back to inject.js
            browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'NEXT_RESULTS' });
          },
          function(Error) {
            console.log(Error);
          }
        );
      });
    });
    // // static test - deliberations knowledge box
    // console.log('Looking for deliberations');
    // searchText = searchText + '+délibération';
    // searchStart = 0;
    // resultsNumber = 10;
    // searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart + '&num=' + resultsNumber.toString();
    // console.log(searchUrl);
    // getHTML(searchUrl, function(response) {
    //   parseGoogle(response, json, function(resultsjson) {
    //     checkTrusted(resultsjson).then(
    //       function(enrichedjson) {
    //         //send next trusted results back to inject.js
    //         let trusteds = enrichedjson.filter(filterTrusted);
    //         console.log(trusteds);
    //         console.log('found ' + trusteds.length + ' trusteds on ' + enrichedjson.length + ' total results');
    //         browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'KB_DELIB' });
    //       },
    //       function(Error) {
    //         console.log(Error);
    //       }
    //     );
    //   });
    // });
    // // static test - legifrance knowledge box
    // console.log('Looking for legifrance results');
    // searchText = json.request;
    // searchStart = 0;
    // resultsNumber = 10;
    // searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart + '&num=' + resultsNumber.toString() + '&as_sitesearch=legifrance.gouv.fr';
    // console.log(searchUrl);
    // getHTML(searchUrl, function(response) {
    //   parseGoogle(response, json, function(resultsjson) {
    //     checkTrusted(resultsjson).then(
    //       function(enrichedjson) {
    //         //send next trusted results back to inject.js
    //         let trusteds = enrichedjson.filter(filterTrusted);
    //         console.log(trusteds);
    //         console.log('found ' + trusteds.length + ' trusteds on ' + enrichedjson.length + ' total results');
    //         browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'KB_LOI' });
    //       },
    //       function(Error) {
    //         console.log(Error);
    //       }
    //     );
    //   });
    // });
    // // static test - state results knowledge box
    // console.log('Looking for legifrance results');
    // searchText = json.request;
    // searchStart = 0;
    // resultsNumber = 10;
    // searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart + '&num=' + resultsNumber.toString() + '&as_sitesearch=gouv.fr';
    // console.log(searchUrl);
    // getHTML(searchUrl, function(response) {
    //   console.log(response);
    //   parseGoogle(response, json, function(resultsjson) {
    //     checkTrusted(resultsjson).then(
    //       function(enrichedjson) {
    //         //send next trusted results back to inject.js
    //         let trusteds = enrichedjson.filter(filterTrusted);
    //         console.log(trusteds);
    //         console.log('found ' + trusteds.length + ' trusteds on ' + enrichedjson.length + ' total results');
    //         browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'KB_GOUV' });
    //       },
    //       function(Error) {
    //         console.log(Error);
    //       }
    //     );
    //   });
    // });
  }
}

function getActiveTab() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

var getHTML = function(url, callback) {
  // Feature detection
  if (!window.XMLHttpRequest) return;
  console.log('>getHTML');
  // Create new request
  var xhr = new XMLHttpRequest();
  // Setup callback
  xhr.onload = function() {
    if (callback && typeof callback === 'function') {
      callback(this.responseXML);
    }
  };
  xhr.onerror = () => {
    console.log('Error: (' + xhr.status + ') ' + xhr.statusText);
    //reject(xhr.statusText);
  };
  // Get the HTML
  xhr.open('GET', url);
  xhr.responseType = 'document';
  xhr.send();
};

function parseGoogle(doc, json, callback) {
  var resultslist = doc.getElementsByClassName('g');
  var querystring = doc.getElementsByName('q')[0].value;
  var results = [];
  for (var i = 0; i < resultslist.length; i++) {
    var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
    if (el.length > 0 && !resultslist[i].classList.contains('kno-kp')) {
      //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
      results.push({
        id: i,
        url: resultslist[i].querySelector('.rc .r a').href,
        name: resultslist[i].querySelector('.rc .r h3').innerText,
        snippet: resultslist[i].querySelector('.rc .s .st').innerText,
      });
    }
  }
  var resultjson = json;
  resultjson.results = results;
  callback(resultjson);
}

function checkTrusted(json) {
  console.log('>checkTrusted:');
  var start_time = new Date().getTime();
  return new Promise((resolve, reject) => {
    var url = 'https://sourcesdeconfiance.org/api/trusted';
    if (json.apiserver) {
      url = json.apiserver;
      delete json.apiserver;
      delete json.type;
    }
    json.version = extensionversion;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'data/json');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        //LOGS FOR DEBUGGING
        var request_time = new Date().getTime() - start_time;
        console.log('resolved in ' + request_time + 'ms');
        //console.log(xhr.response);
        var enrichedjson = JSON.parse(xhr.response).data.results;
        resolve(enrichedjson);
      } else {
        console.log(xhr.statusText);
        console.log(xhr);
        reject(xhr.statusText);
      }
    };

    // console.log(JSON.stringify(json));
    xhr.onerror = () => reject(xhr.statusText);

    xhr.send(JSON.stringify(json));
  });
}

function filterTrusted(el) {
  return el.status == 'trusted';
}

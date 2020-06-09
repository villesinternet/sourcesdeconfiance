var browser = require('webextension-polyfill');

// DEFAULT SETTINGS
// If there is nothing in storage, use these values.
//-------------------------
var defaultsettings = {
  extensionswitch: 'on',
  apiserver: 'https://sourcesdeconfiance.org/api/trusted',
};

const extensionversion = '1.0.42';

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
//
function checkStoredSettings(storedsettings) {
  // COULD BE FACTORIZED
  var today = new Date();
  if (!storedsettings.extensionswitch) {
    defaultsettings.lastcheck = today;
    checkAPI();
    browser.storage.local.set(defaultsettings);
  } else {
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
  console.error(e);
}

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(checkStoredSettings, onError);

// FILTER MODULE
// Get message from inject.js and send back the enrichedjson response
//------------------------------
function handleMessage(json, sender, sendResponse) {
  if (json.type == 'GET_SERP') {
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
          console.log(xhr.response);
          var enrichedjson = JSON.parse(xhr.response).data.results;

          browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'HIGHLIGHT' });
        } else {
          console.log(xhr.statusText);
          console.log(xhr);
          reject(xhr.statusText);
        }
      };
      console.log(JSON.stringify(json));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send(JSON.stringify(json));
    });
  }
}

function getActiveTab() {
  return browser.tabs.query({ active: true, currentWindow: true });
}

browser.runtime.onMessage.addListener(handleMessage);

// EXPERIMENTAL : getting results from google SERP directly in background script

var getHTML = function(url, callback) {
  // Feature detection
  if (!window.XMLHttpRequest) return;
  // Create new request
  var xhr = new XMLHttpRequest();
  // Setup callback
  xhr.onload = function() {
    if (callback && typeof callback === 'function') {
      callback(this.responseXML);
    }
  };
  // Get the HTML
  xhr.open('GET', url);
  xhr.responseType = 'document';
  xhr.send();
};

function parseGoogle(doc) {
  var resultslist = doc.getElementsByClassName('g');
  var querystring = doc.getElementsByName('q')[0].value;
  var resultjson = [];
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
  console.log(doc.URL);
  console.log(resultjson);
  console.log(resultjson.length);
  return resultjson;
}

var searchText = 'paris';
var searchStart = 0;
var searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart;
getHTML(searchUrl, function(response) {
  parseGoogle(response);
});
searchStart = 10;
searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart;
getHTML(searchUrl, function(response) {
  parseGoogle(response);
});
searchStart = 20;
searchUrl = 'https://www.google.fr/search?q=' + searchText + '&start=' + searchStart;
getHTML(searchUrl, function(response) {
  parseGoogle(response);
});

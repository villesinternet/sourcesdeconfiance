var browser = require('webextension-polyfill');

// DEFAULT SETTINGS
// If there is nothing in storage, use these values.
//-------------------------
var defaultsettings = {
  extensionswitch: 'on',
  apiserver: 'https://sourcesdeconfiance.org/api/trusted',
};

const extensionversion = '1.0.10';

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
      console.log('resolved in ' + request_time + 'ms');
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
        console.log('everything up to date');
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

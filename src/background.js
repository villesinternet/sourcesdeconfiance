import * as config from './config/config.js';
import * as google from './config/google.js';

import * as FakeResults from './background/fakeResults.js';

console.log('Sources de confiance v' + config.extensionversion);

var browser = require('webextension-polyfill');

browser.storage.local.get().then(checkStoredSettings, function(e) {
  console.error(`Error fetching config: ${e}`);
});

browser.runtime.onMessage.addListener(handleMessage);

var $SE = null; // Search Engine configuration & helpers

//
// Gets the se configuration.
//
// @param      string  se  The searchengine name
// @return     object  The se configuration object
//
function getSEConfig(se) {
  console.log('>getSEConfig');
  switch (se) {
    case 'google':
      return google.getConfig();
      break;

    default:
      console.assert(false, '# searchengine not supported', searchengine);
  }
}

function checkAPI() {
  console.log('>checkAPI');

  var start_time = new Date().getTime();
  var dailyhello = { version: config.extensionversion, userAgent: window.navigator.userAgent };
  var url = 'https://sourcesdeconfiance.org/api/version';
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Content-Type', 'data/json');
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      //LOGS FOR DEBUGGING
      var request_time = new Date().getTime() - start_time;
      console.log('API version ' + JSON.parse(xhr.response).version + ' (resolved in ' + request_time + 'ms)');
      //console.log(JSON.parse(xhr.response));
    } else {
      console.log(xhr.statusText);
    }
  };
  xhr.onerror = () => reject(xhr.statusText);
  xhr.send(JSON.stringify(dailyhello));
}

function checkStoredSettings(storedsettings) {
  console.log('>checkStoredSettings');

  // COULD BE FACTORIZED
  var today = new Date();
  if (!storedsettings.extensionswitch) {
    config.defaultsettings.lastcheck = today;
    checkAPI();
    browser.browserAction.setIcon({ path: '../assets/icons/sdc-48.png' });
    browser.storage.local.set(config.defaultsettings);
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
      }
    }
  }
}

//
// Receving messages from the content scripts
//
// @param      {<type>}  json          The json
// @param      {<type>}  sender        The sender
// @param      {<type>}  sendResponse  The send response
//
function handleMessage(json, sender, sendResponse) {
  console.log('>handleMessage:');

  // Get the search engine configuration
  $SE = getSEConfig(json.searchengine);

  switch (json.type) {
    case 'CATEGORIZE':
      checkTrusted(json).then(
        function(enrichedjson) {
          browser.tabs.sendMessage(sender.tab.id, { json: enrichedjson, message: 'HIGHLIGHT' });
        },
        function(Error) {
          console.log(Error);
        }
      );
      break;

    case 'FETCH_AND_CATEGORIZE':
      // Debug only: generate fake results
      if (config.useFakeResults) {
        console.log('useFakeResults');

        var results = new FakeResults.get(Math.floor(Math.random() * 10));
        console.log(results);
        browser.tabs.sendMessage(sender.tab.id, {
          json: results.results,
          message: 'NEXT_RESULTS',
        });
        return;
      }

      // Use the provided search link if we have it
      var searchUrl = json.searchLink;
      console.assert(searchUrl, 'no search link provided');
      // console.log('generating search link: start=' + json.start + ', resultsPerPage=' + json.resultsPerPage.toString());
      // searchUrl = 'https://www.google.fr/search?q=' + json.request + '&start=' + json.start + '&num=' + json.resultsPerPage.toString();
      console.log('requesting search link: ' + searchUrl);

      getHTML(searchUrl, function(response) {
        extractFromSERP(response, json, function(resultsjson) {
          checkTrusted(resultsjson).then(
            function(enrichedjson) {
              //send next trusted results back to the content script
              browser.tabs.sendMessage(sender.tab.id, {
                json: enrichedjson,
                message: 'NEXT_RESULTS',
              });
            },

            function(Error) {
              console.log(Error);
            }
          );
        });
      });
      break;

    default:
      console.log('unhandled message');
      break;
  }

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

function extractFromSERP(doc, json, callback) {
  console.log('>extractFromSERP');

  json.results = $SE.extractFromSERP(doc);
  callback(json);
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
    json.version = config.extensionversion;
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

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

var searchEngines = {
  google: {
    config: google.getConfig(),
    pending: false,
    queue: [],
  },
};

poll();

function enqueue(se, msg, sender) {
  console.log('>enqueue:  ' + se);
  return searchEngines[se].queue.push({
    msg: msg,
    sender: sender,
  });
}

function dequeue(se) {
  var msg = searchEngines[se].queue.shift();
  return msg ? msg : null;
}

function setPending(se) {
  console.log('>setPending: ' + se);
  searchEngines[se].pending = true;
}

function clearPending(se) {
  console.log('>clearPending: ' + se);
  searchEngines[se].pending = false;
}

function isPending(se) {
  return searchEngines[se].pending;
}

//
// Receving messages from the content scripts
//
// @param      {<type>}  json          The json
// @param      {<type>}  sender        The sender
// @param      {<type>}  sendResponse  The send response
//
function handleMessage(msg, sender, sendResponse) {
  console.log('>handleMessage:');

  console.assert(msg.service);

  // switch (msg.service)
  // {
  //   case 'web':
  //     console.assert(msg.payload);
  //     console.assert(msg.payload.type);

  switch (msg.payload.type) {
    case 'ECHO':
    case 'CATEGORIZE':
      enqueue(msg.payload.searchengine, msg, sender);
      break;

    case 'GET_SERP':
      console.log('enqueueing GET_SERP');
      enqueue(msg.payload.searchengine, msg, sender);
      break;
  }
  //     break;

  //   default:
  //     console.log('undefined service ' + msg.service);
  // }
  return;

  // // Get the search engine configuration
  // if (msg.searchengine)
  //   $SE = getSEConfig(msg.searchengine);

  // console.log(msg.type);
  // switch (msg.type) {

  //   case 'ECHO':
  //     enqueue(msg.searchengine,msg,sender);
  //     return;

  //   case 'CATEGORIZE':
  //     enqueue(msg.searchengine,msg,sender);
  //     // checkTrusted(msg).then(
  //     //   function(enrichedmsg) {
  //     //     browser.tabs.sendMessage(sender.tab.id, { msg: enrichedmsg, message: 'HIGHLIGHT' });
  //     //   },
  //     //   function(Error) {
  //     //     console.log(Error);
  //     //   }
  //     // );
  //     break;

  //   case 'FETCH_AND_CATEGORIZE':
  //     // Debug only: generate fake results
  //     if (config.useFakeResults) {
  //       console.log('useFakeResults');

  //       var results = new FakeResults.get(Math.floor(Math.random() * 10));
  //       console.log(results);
  //       browser.tabs.sendMessage(sender.tab.id, {
  //         msg: results.results,
  //         message: 'NEXT_RESULTS',
  //       });
  //       return;
  //     }

  //     // Use the provided search link if we have it
  //     var searchUrl = msg.searchLink;
  //     console.assert(searchUrl, 'no search link provided');
  //     // console.log('generating search link: start=' + msg.start + ', resultsPerPage=' + msg.resultsPerPage.toString());
  //     // searchUrl = 'https://www.google.fr/search?q=' + msg.request + '&start=' + msg.start + '&num=' + msg.resultsPerPage.toString();
  //     console.log('requesting search link: ' + searchUrl);

  //     getHTML(searchUrl, function(response) {
  //       extractFromSERP(response, msg, function(resultsmsg) {
  //         checkTrusted(resultsmsg).then(
  //           function(enrichedmsg) {
  //             //send next trusted results back to the content script
  //             browser.tabs.sendMessage(sender.tab.id, {
  //               msg: enrichedmsg,
  //               message: 'NEXT_RESULTS',
  //             });
  //           },

  //           function(Error) {
  //             console.log(Error);
  //           }
  //         );
  //       });
  //     });
  //     break;

  //   default:
  //     console.log('unhandled message');
  //     break;
  // }
}

function poll() {
  var poll = setInterval(function() {
    for (var se in searchEngines) {
      if (isPending(se)) continue;

      var m = dequeue(se);

      if (!m) continue;

      console.log('dequeued message on ' + se);
      console.log(m.msg.payload.type);

      switch (m.msg.payload.type) {
        case 'ECHO':
          setPending(se);

          browser.tabs.sendMessage(m.sender.tab.id, m.msg);

          clearPending(se);

          break;

        case 'CATEGORIZE':
          setPending(se);

          checkTrusted(m.msg.payload).then(
            function(enrichedmsg) {
              m.msg.payload.status = 'ok';
              m.msg.payload.results = enrichedmsg;
              browser.tabs.sendMessage(m.sender.tab.id, m.msg);
              setTimeout(function() {
                clearPending(se);
              }, 2000);
            },

            function(e) {
              console.log(e);
              m.msg.payload.status = 'error';
              m.msg.payload.error = e;
              browser.tabs.sendMessage(m.sender.tab.id, m.msg);
              clearPending(se);
            }
          );
          break;

        case 'GET_SERP':
          if (config.useFakeResults) {
            console.log('useFakeResults');
            m.msg.payload.status = 'ok';
            m.msg.results = new FakeResults.get(Math.floor(Math.random() * 10));
            browser.tabs.sendMessage(m.sender.tab.id, m.msg);
            return;
          }

          // Use the provided search link if we have it
          var searchUrl = m.msg.payload.searchUrl;
          console.log('requesting search url: ' + searchUrl);

          setPending(se);

          getHTML(searchUrl, function(response) {
            console.log('got results:');
            console.log(response);

            m.msg.payload.results = getSEConfig(m.msg.payload.searchengine).extractFromSERP(response);
            m.msg.payload.status = 'ok';

            browser.tabs.sendMessage(m.sender.tab.id, m.msg);

            setTimeout(function() {
              clearPending(se);
            }, 2000);
          });
          break;
      }
    }
  }, 100);
}

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

    case 'qwant':
    case 'bing':
    default:
      console.assert(false, '# searchengine not supported', searchengine);
      return null;
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
        var request_time = new Date().getTime() - start_time;
        console.log('resolved in ' + request_time + 'ms');

        var enrichedjson = JSON.parse(xhr.response).data.results;
        resolve(enrichedjson);
      } else {
        console.log(xhr.statusText);
        console.log(xhr);
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);

    xhr.send(JSON.stringify(json));
  });
}

function filterTrusted(el) {
  return el.status == 'trusted';
}

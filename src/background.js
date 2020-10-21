import Config from './config/config.js';
import * as google from './config/google.js';
import * as FakeResults from './background/fakeResults.js';
var browser = require('webextension-polyfill');

var prefs = new Config(require('./config/default.json'));
console.log(prefs);

console.log('Sources de confiance v' + prefs.get('extension.version'));

applySettings();

// Check API once a day
if (moreThanXDayAgo(1)) checkAPI();

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
// @param      {<type>}  msg          The message sent by the extension
// @param      {<type>}  sender        The sender
// @param      {<type>}  sendResponse  The function to send response
//
function handleMessage(msg, sender, sendResponse) {
  console.log('>handleMessage: service=' + msg.service);

  switch (msg.service) {
    case 'config':
      switch (msg.payload.type) {
        case 'GET':
          console.log('config:GET');
          msg.payload.status = 'ok';
          msg.payload.results = {
            extension: prefs.get('extension'),
            widgets: prefs.get('widgets'),
          };
          sendResponse(msg);
          break;

        default:
          console.assert(false, 'unsupported verb=' + msg.payload.type);
      }
      break;

    case 'web':
      switch (msg.payload.type) {
        case 'ECHO':
        case 'CATEGORIZE':
          enqueue(msg.payload.searchengine, msg, sender);
          break;

        case 'GET_SERP':
          console.log('enqueueing GET_SERP');
          enqueue(msg.payload.searchengine, msg, sender);
          break;

        default:
          console.assert(false, 'unsupported verb=' + msg.payload.type);
      }
      break;

    default:
      console.assert(false, 'unsupported service=' + msg.service);
  }

  return true;
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
        // case 'ECHO':
        //   setPending(se);

        //   browser.tabs.sendMessage(m.sender.tab.id, m.msg);

        //   clearPending(se);

        //   break;

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
          if (prefs.get('useFakeResults')) {
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
  var dailyhello = { version: prefs.get('extension.version'), userAgent: window.navigator.userAgent };
  var url = prefs.get('api.version');
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Content-Type', 'data/json');
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      //LOGS FOR DEBUGGING
      var request_time = new Date().getTime() - start_time;
      console.log('API version ' + JSON.parse(xhr.response).version + ' (resolved in  ' + request_time + 'ms)');
      //console.log(JSON.parse(xhr.response));
    } else {
      console.log(xhr.statusText);
    }
  };
  xhr.onerror = () => reject(xhr.statusText);
  xhr.send(JSON.stringify(dailyhello));

  prefs.set('extension.ping_date', new Date());
}

function moreThanXDayAgo(days) {
  console.log('>moreThanXDayAgo');
  console.log(Date.parse(new Date()) - Date.parse(prefs.get('extension.ping_date', new Date())) > ((days * 24 * 60) % 60) * 1000);
  return Date.parse(new Date()) - Date.parse(prefs.get('extension.ping_date', new Date())) > ((days * 24 * 60) % 60) * 1000;
}

function applySettings(storedsettings) {
  console.log('>applySettings');

  // Set icon
  browser.browserAction.setIcon({ path: prefs.get('extension.active') ? prefs.get('extension.assets.icons.enabled') : prefs.get('extension.assets.icons.disabled') });
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
  console.log(json);
  var start_time = new Date().getTime();

  return new Promise((resolve, reject) => {
    var url = 'https://sourcesdeconfiance.org/api/trusted';
    if (json.apiserver) {
      url = json.apiserver;
      delete json.apiserver;
      delete json.type;
    }

    json.version = prefs.get('extension.version');
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

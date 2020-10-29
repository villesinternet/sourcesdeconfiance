import Config from './helpers/config.js';

import * as Sdc from './search_engines/sdc.js';
import * as Google from './search_engines/google.js';
import * as Paris from './search_engines/paris.js';
import * as Edutheque from './search_engines/edutheque.js';
import * as Canope from './search_engines/canope.js';

import * as FakeResults from './background/fakeResults.js';

var browser = require('webextension-polyfill');

global.sdcConfig = new Config(require('./config/default.json'));

console.log('Sources de confiance v' + sdcConfig.get('extension.version'));

applySettings();

// Check API once a day
if (moreThanXDayAgo(1)) checkAPI();

browser.runtime.onMessage.addListener(handleMessage);

var $SE = null; // Search Engine configuration & helpers

var services = {
  google: {
    config: sdcConfig.get('search_engines.google'),
    api: Google,
    pending: false,
    queue: [],
  },
  paris: {
    config: sdcConfig.get('search_engines.paris'),
    api: Paris,
    pending: false,
    queue: [],
  },
  edutheque: {
    config: sdcConfig.get('search_engines.edutheque'),
    api: Edutheque,
    pending: false,
    queue: [],
  },
  canope: {
    config: sdcConfig.get('search_engines.canope'),
    api: Canope,
    pending: false,
    queue: [],
  },
  sdc: {
    config: sdcConfig.get('search_engines.sdc'),
    api: Sdc,
    pending: false,
    queue: [],
  },
};

poll();

function enqueue(svc, msg, sender, sendResponse) {
  console.log('>enqueue:  ' + svc);
  if (!services[svc]) {
    console.assert(false, 'Enqueing to undefined service: ' + svc);
    return;
  }

  return services[svc].queue.push({
    msg: msg,
    sender: sender,
    sendResponse: sendResponse,
  });
}

function dequeue(svc) {
  var msg = services[svc].queue.shift();
  return msg ? msg : null;
}

function setPending(svc) {
  console.log('>setPending: ' + svc);
  services[svc].pending = true;
}

function clearPending(svc) {
  console.log('>clearPending: ' + svc);
  services[svc].pending = false;
}

function isPending(svc) {
  return services[svc].pending;
}

//
// Receving messages from the content scripts
//
// @param      {<type>}  msg          The message sent by the extension
// @param      {<type>}  sender        The sender
// @param      {<type>}  sendResponse  The function to send response
//
function handleMessage(msg, sender, sendResponse) {
  console.log('>handleMessage: service=' + msg.service + ', type=' + msg.payload.type);

  switch (msg.payload.type) {
    case 'GET_CONFIG':
      console.log('GET_CONFIG');
      msg.payload.status = 'ok';
      msg.payload.results = {
        se_widgets: sdcConfig.get('se_widgets'),
        panel: sdcConfig.get('panel'),
        extension: sdcConfig.get('extension'),
        search_engines: sdcConfig.get('search_engines'),
      };
      sendResponse(msg);
      break;

    case 'CATEGORIZE':
      enqueue('sdc', msg, sender, sendResponse);
      break;
    // case 'GET_SERP':
    //   console.log('enqueueing GET_SERP');
    //   enqueue(msg.service, msg, sender, sendResponse);
    //   break;

    case 'GET_RESULTS':
      console.log('enqueueing GET_RESULTS');
      enqueue(msg.service, msg, sender, sendResponse);
      break;

    default:
      console.assert(false, 'unsupported verb=' + msg.payload.type);
  }
  return true;
}

function poll() {
  var poll = setInterval(function() {
    for (var svc in services) {
      if (isPending(svc)) continue;

      var m = dequeue(svc);

      if (!m) continue;

      console.log('dequeued message: service=' + svc + ', type=' + m.msg.payload.type);

      switch (m.msg.payload.type) {
        case 'CATEGORIZE':
          setPending(svc);

          services[svc].api.categorize(m.msg.payload).then(
            categorizedResults => {
              console.log('got ' + categorizedResults.length + ' categorized results.');

              m.msg.payload.status = 'ok';
              m.msg.payload.results = categorizedResults;

              // browser.tabs.sendMessage(m.sender.tab.id, m.msg);
              m.sendResponse(m.msg);

              setTimeout(function() {
                clearPending(svc);
              }, services[svc].config.requestsDelay);
            },

            function(e) {
              console.log('error categorizing serp: ' + e);

              m.msg.payload.status = 'error';
              m.msg.payload.error = e;
              m.sendResponse(m.msg);

              //browser.tabs.sendMessage(m.sender.tab.id, m.msg);
              clearPending(svc);
            }
          );
          break;

        case 'GET_RESULTS':
          setPending(svc);

          // Get SERP from search engine
          services[svc].api.getSERP(m.msg.payload).then(
            function(svc, serp) {
              console.log('back from getSERP for service: ' + svc);

              this.msg.payload.status = 'ok';

              // Scrape results from SERP
              this.msg.payload.results = services[svc].api.scrape(serp);

              // Send results back to content script
              console.log('Sending ' + this.msg.payload.results.length + ' results to content script.');
              this.sendResponse(this.msg.payload);

              console.log('setting timeout :' + sdcConfig.get('search_engines')[svc].requestsDelay);
              setTimeout(() => {
                clearPending(svc);
              }, services[svc].config.requestsDelay);
            }.bind(m, svc), // Need to bind to message and svc to save them because poll() context will change when the promise is resolved

            e => {
              console.assert(false, 'Error getting results: ' + e);
              clearPending(svc);
            }
          );
          break;

        // case 'GET_SERP':
        //   if (sdcConfig.get('useFakeResults')) {
        //     console.log('useFakeResults');
        //     m.msg.payload.status = 'ok';
        //     m.msg.results = new FakeResults.get(Math.floor(Math.random() * 10));
        //     browser.tabs.sendMessage(m.sender.tab.id, m.msg);
        //     return;
        //   }

        //   // Use the provided search link if we have it
        //   var searchUrl = m.msg.payload.searchUrl;
        //   console.log('requesting search url: ' + searchUrl);

        //   setPending(se);

        //   getHTML(searchUrl, function(response) {
        //     console.log('got results:');
        //     console.log(response);

        //     m.msg.payload.results = getSEConfig(m.msg.payload.searchengine).scrape(response);
        //     m.msg.payload.status = 'ok';

        //     browser.tabs.sendMessage(m.sender.tab.id, m.msg);

        //     setTimeout(function() {
        //       clearPending(se);
        //     }, 2000);

        //   });
        //   break;

        // case 'SCRAPE':
        //    m.msg.payload.results = services[se].api.scrape(m.msg.payload.document);
        //    m.sendResponse(m.msg);
        //    break;
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
  var dailyhello = { version: sdcConfig.get('extension.version'), userAgent: window.navigator.userAgent };
  var url = sdcConfig.get('search_engine.sdc.api.version');
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

  sdcConfig.set('extension.ping_date', new Date());
}

function moreThanXDayAgo(days) {
  console.log('>moreThanXDayAgo');
  return Date.parse(new Date()) - Date.parse(sdcConfig.get('extension.ping_date', new Date())) > ((days * 24 * 60) % 60) * 1000;
}

function applySettings(storedsettings) {
  console.log('>applySettings');

  // Set icon
  browser.browserAction.setIcon({ path: sdcConfig.get('extension.active') ? sdcConfig.get('extension.assets.icons.enabled') : sdcConfig.get('extension.assets.icons.disabled') });
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

function scrape(doc, json, callback) {
  console.log('>scrape');

  json.results = $SE.scrape(doc);
  callback(json);
}

function filterTrusted(el) {
  return el.status == 'trusted';
}

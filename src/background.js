//import store from './store';
// global.browser = require('webextension-polyfill');

// alert(`Hello ${store.getters.foo}!`);

var HttpClient = function() {
  console.log('HttpClient');
  this.get = function(aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      console.log(anHttpRequest.readyState, anHttpRequest.status == 200);
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200) aCallback(anHttpRequest.responseText);
    };

    anHttpRequest.open('GET', aUrl, true);
    anHttpRequest.send(null);
  };
};

// FILTER MODULE
// Get message from inject.js and send back the enrichedjson response
//------------------------------
function handleMessage(json, sender, sendResponse) {
  console.log('Content script sent... ');
  console.log(json);

  //fake enrich JSON (to be replaced by real API call)
  var enrichedjson = json;
  for (var i = 0; i < json.length; i++) {
    if (enrichedjson[i].id == 0 || enrichedjson[i].id == 1 || enrichedjson[i].id == 2 || enrichedjson[i].id == 5) {
      enrichedjson[i].trusted = true;
    }
  }

  // TESTING API CALL
  var url = 'https://jsonplaceholder.typicode.com/posts/1'; //to be replaced by real API url.  + edit permission as well in package.json /!\
  var request = new XMLHttpRequest();
  request.open('GET', url, true); // Configure POST parameters with the real API - https://javascript.info/xmlhttprequest
  request.onload = function() {
    console.log(request.response);
    console.log(request.status);
  };
  request.send();

  sendResponse(enrichedjson); //to be replaced by real API response
}

browser.runtime.onMessage.addListener(handleMessage);

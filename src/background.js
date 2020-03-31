//import store from './store';
var browser = require('webextension-polyfill');

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
  if (json.type == 'SIGN_CONNECT') {
    return true;
  }

  if (json.type == 'GET_SERP') {
    var start_time = new Date().getTime();
    return new Promise((resolve, reject) => {
      var url = 'http://vps656318.ovh.net/api/proof'; //API url. Check matching permission in package.json /!\
      let xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'data/json');
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          var request_time = new Date().getTime() - start_time;
          console.log('resolved in ' + request_time + 'ms');
          console.log(xhr.response);
          var enrichedjson = JSON.parse(xhr.response).data.results;
          resolve(enrichedjson);
          //resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send(JSON.stringify(json));
      //FOR API MANUAL TEST
      //var testdata = {request:'test',results:[{"id":1,url:'http://www.legifrance.gouv.fr/'},{"id":1,url:'http://www.adil95.org'},{"id":2,url:'http://www.notconfident.com'},{"id":3,url:'http://www.malware.com'},{"id":4,url:'missingprotocol.com'},{"id":5,url:'malformed_url'}]};
      //xhr.send(JSON.stringify(testdata));
    });
  }

  /**
    if(json.type == "GET_SERP FAKE") { //FAKING API RESPONSE (with a false promise and static trusted elements)
      var enrichedjson = json.results;
      for (var i = 0; i < json.results.length; i++) {
      if (enrichedjson[i].id == 0 || enrichedjson[i].id == 1 || enrichedjson[i].id == 4 || enrichedjson[i].id == 7 || enrichedjson[i].id == 14 || enrichedjson[i].id == 15 || enrichedjson[i].id == 16) {
          enrichedjson[i].status = "trusted";
        }
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(enrichedjson);
        }, 1000);
      });
    }
    */
}

browser.runtime.onMessage.addListener(handleMessage);

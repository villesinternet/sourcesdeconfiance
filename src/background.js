var browser = require('webextension-polyfill');

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
      //var url = 'http://vps656318.ovh.net/api/proof';
      var url = 'http://vps656318.ovh.net/api/trusted'; //API url. Check matching permission in package.json /!\
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
          resolve(enrichedjson);
        } else {
          console.log(xhr.statusText);
          reject(xhr.statusText);
        }
      };
      console.log(JSON.stringify(json));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send(JSON.stringify(json));
      //FOR API MANUAL TEST
      //var testdata = {request:'test',results:[{"id":1,url:'http://www.legifrance.gouv.fr/'},{"id":1,url:'http://www.adil95.org'},{"id":2,url:'http://www.adil95.org/subpage.html'},{"id":3,url:'http://www.malware.com'},{"id":4,url:'missingprotocol.com'},{"id":5,url:'malformed_url'}]};
      //xhr.send(JSON.stringify(testdata));
    });
  }

  //FAKING API RESPONSE (with a false promise and static trusted elements)
  /*
  if (json.type == 'GET_SERP FAKE') {
    var enrichedjson = json.results;
    for (var i = 0; i < json.results.length; i++) {
      if (
        /^.*\.gouv\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*\.ars\.sante\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*adil.*\.org.*$/.test(enrichedjson[i].url) ||
        /^.*anil\.org.*$/.test(enrichedjson[i].url) ||
        /^.*beauvais\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*grenoble\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*grenoblealpesmetropole\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*univ-grenoble-alpes\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*isere\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*service-public\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*vie-publique\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*cergy\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*valdoise\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*grenoble-tourisme\.com.*$/.test(enrichedjson[i].url) ||
        /^.*paris\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*santepubliquefrance\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*gouvernement\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*has-sante\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*aphp\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*aide-sociale\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*caf\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*cergypontoise\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*valdoisehabitat\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*villiers-le-bel\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*persan\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*pontoise\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*ezanville\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*ville-soa\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*justice\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*tribunal-administratif\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*saintgermainbouclesdeseine\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*inserm\.fr.*$/.test(enrichedjson[i].url) ||
        /^.*hcsp\.fr.*$/.test(enrichedjson[i].url)

      ) {
        console.log(enrichedjson[i].url);
        console.log();
        enrichedjson[i].status = 'trusted';
      }
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(enrichedjson);
      }, 250);
    });
  }
*/
}

browser.runtime.onMessage.addListener(handleMessage);

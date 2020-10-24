import * as helpers from '../helpers/general.js';

export var name = 'sdc';

export function categorize(results) {
  console.log('>' + name + '@categorize:');

  var start_time = new Date().getTime();

  return new Promise((resolve, reject) => {
    var url = global.sdcConfig.get('search_engines.sdc.api.trusted');
    console.log('Url= ' + url);

    // if (results.apiserver) {
    //   url = json.apiserver;
    //   delete json.apiserver;
    //   delete json.type;
    // }

    results.version = sdcConfig.get('extension.version');
    results.searchengine = 'google';

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

    xhr.send(JSON.stringify(results));
  });
}

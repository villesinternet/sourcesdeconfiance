import * as helpers from '../helpers/general.js';
import algoliasearch from 'algoliasearch/lite';

export const name = 'edutheque';
//const searchUrl = 'https://www.paris.fr/recherche';

/**
 * Extract results from the the Algolia API
 * @param  Object   results
 * @return Array     Extracted result objects array w/
 *                             id
 *                             url
 *                             name (title)
 *                             snippet (web page exerpt)
 */
export function scrape(doc) {
  console.log('>edutheque@scrape');

  var results = [];

  const elements = doc.getElementsByClassName('results-entry');
  console.assert(elements, 'Could not find results-entry elements');
  console.log(elements);

  for (var i = 0; i < elements.length; i++) {
    var url = elements[i].getElementsByTagName('a')[0];
    var name = elements[i].getElementsByTagName('a')[0];
    var snippet = elements[i].getElementsByClassName('result-content')[0];
    console.assert(name, 'Could not find the name');
    console.assert(url, 'Could not find the url');
    console.assert(snippet, 'Could not find the snippet');
    results.push({
      id: i,
      url: url ? url.href : '',
      name: name ? name.textContent : '',
      snippet: snippet ? snippet.textContent : '',
    });
  }
  return results;
}

export function getSERP(payload) {
  console.log(`>${name}@getSERP`);

  // if (sdcConfig.get('useFakeResults')) {
  //   console.log('useFakeResults');
  //   payload.status = 'ok';
  //   return new FakeResults.get(Math.floor(Math.random() * 10));
  // }

  console.log('requesting search url: ' + payload.searchUrl);

  //return fetch(payload.searchUrl);
  return new Promise((resolve, reject) => {
    // Feature detection
    if (!window.XMLHttpRequest) {
      reject('!window.XMLHttpRequest');
      return;
    }

    // Create new request
    var xhr = new XMLHttpRequest();

    // Setup callback
    xhr.onload = () => {
      resolve(xhr.responseXML);
    };

    xhr.onerror = () => {
      console.log('Error: (' + xhr.status + ') ' + xhr.statusText);
      reject(xhr.statusText);
    };

    // Get the HTML
    xhr.open('GET', payload.searchUrl);
    xhr.responseType = 'document';
    xhr.send();
  });
}

/**
 * Create a search url list for a given query
 *
 * @param      {string}  searchWords  The search words
 * @return     {Array}   List of search links
 */
export function buildSearchUrl(searchWords, start, num) {
  console.log('Edutheque@buildSearchUrl: searchWords=' + searchWords + ', start=' + start + ', num=' + num);
  console.log('search_engines.edutheque.resultsPerPage= ' + sdcConfig.get('search_engines.edutheque.resultsPerPage'));
  return 'https://www.edutheque.fr/resultats-de-la-recherche.html?' + 'tx_solr[q]=' + searchWords; // + '&tx_solr[page]=' + Math.floor(start / global.sdcConfig.get("search_engines.edutheque.resultsPerPage");
}
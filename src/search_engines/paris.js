import * as helpers from '../helpers/general.js';
import algoliasearch from 'algoliasearch/lite';

export const name = 'paris';
//const searchUrl = 'https://www.paris.fr/recherche';

const algoliaClient = algoliasearch('HYSDQZJFVK', 'YzI0YmUyM2Q0YjQ1N2E3ZDk2ZjVkNzdiNDYzOTMyMWE1MDEwOTcwZmRiYTEyY2UzNWRjOTc5NTk4ZGFhMzMzMmZpbHRlcnM9bWFpcmllX2lkJTNBZ2xvYmFs');
const algoliaIndex = algoliaClient.initIndex('Content_production');

/**
 * Extract results from the the Algolia API
 * @param  Object   results
 * @return Array     Extracted result objects array w/
 *                             id
 *                             url
 *                             name (title)
 *                             snippet (web page exerpt)
 */
export function scrape(results) {
  console.log('>' + name + '@scrape');

  var scraped = [];

  for (var i = 0; i < results.hits.length; i++) {
    scraped.push({
      id: i,
      url: 'https://www.paris.fr' + results.hits[i].path,
      title: results.hits[i].title,
      snippet: results.hits[i].lead_text,
      image: results.hits[i].image,
    });
  }

  return scraped;
}

export function getSERP(payload) {
  // // Get the Algolia search
  // var url = "https://hysdqzjfvk-dsn.algolia.net/1/indexes/*/queries?" +
  //   "x-algolia-agent=Algolia+for+JavaScript+%283.35.1%29%3B+Browser+%28lite%29%3B+instantsearch.js+%283.7.0%29%3B+JS+Helper+%282.28.1%29" +
  //   "&x-algolia-application-id=HYSDQZJFVK" +
  //   "&x-algolia-api-key=YzI0YmUyM2Q0YjQ1N2E3ZDk2ZjVkNzdiNDYzOTMyMWE1MDEwOTcwZmRiYTEyY2UzNWRjOTc5NTk4ZGFhMzMzMmZpbHRlcnM9bWFpcmllX2lkJTNBZ2xvYmFs";
  // xhr.open('POST', url);
  // xhr.responseType = 'document';
  // xhr.send('{"requests":[{"indexName":"Content_production","params":"query=paris&hitsPerPage=100&page=0&highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&facets=%5B%22format%22%5D&tagFilters="}]}');
  return algoliaIndex.search(payload.searchWords);
}

// Gets the query string from the current page
//
// @return     {<type>}  The query string.
//
export function getSearchWords() {
  console.log('>' + name + '@getSearchWords');
  console.assert(false, name + '@getSearchWords not implemented');
  return null;
}

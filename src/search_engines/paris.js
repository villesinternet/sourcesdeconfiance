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
      name: results.hits[i].title,
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
//
// Gets the query string from the current page
//
// @return     {<type>}  The query string.
//
export function getSearchWords() {
  console.log('>' + name + '@getSearchWords');
  console.assert(false, name + '@getSearchWords not implemented');
  return null;
}

// export function buildSearchUrl(searchWords, page) {
//   console.log('>' + name + '@buildSearchUrl');
//   return encodeURI('https://www.paris.fr/recherche?'
//     + 'query=' + searchWords
//     + page ? "&page=" + page : ""
//     );
// }

//
// Build links table based on the current query
//
// @return     {Array}  The search urls
//
// export function getSearchLinks(searchWords) {
//   console.log('>' + name + '@getSearchLinks');

//   // --- Strategy generating links
//   // -------------------------------------------
//   //
//   //
//   var links = [];

//   var firstResultIndex = 0;
//   var currentResultsCount = 0;

//   var url = new URL(searchUrl);

//   const maxResults = global.sdcConfig.get("search_engines.paris.maxResults");
//   const maxResultsPerRequest = global.sdcConfig.get("search_engines.paris.maxResultsPerRequest");

//   var index = 0;

//   url.searchParams.set('query', searchWords);
//   while (index < maxResults) {
//     var count = Math.min(maxResultsPerRequest, maxResults - index);
//     //url.searchParams.set('num', count);
//     url.searchParams.set('page', Math.floor(index / maxResultsPerRequest)+1);
//     var searchLink = url.toString();
//     links.push(url.toString());
//     index += count;
//   }

//   return links;
// }

/**
 * Create a search url list for a given query
 *
 * @param      {string}  searchWords  The search words
 * @return     {Array}   List of search links
 */
// export function createSearchLinks(searchWords) {
//   var links = [];

//   var index = 0;
//   while (index < 200) {
//     links.push('https://www.google.fr/search?' + 'q=' + searchWords + '&start=' + index + '&num=' + 100);
//     index += Math.min(100, 200 - index);
//   }
//   return links;
// }

//
// Create SDC panel DOM div & return it
//
// @return     div  frameDiv Element
//
export function createPanelFrame() {
  var frameDiv = document.createElement('div');
  document.getElementById('cnt').insertBefore(frameDiv, null);
  return frameDiv;
}

/**
 * Html snippet for the tab title
 *
 * @param      {string}   title   Tab title
 * @param      {boolean}  active  active tab or not
 * @return     {string}   { description_of_the_return_value }
 */
function tabHTML(title, active) {
  var html =
    '<span class="HF9Klc iJddsb" style="height:16px;width:16px">' + '<img src="' + helpers.asset(active ? 'icons/sdc-12.png' : 'icons/sdc-off-12.png') + '">' + '</span>' + title;

  return html;
}

/**
 * Creates the tab element (div)
 *
 * @param      boolean active  should the tab be active or not
 * @return     div  the div DOM element
 */
function createTabElement(active) {
  console.log('>createTabElement: ' + global.prefs);
  // Create the menu DOM element
  var tab = document.createElement('div');
  tab.setAttribute('class', 'hdtb-mitem hdtb-imb');
  tab.innerHTML = tabHTML(global.prefs ? global.sdcConfig.get('widgets.se_toolbar.title') : '<no title>', active);

  return tab;
}

/**
 * Shows/Hide the frame.
 *
 * @param      boolean  active  Should the fram we active or not
 */
function showFrame(active) {
  // Works by hiding all uneeded frames from the Google interface
  document.getElementById('appbar').style.display = active ? 'none' : '';
  document.getElementById('atvcap').style.display = active ? 'none' : '';
  document.getElementById('rcnt').style.display = active ? 'none' : '';
  document.getElementById('footcnt').style.display = active ? 'none' : '';
  document.getElementById('xfootw').style.display = active ? 'none' : '';
}

/**
 * refresh Tab title
 *
 * @param      string  title   Teh tab title
 */
export function refreshTitle(title) {
  menu.el.innerHTML = tabHTML(title, menu.isActive);
}

// Create SDC menu item
// export function injectMenuItem(el, signalFrame) {
export function injectMenuItem(signalFrame) {
  console.log('>google:injectMenuItem');

  menu.el = createTabElement(false);

  // Insert in google's menu bar
  var toolbar = document.getElementById('hdtb-msb-vis');
  toolbar.insertBefore(menu.el, toolbar.children[1]);

  // Insert a listener for all google tb items
  for (let el of document.getElementById('hdtb-msb-vis').getElementsByTagName('div')) {
    el.addEventListener('click', function(e) {
      // If we're here, a Google toolbar menut item has been clicked
      console.log('>google:toolbar');

      // Is this SdC toolbar item?
      menu.isActive = menu.el.contains(e.target);

      // Set proper icon for the SdC tab
      if (menu.isActive) menu.el.getElementsByTagName('img')[0].setAttribute('src', helpers.asset('icons/sdc-12.png'));
      else menu.el.getElementsByTagName('img')[0].setAttribute('src', helpers.asset('icons/sdc-off-12.png'));

      // Update menu bar
      for (let el of document.getElementById('hdtb-msb-vis').getElementsByTagName('div'))
        if (el.contains(e.target)) el.classList.add('hdtb-msel');
        else el.classList.remove('hdtb-msel');

      // Hide or show all elements needed for SdC frame display
      showFrame(menu.isActive);

      // Signal the Frame of the change
      signalFrame(menu.isActive);
    });
  }
}

// Highlight results in home page
export function highlight(enrichedjson) {
  console.log('>' + name + '@ghighlight');
  console.assert(false, name + '@ghighlight not implemented');
  return null;
}

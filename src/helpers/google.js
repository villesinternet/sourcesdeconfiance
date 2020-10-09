import Vue from 'vue';
import * as helpers from '../helpers/general.js';

// This is our menu control object
var menu = {
  el: createTabElement(false), // Create the DOM element
  isActive: false,
};

/**
 * Extract results from the the document's SERP
 * @param  HTMLDocument doc [description]
 * @return Array     Extracted result objects array w/
 *                             id
 *                             url
 *                             name (title)
 *                             snippet (web page exerpt)
 */
export function extractFromSERP(doc) {
  var results = [];

  const elements = doc.getElementsByClassName('rc');
  console.assert(elements, 'Could not find rc class elements');

  for (var i = 0; i < elements.length; i++) {
    var url = elements[i].getElementsByTagName('a')[0];
    var name = elements[i].getElementsByTagName('h3')[0];
    var snippet = elements[i].children[1];
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

//
// Gets the query string from the current page
//
// @return     {<type>}  The query string.
//
export function getSearchWords() {
  console.log('>getSearchWords: ' + document.getElementsByName('q')[0].value);
  return document.getElementsByName('q')[0].value;
}

export function buildSearchUrl(searchWords) {
  return encodeURI('https://www.google.fr/search?' + 'q=' + searchWords);
}

//
// Build links table based on the current query
//
// @return     {Array}  The search urls
//
export function getSearchLinks() {
  console.log('>getSearchLinks');

  // --- Strategy using links at bottom of the current SERP
  // ------------------------------------------------------
  //
  //var links = [window.location.href];

  // Read the search pages from the footer
  // var refs = document.getElementById('foot').getElementsByClassName('fl');
  // for (var l = 0; l < refs.length; l++) {
  //   links.push(refs[l].href);
  // }

  // --- Strategy generating links
  // -------------------------------------------
  //
  //
  // Add current link
  // var links = [window.location.href];
  var links = [];

  var url = new URL(window.location.href);

  var firstResultIndex = url.searchParams.get('start');
  firstResultIndex = firstResultIndex ? parseInt(firstResultIndex) : 0;
  var currentResultsCount = document.getElementsByClassName('rc').length + document.getElementsByClassName('kp-wholepage').length;

  url.searchParams.set('q', getSearchWords());

  // Create the links for results before the current SERP
  var index = 0;
  while (index < firstResultIndex) {
    var count = Math.min(firstResultIndex, 100);
    url.searchParams.set('num', count);
    url.searchParams.set('start', index);
    links.push(url.toString());
    index += count;
  }

  // Skip current search link
  index += currentResultsCount;

  // Create the links for the remaining results
  while (index < 200) {
    var count = Math.min(100, 200 - index);
    url.searchParams.set('num', count);
    url.searchParams.set('start', index);
    var searchLink = url.toString();
    links.push(url.toString());
    index += count;
  }

  return links;
}

/**
 * Create a search url list for a given query
 *
 * @param      {string}  searchWords  The search words
 * @return     {Array}   List of search links
 */
export function createSearchLinks(searchWords) {
  var links = [];

  var index = 0;
  while (index < 200) {
    links.push('https://www.google.fr/search?' + 'q=' + searchWords + '&start=' + index + '&num=' + 100);
    index += Math.min(100, 200 - index);
  }
  return links;
}

//
// Create SDC panel DOM div & return it
//
// @return     div  frameDiv Element
//
export function injectFrame() {
  var frameDiv = document.createElement('div');
  document.getElementById('cnt').append(frameDiv);
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
  // Create the menu DOM element
  var tab = document.createElement('div');
  tab.setAttribute('class', 'hdtb-mitem hdtb-imb');
  tab.innerHTML = tabHTML('Sources de Confiance', active);

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
  const resultslist = document.getElementsByClassName('g');

  //check if it is the first result page, to apply specific style to the first result entry
  var firstresult;
  if (window.location.href.indexOf('&start=0') != -1) {
    firstresult = true;
  } else if (window.location.href.indexOf('?start=') != -1) {
    firstresult = false;
  } else if (window.location.href.indexOf('&start=') != -1) {
    firstresult = false;
  } else {
    firstresult = true;
  }

  for (var i = 0; i < enrichedjson.length; i++) {
    if (enrichedjson[i].status != 'trusted') continue;

    resultslist[enrichedjson[i].id].classList.add('trusted');

    if (firstresult) {
      resultslist[enrichedjson[i].id].classList.add('trustedfirst');
      resultslist[enrichedjson[i].id].classList.add('tooltip');
      var para = document.createElement('span');
      para.classList.add('tooltiptext');
      para.appendChild(document.createTextNode('Source de confiance '));
      let newNode = resultslist[enrichedjson[i].id];
      newNode.appendChild(para);
      var parentDiv = document.getElementById('rso');
      var firstChildNode = document.getElementById('rso').firstElementChild;
      parentDiv.insertBefore(newNode, firstChildNode);
      firstresult = false;
      if (resultslist[enrichedjson[i].id].classList.contains('g-blk')) {
        //styling - only if the first trusted result is a special box mnr-c g-blk - could be improved
        resultslist[enrichedjson[i].id].classList.remove('trustedfirst');
        resultslist[enrichedjson[i].id].classList.add('trusted');
      }
    }
  }
}

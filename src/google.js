import * as SDC from './SDC.js';

console.log('Google SDC instance creation');

// Search Engine description
var google = {
  name: 'google',
  getSearchLinks: getSearchLinks,
  injectSDC: injectSDC,
  injectMenuItem: injectMenuItem,
};

// Menu management variables
var menu = {
  el: null, // Our item DOM element
  isActive: false, // Status
  googleELs: [],
};

// We only need to run SDC on the "All" Google pane (not images, news, etc)
var search = new URLSearchParams(window.location.search);
if (search.get('tbm')) {
  console.log('not launching. tbm=' + search.get('tbm'));
  // Break here
} else {
  // And... off we go !
  SDC.run(google);
}

// Utility function to list the additional search pages we can scrap
function getSearchLinks() {
  console.log('>getSearchLinks');

  var links = [window.location.href];

  // Read the search pages from the footer
  var refs = document.getElementById('foot').getElementsByClassName('fl');
  for (var l = 0; l < refs.length; l++) {
    links.push(refs[l].href);
  }
  return links;
}

// Create SDC DOM Element & return it
function injectSDC() {
  var frameDiv = document.createElement('div');
  document.getElementById('cnt').append(frameDiv);
  return frameDiv;
}

// Create SDC menu item
function injectMenuItem(el, callback) {
  console.log('>google:injectMenuItem');

  // Store the menu DOM element
  menu.el = el;

  // Insert in google's menu bar
  var menuBar = document.getElementById('hdtb-msb-vis');
  menuBar.insertBefore(menu.el, menuBar.children[1]);

  // Insert a listener for all google tb items
  for (let el of document.getElementById('hdtb-msb-vis').getElementsByTagName('div'))
    el.addEventListener('click', function(e) {
      // If we're here, a Google toolbar menut item has been clicked

      // Is this for us?
      if (menu.el.contains(e.target)) menu.isActive = true;
      else menu.isActive = false;

      // Hide or show all elements needef
      document.getElementById('appbar').style.display = menu.isActive ? 'none' : '';
      document.getElementById('atvcap').style.display = menu.isActive ? 'none' : '';
      document.getElementById('rcnt').style.display = menu.isActive ? 'none' : '';
      document.getElementById('footcnt').style.display = menu.isActive ? 'none' : '';
      document.getElementById('xfootw').style.display = menu.isActive ? 'none' : '';

      // Update menu bar
      for (let el of document.getElementById('hdtb-msb-vis').getElementsByTagName('div')) el.classList.remove('hdtb-msel');
      if (menu.isActive) menu.el.classList.add('hdtb-msel');
      else e.target.classList.add('hdtb-msel');

      // Signal the Frame of the change
      callback(menu.isActive);
    });
}

import Vue from 'vue';

//Extract results from the the document's SERP
export function extractFromSERP(doc) {
  console.log('>extractFromSERP');

  const elements = doc.getElementsByClassName('g');
  var results = [];
  for (var i = 0; i < elements.length; i++) {
    var el = elements[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
    if (el.length > 0 && !elements[i].classList.contains('kno-kp')) {
      //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
      var url = elements[i].querySelector('.rc a').href;
      var name = elements[i].querySelector('.rc .r a h3').textContent;
      var snippet = elements[i].querySelector('.rc .s .st') ? elements[i].querySelector('.rc .s .st').textContent : '';
      results.push({
        id: i,
        url: url,
        name: name,
        snippet: snippet,
      });
    }
  }

  return results;
}

// Utility function to list the additional search pages we can scrap
export function getSearchLinks() {
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
export function injectSDC() {
  var frameDiv = document.createElement('div');
  document.getElementById('cnt').append(frameDiv);
  return frameDiv;
}

// Create SDC menu item
export function injectMenuItem(el, signalFrame) {
  console.log('>google:injectMenuItem');
  console.log(signalFrame);

  var menu = Vue.prototype.$SE.menu;

  // Store the menu DOM element
  menu.el = el;

  // Insert in google's menu bar
  var menuBar = document.getElementById('hdtb-msb-vis');
  menuBar.insertBefore(menu.el, menuBar.children[1]);

  // Insert a listener for all google tb items
  for (let el of document.getElementById('hdtb-msb-vis').getElementsByTagName('div'))
    el.addEventListener('click', function(e) {
      console.log('>google:toolbar');
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
      signalFrame(menu.isActive);
    });
}
import Vue from 'vue';
import sdcTab from '../sdcTab';
import sdcFrame from '../sdcFrame';

console.log('SDC Google instance creation');

Vue.prototype.$searchEngine = 'google';

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
Vue.prototype.$getSearchLinks = getSearchLinks;

const frameDiv = document.createElement('div');
document.getElementById('cnt').append(frameDiv);
var frameVue = new Vue({
  el: frameDiv,
  render: h => {
    return h(sdcFrame);
  },
});

// // Then the menu Tab
// const menuDiv = document.createElement('div');
// document.getElementById('hdtb-msb-vis').append(menuDiv);
// var tabVue = new Vue({
//   el: menuDiv,
//   render: h => {
//     return h(sdcTab, {
//       props: {
//         frameVue: frameVue,
//       },
//     });
//   },
// });

var browser = require('webextension-polyfill');

const getStoredSettings = browser.storage.local.get();
getStoredSettings.then(getSerp, onError);
function onError(e) {
  console.error('Error: ' + e);
}
console.log('google.js');

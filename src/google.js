import Vue from 'vue';
import sdcTab from './sdcTab';
import sdcFrame from './sdcFrame';

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
  console.error(e);
}
console.log('google.js');

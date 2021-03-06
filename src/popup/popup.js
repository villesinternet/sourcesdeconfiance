import Vue from 'vue';
import App from './App';
import store from '../store';
import router from './router';

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});

function onError(e) {
  console.error(e);
}

function checkStoredSettings(storedsettings) {
  if (!storedsettings.extensionswitch) {
    document.querySelector('#extensionswitch').checked = true;
    document.querySelector('#switchstatus').textContent = '';
    browser.browserAction.setIcon({ path: '../assets/icons/sdc-48.png' });
  } else if (storedsettings.extensionswitch == 'off') {
    document.querySelector('#extensionswitch').checked = false;
    document.querySelector('#switchstatus').textContent = 'extension désactivée, cliquez pour la réactiver';
    browser.browserAction.setIcon({ path: '../assets/icons/sdc-off-48.png' });
  } else {
    document.querySelector('#extensionswitch').checked = true;
    document.querySelector('#switchstatus').textContent = '';
    browser.browserAction.setIcon({ path: '../assets/icons/sdc-48.png' });
  }
}

function switchOn(storedsettings) {
  storedsettings.extensionswitch = 'on';
  browser.storage.local.set(storedsettings);
}

function switchOff(storedsettings) {
  storedsettings.extensionswitch = 'off';
  browser.storage.local.set(storedsettings);
}

document.addEventListener('DOMContentLoaded', function() {
  var checkbox = document.querySelector('#extensionswitch');
  const getStoredSettings = browser.storage.local.get();
  getStoredSettings.then(checkStoredSettings, onError);
  checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
      getStoredSettings.then(switchOn, onError);
      document.querySelector('#switchstatus').textContent = '';
      browser.browserAction.setIcon({ path: '../assets/icons/sdc-48.png' });
    } else {
      getStoredSettings.then(switchOff, onError);
      document.querySelector('#switchstatus').textContent = 'extension désactivée, cliquez pour la réactiver';
      browser.browserAction.setIcon({ path: '../assets/icons/sdc-off-48.png' });
    }
  });
});

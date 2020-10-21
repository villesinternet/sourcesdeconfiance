import Vue from 'vue';
import Config from './config/config.js';

import panel from './panel';

import * as comms from './helpers/comms.js';

export var prefs = null;

export function run(searchEngine) {
  console.log('>SDC:run');

  // initiliazes comms between content and backgroudn scripts
  comms.init();

  // Register confing service
  comms.register('config', fromBackgroundConfig);

  // Get initiali config
  comms.toBackground('config', { type: 'GET' }).then(
    prefs => {
      console.log('>ready');

      // Creates Config object in global var so that is can be accessed with dot notation
      global.sdcConfig = new Config(prefs.payload.results);
      console.log(global.sdcConfig.get('widgets.se_toolbar.title'));
      // And start the whole system

      // What SE are we coming from
      Vue.prototype.$SE = searchEngine;

      // The panel where everything will be displayed
      var panelDiv = searchEngine.createPanelFrame();
      var frameVue = new Vue({
        el: panelDiv,
        render: h => {
          return h(panel);
        },
      });
    },
    e => console.log('Error reading config: ' + e)
  );
}

function fromBackgroundConfig() {
  console.log('>fromBackgroundConfig');
}

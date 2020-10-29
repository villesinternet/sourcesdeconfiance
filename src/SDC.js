import Vue from 'vue';

import Config from './helpers/config.js';
import * as comms from './helpers/comms.js';

import Panel from './components/panel.vue';

export var prefs = null;

export function run(searchEngine) {
  console.log('>SDC:run');

  // initiliazes comms between content and backgroudn scripts
  comms.init();

  // Register confing service
  //comms.register('config', fromBackgroundConfig);

  // Get initiali config
  comms.toBackground('config', { type: 'GET_CONFIG' }).then(
    conf => {
      console.log('>got config');
      console.log(conf);

      // Creates Config object in global var so that is can be accessed with dot notation
      global.sdcConfig = new Config(conf.payload.results);
      console.log(global.sdcConfig);

      // What SE are we coming from
      Vue.prototype.$SE = searchEngine;

      // The panel where everything will be displayed
      var panelDiv = searchEngine.createPanelFrame();
      var frameVue = new Vue({
        el: panelDiv,
        render: h => {
          return h(Panel);
        },
      });
    },
    e => console.log('Error reading config: ' + e)
  );
}

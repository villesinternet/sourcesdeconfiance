import Vue from 'vue';
import panel from './panel';
import * as comms from './helpers/comms.js';

export function run(searchEngine) {
  console.log('>SDC:run');

  // initiliazes comms between content and backgroudn scripts
  comms.init();

  // Global data related to the search engine
  Vue.prototype.$SE = searchEngine;

  var panelDiv = searchEngine.injectFrame();
  var frameVue = new Vue({
    el: panelDiv,
    render: h => {
      return h(panel);
    },
  });
}

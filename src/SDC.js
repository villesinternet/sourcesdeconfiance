import Vue from 'vue';
import sdcFrame from './frame';

export function run(searchEngine) {
  console.log('>SDC:run');

  var frameDiv = searchEngine.injectFrame();

  // Global data related to the search engine
  Vue.prototype.$SE = searchEngine;

  var frameVue = new Vue({
    el: frameDiv,
    render: h => {
      return h(sdcFrame);
    },
  });
}

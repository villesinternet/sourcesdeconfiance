import Vue from 'vue';
//import sdcTab from './tab';
import sdcFrame from './frame';

export function run(searchEngine) {
  console.log('>SDC:run');

  var frameDiv = searchEngine.injectSDC();

  // Global data related to the search engine
  Vue.prototype.$searchEngine = searchEngine;

  var frameVue = new Vue({
    el: frameDiv,
    render: h => {
      return h(sdcFrame);
    },
  });
}

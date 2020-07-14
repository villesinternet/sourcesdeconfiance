<template>
  <div id="app">
    <!-- <Nav class="mb-6" /> -->

    <!--     <button type="button" class="sdc-btn" @click="showModal">
      Open Modal!
    </button> -->

    <!--     <modal v-show="isModalVisible" @close="closeModal" /> -->
    <div class="sdc-container sdc-mx-auto">
      <div class="sdc-mt-4 sdc-border sdc-border-gray-400 sdc-rounded">
        <div class="sdc-p-2">
          <img class="sdc-h-6" :src="this.asset('logos/sdc-gray-text.png')" alt="Logo Sources de Confiance" />
        </div>

        <div class="sdc-px-2 sdc-pb-2 sdc-text-gray-500 sdc-text-s">{{ this.resultsCount }} résultats de confiance</div>

        <Result v-for="result in results" :key="result.url" :result="result" class="sdc-p-2" />
      </div>
    </div>
  </div>
</template>

<script>
// Components
import Result from './components/Result.vue';

// Load SERP highlighting styles
import styles from './assets/styles/google_highlight.css';

export default {
  name: 'SdC',

  components: {
    Result,
  },

  props: {
    // Maximum search engine requests
    maxRequests: {
      type: Number,
      default: 2,
    },

    // Results per Trusted pages
    resultsPerPage: {
      type: Number,
      default: 10,
    },
  },

  data() {
    return {
      // --- TODO: need to load data frol storage. Better located in created function
      storedSettings: {
        extensionSwitch: true,
        apiserver: 'https://sourcesdeconfiance.org/api/trusted',
      },

      queryString: null,
      results: [],

      seCountRequests: 0,
      seStartResult: 0,
      seResultsPerPage: 10,
      seCurrentPage: 1,

      interval: null,
    };
  },

  mounted: function() {
    // `this` points to the vm instance

    console.log('mounted:');
    var browser = require('webextension-polyfill');

    // Handler for all messages coming from background.js (and the others)
    browser.runtime.onMessage.addListener(this.handleMessage);

    this.queryString = document.getElementsByName('q')[0].value;

    // First results
    // Extract the first results from the SERP we have been activated for
    var resultjson = this.extractFirstResults();

    // Calculate results per page
    if (window.location.href.indexOf('?start=') != -1 || window.location.href.indexOf('&start=') != -1) {
      var url = new URL(window.location.href);
      this.startResult = parseInt(url.searchParams.get('start'));
      this.currentPage = 1 + this.seStartResult / this.sdResultsPerPage;
    }
    var resultsLength = document.querySelectorAll('.g .rc').length;
    if (this.seCurrentPage == 1 && resultsLength > 10) {
      //quickfix for first SERP results number variable due to knowledge boxes
      this.seResultsPerPage = Math.round(resultsLength / 10) * 10;
    }

    // Now, get trusted results
    var requestjson = {
      request: this.queryString,
      results: resultjson,
      userAgent: window.navigator.userAgent,
      apiserver: this.storedSettings.apiserver,
      searchengine: 'google',
      resultsPerPage: this.seResultsPerPage,
      currentPage: this.seCurrentPage,
      nextResultIndex: this.seNextResultIndex,
      type: 'GET_SERP',
    };

    // And notify background page, which will callback handleMessage
    browser.runtime.sendMessage(requestjson);

    // Now work on page 2 and others if needed
    this.collectRemainingResults();
  },

  computed: {
    resultsCount: function() {
      return this.results.length;
    },

    seNextResultIndex: function() {
      return this.resultsPerPage + this.startResult;
    },
  },

  methods: {
    extractFirstResults: function() {
      const resultslist = document.getElementsByClassName('g');
      var resultjson = [];
      for (var i = 0; i < resultslist.length; i++) {
        var el = resultslist[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
        if (el.length > 0 && !resultslist[i].classList.contains('kno-kp')) {
          //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
          var url = resultslist[i].querySelector('.rc a').href;
          var name = resultslist[i].querySelector('.rc .r a h3').textContent;
          var snippet = resultslist[i].querySelector('.rc .s .st') ? resultslist[i].querySelector('.rc .s .st').textContent : '';
          resultjson.push({
            id: i,
            url: url,
            name: name,
            snippet: snippet,
          });
        }
      }
      return resultjson;
    },

    collectRemainingResults: function() {
      this.interval = setInterval(
        function() {
          console.log(`countRequests: ${this.seCountRequests}`);

          console.log('startResult ' + this.seStartResult);
          console.log('resultsPerPage : ' + this.seResultsPerPage);
          console.log('currentPage : ' + this.seCurrentPage);
          console.log('Next result index : ' + this.seNextResultIndex);

          var testjson = {
            request: this.queryString,
            userAgent: window.navigator.userAgent,
            apiserver: this.storedSettings.apiserver,
            searchengine: 'google',
            resultsPerPage: this.seResultsPerPage,
            currentPage: this.seCurrentPage,
            nextResultIndex: this.seNextResultIndex,
            type: 'GET_NEXT_RESULTS',
          };
          browser.runtime.sendMessage(testjson);

          this.seCountRequests++;
          if (this.seCountRequests >= this.maxRequests) clearInterval(this.interval);
        }.bind(this),
        500
      );
    },

    filterTrusted: function(el) {
      return el.status == 'trusted';
    },

    handleMessage: function(request, sender, sendResponse) {
      console.log('handleMessage: request.message=' + request.message);

      switch (request.message) {
        case 'HIGHLIGHT':
          this.results = request.json;
          this.seCountRequests = 1;
          this.highlight(request.json);
          break;

        case 'NEXT_RESULTS':
          console.log('Next results :');
          console.log(request.json);
          console.log('Next trusted results :');
          console.log(request.json.filter(this.filterTrusted));
          this.results = this.results.concat(request.json.filter(this.filterTrusted));
          break;

        case 'KB_DELIB':
          console.log('Deliberations :');
          console.log(request.json.filter(this.filterTrusted));
          break;

        case 'KB_LOI':
          console.log('Lois :');
          console.log(request.json.filter(this.filterTrusted));
          break;

        case 'KB_GOUV':
          console.log('Gouv :');
          console.log(request.json.filter(this.filterTrusted));
          break;
      }
    },

    highlight: function(enrichedjson) {
      const resultslist = document.getElementsByClassName('g');
      //check if it is the first result page, to apply specific style to the first result entry
      if (window.location.href.indexOf('&start=0') != -1) {
        firstresult = true;
      } else if (window.location.href.indexOf('?start=') != -1) {
        firstresult = false;
      } else if (window.location.href.indexOf('&start=') != -1) {
        firstresult = false;
      } else {
        var firstresult = true;
      }

      for (var i = 0; i < enrichedjson.length; i++) {
        if (enrichedjson[i].status == 'trusted') {
          resultslist[enrichedjson[i].id].classList.add('trusted');

          if (firstresult) {
            resultslist[enrichedjson[i].id].classList.add('trustedfirst');
            resultslist[enrichedjson[i].id].classList.add('tooltip');
            var para = document.createElement('span');
            para.classList.add('tooltiptext');
            para.appendChild(document.createTextNode('Source de confiance '));
            let newNode = resultslist[enrichedjson[i].id];
            newNode.appendChild(para);
            var parentDiv = document.getElementById('rso');
            var firstChildNode = document.getElementById('rso').firstElementChild;
            parentDiv.insertBefore(newNode, firstChildNode);
            firstresult = false;
            if (resultslist[enrichedjson[i].id].classList.contains('g-blk')) {
              //styling - only if the first trusted result is a special box mnr-c g-blk - could be improved
              resultslist[enrichedjson[i].id].classList.remove('trustedfirst');
              resultslist[enrichedjson[i].id].classList.add('trusted');
            }
          }
        }
      }
    },

    asset: function(name) {
      return browser.runtime.getURL(`/assets/${name}`);
    },
  },
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>

<template>
  <div id="app">
    <div v-show="isActive" class="sdc-container sdc-mx-40 sdc-pb-4 sdc-max-w-3xl">
      <div class="sdc-mt-4 sdc-border sdc-border-gray-400 sdc-rounded">
        <div class="sdc-p-2">
          <img class="sdc-h-6" :src="this.asset('logos/sdc-gray-text.png')" alt="Logo Sources de Confiance" />
        </div>

        <div class="sdc-px-2 sdc-pb-2 sdc-text-gray-500 sdc-text-s">{{ this.resultsCount }} résultats de confiance sur les {{ this.se.start }} premier résultats</div>

        <Result v-for="result in currentResults" :key="result.url" :result="result" class="sdc-p-2" />

        <div v-if="waitingFoResults" class="sdc-flex">
          <div class="sdc-m-auto">
            <Rotate />
          </div>
        </div>

        <Pagination v-show="results.length" v-model="currentPage" :countItems="results.length" :itemsPerPage="10" @pageselect="pageSelect" :nextButton="!allFetched" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import Result from './components/Result.vue';
import Pagination from './components/Pagination.vue';
import GoogleTab from './components/GoogleTab.vue';

import Pulse from './components/Pulse.vue';
import Rotate from './components/Rotate.vue';

export default {
  name: 'SdC',

  components: {
    Pagination,
    Result,
    GoogleTab,
    Pulse,
    Rotate,
  },

  props: {
    // Trusted results per page
    resultsPerPage: {
      type: Number,
      default: 10,
    },

    // Delay between 2 requests
    requestDelay: {
      type: Number,
      default: 1500,
    },

    // Nb of results per search engine request
    resultsPerSERequest: {
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

      isActive: false,

      tab: null, // The tab component

      queryString: null, // Current search query
      results: [], // trusted results

      // Search engine related data
      se: {
        requestsCount: 0, // Count the number of search requests (should be < maxRequests)

        start: 0, // results offset
        resultsPerPage: 10, // Number of items returned per request
        currentPage: 0, // Current Search engine page
        initialPage: 1, // The SERP page index
        additionalSearchLinks: [], // Links to the additional search pages
      },

      interval: null,

      currentPage: 1, // current Trusted results page

      pendingRequest: false, // there is an ongoing SE request

      freshStart: true,
    };
  },

  computed: {
    resultsCount: function() {
      return this.results.length;
    },

    currentResults: function() {
      var start = (this.currentPage - 1) * this.resultsPerPage;
      var stop = start + this.resultsPerPage;
      return this.results.slice(start, stop);
    },

    allFetched: function() {
      return this.se.requestsCount >= this.maxRequests;
    },

    pageIncomplete: function() {
      return this.currentResults.length < this.resultsPerPage;
    },

    waitingFoResults: function() {
      return this.pendingRequest || (this.pageIncomplete && !this.allFetched);
    },

    title: function() {
      return 'Sources de Confiance (' + this.results.length + (this.allFetched ? '' : '+') + ')';
    },
  },

  mounted: function() {
    console.log('>sdcFrame:mounted');

    this.prepareUX();

    this.prepareSearch();

    // Get the trusted results
    this.getResults();
  },

  methods: {
    prepareUX: function() {
      console.log('>prepareUX');

      // Create menu item
      var TabClass;
      switch (this.$SE.name) {
        case 'google':
          TabClass = Vue.extend(GoogleTab);
          break;
        default:
          console.log('Error: Search engine not supported: ' + this.$SE.name);
          return;
      }
      console.log('Creating tab component for ' + this.$SE.name);
      this.tab = new TabClass();
      this.tab.$parent = this; // There must be something more elegant
      // Set title
      this.tab.$slots.default = this.title;
      this.tab.$mount();

      this.$SE.injectMenuItem(this.tab.$el, this.toggle);
    },

    prepareSearch: function() {
      console.log('>prepareSearch');

      // The current query string
      this.queryString = document.getElementsByName('q')[0].value;

      // Get all possible search links for this query
      this.searchLinks = this.$SE.getSearchLinks();
      this.maxRequests = this.searchLinks.length;
      console.log('maximum number of searches=' + this.maxRequests);

      // Handler for all messages coming from background.js (and the others)
      //var browser = require('webextension-polyfill');
      browser.runtime.onMessage.addListener(this.handleMessage);
    },

    sendRequest: function(msg) {
      console.log('>sendRequest');

      this.se.currentPage++;

      // Fill wiht default values
      msg.request = this.queryString;
      msg.userAgent = window.navigator.userAgent;
      msg.searchengine = this.$SE.name;

      // Send msg
      this.pendingRequest = true;
      console.log('msg.type=' + msg.type);
      browser.runtime.sendMessage(msg);
    },

    firstResults: function() {
      console.log('>firstResults++');

      // -- Process the SERP
      // Extract all results
      var results = this.$SE.extractFromSERP(document);
      // Send results to API to categorize the results
      var request = {
        request: this.queryString,
        results: results,
        type: 'CATEGORIZE',
      };
      this.sendRequest(request);
    },

    nextResults: function() {
      console.log('>nextResults this.se.currentPage=' + this.se.currentPage);
      console.log('url=' + this.searchLinks[this.se.currentPage]);

      //Fetch the results and categorize them
      var request = {
        request: this.queryString,
        searchLink: this.searchLinks[this.se.currentPage],
        //start: this.se.start,
        type: 'FETCH_AND_CATEGORIZE',
      };

      this.sendRequest(request);

      return true;
    },

    getResults: function() {
      console.log('>getResults');

      if (this.currentResults.length >= this.resultsPerPage) {
        console.log('already have all the results for this page');
        return;
      }

      // We're entering an interval loop to send SE requests at an acceptable pace
      this.interval = setInterval(
        function() {
          console.log('>into interval');

          // We have reached the maximum number of SE requests for now
          if (this.allFetched) {
            console.log('Max request count reach (' + this.maxRequests + ')');
            console.log('clearing interval = ' + this.interval);
            clearInterval(this.interval); // No more interval
            return;
          }

          // Is there a pending request? Let's wait for it to complete
          if (this.pendingRequest) {
            console.log('request pending');
            return;
          }

          // -- First case
          // We just have been setup
          // We will use the SERP to extract the first trusted results
          if (this.freshStart) {
            this.firstResults();
            // Let the interval loop continue so that we have more results if needed
            this.freshStart = false;
            return;
          }

          // -- Second case
          // We already have some results, but not enough to fill
          // the current page
          if (this.pageIncomplete) {
            console.log('page ' + this.currentPage + ' incomplete.');
            this.nextResults();
            return;
          }

          // We do not need to fethc more results at this stage
          console.log('clearing interval = ' + this.interval);
          clearInterval(this.interval); // No more interval
        }.bind(this),
        this.requestDelay
      );

      console.log('interval set to = ' + this.interval + ' for ' + this.requestDelay + ' ms.');
    },

    handleMessage: function(request, sender, sendResponse) {
      console.log('>handleMessage request.message=' + request.message);

      // Make sure the messages we process are ours
      if (sender.id != chrome.runtime.id) {
        console.log('Message not from us. request=' + JSON.stringify(request) + ' sender=' + JSON.stringify(sender));
        return;
      }

      // We're no longer waiting for a request answer
      this.pendingRequest = false;

      switch (request.message) {
        case 'HIGHLIGHT':
          // We have the first trusted results extracted from the SERP

          // Collect the first results
          this.results = request.json.filter(this.filterTrusted);
          console.log('this.results.length=' + this.results.length);

          // Refresh tab count
          this.tab.$slots.default = this.title;
          this.tab.$forceUpdate();

          // Mark the trusted results in the SERP
          this.highlight(request.json);

          // And set the number of results per request we want to use from now on
          this.se.resultsPerPage = this.resultsPerSERequest;

          break;

        case 'NEXT_RESULTS':
          // Keep only filtered results
          var trusted = request.json.filter(this.filterTrusted);
          console.log('trusted.length=' + trusted.length);

          // Make sure we do not have duplicates
          // for each of the new results
          for (var i = 0; i < trusted.length; i++) {
            // Make sure it is not in the reuslts we already have
            for (var j = 0; j < this.results.length; j++)
              if (trusted[i].url == this.results[j].url) {
                console.log('duplicate found: url=' + this.results[j].url);
                break;
              }

            // If the above loop hhas completed, the new result does not already exist and can be appended to this.results
            if (j == this.results.length) {
              // console.log("push " + trusted[i].url);
              this.results.push(trusted[i]);
            }
          }
          console.log('this.results.length=' + this.results.length);

          // Signal we have new results. Update the view
          this.tab.$slots.default = this.title;
          this.tab.$forceUpdate();

          // Request is not pending anymore
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

      console.log('<handleMessage');
    },

    filterTrusted: function(el) {
      return el.status == 'trusted';
    },

    highlight: function(enrichedjson) {
      //console.log('>highlight');
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

    // Called from searchEngine.$injectMenuItem activation / deactivation
    toggle: function(isVisible) {
      console.log('>toggle');
      this.isActive = isVisible;
    },

    // A pagination button has been pressed: see if we need to add results
    pageSelect: function(select) {
      console.log('>pageSelect: page = ' + select);

      switch (select) {
        case 'next':
          if (!this.pendingRequest && !this.allFetched) this.currentPage++;
          break;
        case 'prev':
          if (this.currentPage > 1) this.currentPage--;
          break;
        default:
          this.currentPage = select;
          break;
      }
      console.log('this.currentPage=' + this.currentPage);
      this.getResults();
    },

    asset: function(name) {
      return browser.runtime.getURL(`/assets/${name}`);
    },
  },
};
</script>

<style>
/*import tailwind from './assets/styles/tailwind.css';*/
@tailwind base;
@tailwind components;
@tailwind utilities;
@import './assets/styles/google.css';
</style>

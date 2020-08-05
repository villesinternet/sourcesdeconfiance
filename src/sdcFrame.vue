<template>
  <div id="app">
    <div v-show="isActive" class="sdc-container sdc-mx-40 sdc-pb-4 sdc-max-w-3xl">
      <div class="sdc-mt-4 sdc-border sdc-border-gray-400 sdc-rounded">
        <div class="sdc-p-2">
          <img class="sdc-h-6" :src="this.asset('logos/sdc-gray-text.png')" alt="Logo Sources de Confiance" />
        </div>

        <div class="sdc-px-2 sdc-pb-2 sdc-text-gray-500 sdc-text-s">{{ this.resultsCount }} résultats de confiance sur les {{ this.se.start }} premiers résultats</div>

        <Result v-for="result in currentResults" :key="result.url" :result="result" class="sdc-p-2" />

        <Pagination v-model="currentPage" :countItems="results.length" :itemsPerPage="10" @pageselect="pageSelect" />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Result from './components/Result.vue';
import Pagination from './components/Pagination.vue';
import Tab from './components/Tab.vue';

// Load SERP highlighting styles
// import styles from './assets/styles/google_highlight.css';
// import tailwind from './assets/styles/tailwind.css';

export default {
  name: 'SdC',

  components: {
    Pagination,
    Result,
    Tab,
  },

  props: {
    // Maximum search engine requests
    maxRequests: {
      type: Number,
      default: 10,
    },

    // Trusted results per page
    resultsPerPage: {
      type: Number,
      default: 10,
    },

    // Delay between 2 requests
    requestDelay: {
      type: Number,
      default: 1000,
    },

    // Nb of results per search engine request
    resultsPerSERequest: {
      type: Number,
      default: 50,
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
      },

      interval: null,

      currentPage: 1, // current Trusted results page

      pendingRequest: false, // there is an ongoing SE request
    };
  },

  mounted: function() {
    // `this` points to the vm instance

    console.log('>sdcFrame:mounted');

    // Create menu item
    var TabClass = Vue.extend(Tab);
    this.tab = new TabClass();
    this.tab.$parent = this; // There must be something more elegant
    // Set title
    this.tab.$slots.default = this.resultsCount;
    this.tab.$mount();
    this.$on('tabClick', function() {
      this.toggle();
    });
    // Insert in google's menu bar
    var menuBar = document.getElementById('hdtb-msb-vis');
    menuBar.insertBefore(this.tab.$el, menuBar.children[1]);

    // The current query string
    this.queryString = document.getElementsByName('q')[0].value;

    // Handler for all messages coming from background.js (and the others)
    var browser = require('webextension-polyfill');
    browser.runtime.onMessage.addListener(this.handleMessage);

    // Get the trusted results
    this.getResults();
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
  },

  methods: {
    extractFromSERP: function() {
      const elements = document.getElementsByClassName('g');
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i].getElementsByClassName('rc'); // test if result has expected child. prevents code from breaking when a special info box occurs.
        if (el.length > 0 && !elements[i].classList.contains('kno-kp')) {
          //quickfix do not analyse knowledge boxes. Could be a specific analysis instead
          var url = elements[i].querySelector('.rc a').href;
          var name = elements[i].querySelector('.rc .r a h3').textContent;
          var snippet = elements[i].querySelector('.rc .s .st') ? elements[i].querySelector('.rc .s .st').textContent : '';
          results.push({
            id: i,
            url: url,
            name: name,
            snippet: snippet,
          });
        }
      }

      return results;
    },

    sendRequest: function(message) {
      console.log('>sendRequest message.type=' + message.type);

      this.se.currentPage++;
      this.se.requestsCount++;
      this.se.start += this.se.resultsPerPage;

      // Skip this page since it was the initial SERP
      if ((message.type == 'GET_NEXT_RESULTS' || message.type == 'FETCH_AND_CATEGORIZE') && this.se.currentPage == this.se.initialPage) {
        console.log('this.se.currentPage == this.se.initialPage. Returning.');
        return;
      }

      // Send request
      this.pendingRequest = true;
      browser.runtime.sendMessage(message);
    },

    firstResults: function() {
      console.log('>firstResults');

      // Calculate initial SERP results per page
      if (window.location.href.indexOf('?start=') != -1 || window.location.href.indexOf('&start=') != -1) {
        var url = new URL(window.location.href);
        //this.se.start = parseInt(url.searchParams.get('start'));
        this.se.initialPage = 1 + this.se.start / this.se.resultsPerPage;
      }
      var resultsLength = document.querySelectorAll('.g .rc').length;
      if (this.se.initialPage == 1 && resultsLength > 10) {
        //quickfix for first SERP results number variable due to knowledge boxes
        this.se.resultsPerPage = Math.round(resultsLength / 10) * 10;
      }

      // -- Process the SERP
      // Extract all results
      var results = this.extractFromSERP();

      // Send results to API to categorize the results
      var request = {
        request: this.queryString,
        results: results,
        userAgent: window.navigator.userAgent,
        apiserver: this.storedSettings.apiserver,
        searchengine: 'google',
        type: 'CATEGORIZE',
      };
      this.sendRequest(request);
    },

    nextResults: function() {
      console.log('>nextResults');

      // Fetch the results and categorize them
      var request = {
        request: this.queryString,
        userAgent: window.navigator.userAgent,
        apiserver: this.storedSettings.apiserver,
        searchengine: 'google',
        resultsPerPage: this.resultsPerSERequest,
        currentPage: this.se.currentPage,
        start: this.se.start,
        type: 'FETCH_AND_CATEGORIZE',
      };
      this.sendRequest(request);

      return true;
    },

    getResults: function() {
      console.log('>getResults');

      // We're entering an interval loop to send SE requests at an acceptable pace
      this.interval = setInterval(
        function() {
          console.log('>interval');

          // We have reached the maximum number of SE requests for now
          if (this.se.requestsCount >= this.maxRequests) {
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
          if (this.results.length == 0) {
            this.firstResults();
            // Let the interval loop continue so that we have more results if needed
            return;
          }

          // -- Second case
          // We already have some results, but not enough to fill
          // the current page
          if (this.currentResults.length < this.resultsPerPage) {
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

      // We're no longer are waiting for a request answer
      console.log('this.pendingRequest was ' + this.pendingRequest + '. Setting to false.');
      this.pendingRequest = false;

      switch (request.message) {
        case 'HIGHLIGHT':
          // We have the first trusted results extracted from the SERP

          // Collect the first results
          this.results = request.json.filter(this.filterTrusted);
          console.log('this.results.length=' + this.results.length);

          // Refresh tab count
          this.tab.$slots.default = this.results.length;
          this.tab.$forceUpdate();

          // Mark the trusted results in the SERP
          this.highlight(request.json);

          // And set the number of results per request we want to use from now on
          this.se.resultsPerPage = this.resultsPerSERequest;

          break;

        case 'NEXT_RESULTS':
          // Keep only filtered results
          var trusted = request.json.filter(this.filterTrusted);
          console.log('trusted.length=' + trusted.length + ', this.results.length=' + this.results.length);

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
          this.tab.$slots.default = this.results.length;
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

    // A pagination button has been pressed: see if we need to add results
    pageSelect: function(page) {
      this.currentPage = page;
      console.log('>pageSelect: page = ' + page);
      console.log('this.currentPage=' + this.currentPage);
      this.getResults();
    },

    asset: function(name) {
      return browser.runtime.getURL(`/assets/${name}`);
    },

    toggle: function() {
      this.isActive = !this.isActive;

      // Manage Google page elements
      // Hide all 'All' elements
      document.getElementById('appbar').style.display = this.isActive ? 'none' : '';
      document.getElementById('atvcap').style.display = this.isActive ? 'none' : '';
      document.getElementById('rcnt').style.display = this.isActive ? 'none' : '';
      document.getElementById('footcnt').style.display = this.isActive ? 'none' : '';
      document.getElementById('xfootw').style.display = this.isActive ? 'none' : '';
      // Update menu bar
      for (let el of document.getElementById('cnt').getElementsByClassName('mw')) {
        el.style.display = this.isActive ? 'none' : '';
      }

      // Manage our own Frame
      //if (this.frameVue.$el) this.frameVue.$el.style.display = this.isActive ? 'block' : 'none';
    },
  },
};
</script>

<style>
/*import tailwind from './assets/styles/tailwind.css';*/
@tailwind base;
@tailwind components;
@tailwind utilities;
@import './assets/styles/google_highlight.css';
</style>

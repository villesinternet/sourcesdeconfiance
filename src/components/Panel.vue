<template>
  <div id="app flex">
    <div v-show="active" class="sdc-container sdc-mx-40 sdc-max-w-4xl">
      <!-- <div class="sdc-mt-4 sdc-border sdc-border-green-400 sdc-rounded sdc-p-4"> -->
      <div class="sdc-mt-4">
        <NavBar :logo="mainLogo" :tabs="tabs" @loggedin="hasLoggedIn" />

        <div v-for="tab in tabs" v-show="isActiveTab(tab)" class="sdc-mt-3">
          <component :key="tab.name" :is="tab.component" :name="tab.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import * as helpers from '../helpers/general.js';
import * as Events from '../helpers/events.js';

import NavBar from './NavBar.vue';
import Main from './Main.vue';
import Education from './Education.vue';

export default {
  name: 'panel',

  components: {
    Main,
    Education,
    NavBar,
  },

  data() {
    return {
      isHighlighted: false,

      active: false,

      tab: null, // The tab component

      trustedResultsCount: 0,

      tabs: {},
      activeTab: null,

      loggedIn: false,
    };
  },

  computed: {
    title: function() {
      return global.sdcConfig.get('se_widgets.toolbar.title');
    },

    mainLogo: function() {
      return helpers.asset('logos/sdc-gray-text.png');
    },
  },

  watch: {
    // active: function(active, old)
    // {
    //   console.log(`>${this.$options.name}@active: active=${active}, old=${old}`);
    //   if (!active) return;
    //   console.log(`Setting active tab to ${this.activeTab.title}`);
    // }
  },

  created: function() {
    console.log(`>${this.$options.name}@created`);

    // Get tabs configuration
    this.tabs = global.sdcConfig.get('panel.navbar');

    for (var i in this.tabs) {
      if (this.tabs[i].status == 'active') {
        this.activeTab = this.tabs[i];
        break;
      }
    }

    Events.listen('TAB_CLICKED', pl => {
      console.log(`TAB_CLICKED ${pl.clickedTab.title}`);

      this.activeTab.status = 'inactive';

      // Hide active tab
      console.log('hiding ', this.activeTab.name);
      Events.send('TAB_HIDE', {
        name: this.activeTab.name,
      });

      this.activeTab = pl.clickedTab;

      this.activeTab.status = 'active';

      // Show new active tab
      console.log('showing ', this.activeTab.name);
      Events.send('TAB_SHOW', {
        name: this.activeTab.name,
      });

      // Refresh content
      Events.send('TAB_REFRESH', {
        name: this.activeTab.name,
      });
    });

    Events.listen('CATEGORIZED_RESULTS', pl => {
      console.log('CATEGORIZED_RESULTS from ' + pl.name);
      this.categorized(pl.results);
    });
  },

  beforeMount: function() {
    console.log(`>${this.$options.name}@beforeMount`);
  },

  mounted: function() {
    console.log(`>${this.$options.name}@mounted`);

    this.prepareUX();
  },

  methods: {
    isActiveTab: function(tab) {
      console.log(`>${this.$options.name}@isActiveTab: ${tab.name} ${tab == this.activeTab}`);
      return tab == this.activeTab;
    },

    hasLoggedIn: function() {
      console.log('>loggedIn');

      this.loggedIn = true;
      this.tabs['education'].status = 'inactive';
    },

    // Called from $SE.injectMenuItem activation /  deactivation
    panelClicked: function(active) {
      console.log(`>${this.$options.name}@panelClicked`);

      // Set new active tab (this updates the navbar as well)
      this.active = active;

      // Show new active tab
      console.log('showing ', this.activeTab.name);
      Events.send('TAB_SHOW', {
        name: this.activeTab.name,
      });

      // Refresh content
      Events.send('TAB_REFRESH', {
        name: this.activeTab.name,
      });
    },

    // selectTab: function(tabId) {
    //   console.log('>selectTab: tabId= ' + tabId);
    //   for (const prop in this.tabs) {
    //     if (this.tabs[prop].status == 'disabled') continue;
    //     if (prop == tabId) this.tabs[prop].status = 'active';
    //     else this.tabs[prop].status = 'inactive';
    //   }
    //   this.activeTab = this.tabs[tabId];

    // },

    prepareUX: function() {
      console.log('>prepareUX');

      this.$SE.injectMenuItem(this.panelClicked);

      // Set title
      this.refreshTab(this.title, 0, true);
    },

    // Refresh tab's title
    refreshTab: function(title, resultsCount, moretoCome) {
      console.log('>refreshTab');
      var t = title + (resultsCount ? ' (' + resultsCount + (moretoCome ? '+' : '') + ')' : '');
      this.$SE.refreshTitle(t);
    },

    highlight: function(enrichedjson) {
      console.log('>highlight');
      this.$SE.highlight(enrichedjson);
    },

    categorized: function(results) {
      console.log(`>${this.$options.name}@categorized`);
      this.$SE.highlight(results);
    },

    /**
     * trustedResults - Highlight the trusted results in the SERP
     *
     * @param      array  results  Enriched results from categorization
     */
    trustedResults: function(results, moretoCome) {
      console.log('>trustedResults');

      if (!this.isHighlighted) {
        this.$SE.highlight(results);
        this.isHighlighted = true;
      }

      //this.trustedResultsCount = results.length;

      this.refreshTab(this.title, results.length, moretoCome);
    },

    // prepareSearch: function() {
    //   console.log('>prepareSearch');

    //   // The current query string
    //   this.queryString = this.$SE.getQueryString();

    //   // Get all possible search links for this query
    //   this.searchLinks = this.$SE.getSearchLinks();
    //   this.se.maxRequests = this.searchLinks.length;
    //   console.log('maximum number of searches=' + this.maxRequests);

    //   // Handler for all messages coming from background.js (and the others)
    //   //var browser = require('webextension-polyfill');
    //   browser.runtime.onMessage.addListener(this.handleMessage);
    // },

    // sendRequest: function(msg) {
    //   console.log('>sendRequest: msg.type=' + msg.type);

    //   this.se.currentPage++;
    //   this.se.requestsCount++;

    //   // Fill wiht default values
    //   msg.request = this.queryString;
    //   msg.userAgent = window.navigator.userAgent;
    //   msg.searchengine = this.$SE.name;

    //   // Send msg
    //   browser.runtime.sendMessage(msg);
    // },

    // firstResults: function() {
    //   console.log('>firstResults');

    //   // -- Process the SERP
    //   // Extract all results
    //   var results = this.$SE.extractFromSERP(document);
    //   // Send results to API to categorize the results
    //   var request = {
    //     request: this.queryString,
    //     results: results,
    //     type: 'CATEGORIZE',
    //   };
    //   this.sendRequest(request);

    //   console.log('<firstResults');
    // },

    // nextResults: function() {
    //   console.log('>nextResults this.se.currentPage=' + this.se.currentPage);
    //   console.log('url=' + this.searchLinks[this.se.currentPage]);

    //   //Fetch the results and categorize them
    //   var request = {
    //     request: this.queryString,
    //     searchLink: this.searchLinks[this.se.currentPage],
    //     //start: this.se.start,
    //     type: 'FETCH_AND_CATEGORIZE',
    //   };

    //   this.sendRequest(request);

    //   return true;
    // },

    // getResults: function() {
    //   console.log('>getResults');

    //   if (this.currentResults.length >= this.resultsPerPage) {
    //     console.log('already have all the results for this page');
    //     return;
    //   }

    //   // We're entering a polling loop to send SE requests at an acceptable pace
    //   this.poll = setInterval(
    //     function() {
    //       // Is there a pending request? Let's wait for it to complete
    //       if (this.pendingRequest)
    //         return;

    //       // We have reached the maximum number of SE requests for now
    //       if (this.allFetched) {
    //         console.log('Max request count reach (' + this.se.maxRequests + ')');
    //         clearInterval(this.poll); // No more interval
    //         return;
    //       }

    //       // -- First case
    //       // We just have been setup
    //       // We will use the SERP to extract the first trusted results
    //       if (this.freshStart) {
    //         this.pendingRequest = true;

    //         this.firstResults();

    //         // Let the interval loop continue so that we have more results if needed
    //         this.freshStart = false;

    //         return;
    //       }

    //       // -- Second case
    //       // We already have some results, but not enough to fill
    //       // the current page
    //       if (this.pageIncomplete && !this.allFetched) {
    //         console.log('need more results. setting a timeout of ' + this.$SE.requestsDelay + ' until next SE request');
    //         this.pendingRequest = true;

    //         setTimeout(this.nextResults, this.$SE.requestsDelay);

    //         return;
    //       }

    //       // We do not need to fethc more results at this stage
    //       console.log('clearing polling');
    //       clearInterval(this.poll); // No more polling
    //     }.bind(this),
    //     100
    //   );

    //   console.log('polling interval set to ' + this.$SE.requestsDelay + ' ms.');
    // },

    // handleMessage: function(request, sender, sendResponse) {
    //   console.log('>handleMessage request.message=' + request.message);

    //   // Make sure the messages we process are ours
    //   if (sender.id != chrome.runtime.id) {
    //     console.log('Message not from us. request=' + JSON.stringify(request) + ' sender=' + JSON.stringify(sender));
    //     return;
    //   }

    //   // We're no longer waiting for a request answer
    //   this.pendingRequest = false;

    //   switch (request.message) {
    //     case 'HIGHLIGHT':
    //       // We have the first trusted results extracted from the SERP

    //       // Collect the first results
    //       this.results = request.json.filter(this.filterTrusted);
    //       console.log('this.results.length=' + this.results.length);

    //       // Refresh tab count
    //       this.refreshTab();

    //       // Mark the trusted results in the SERP
    //       this.highlight(request.json);

    //       // And set the number of results per request we want to use from now on
    //       //this.se.resultsPerPage = this.resultsPerSERequest;

    //       break;

    //     case 'NEXT_RESULTS':
    //       // Keep only filtered results
    //       var trusted = request.json.filter(this.filterTrusted);

    //       // Make sure we do not have duplicates
    //       // for each of the new results
    //       for (var i = 0; i < trusted.length; i++) {
    //         // Make sure it is not in the reuslts we already have
    //         for (var j = 0; j < this.results.length; j++)
    //           if (trusted[i].url == this.results[j].url) {
    //             console.log('duplicate found: url=' + this.results[j].url);
    //             break;
    //           }

    //         // If the above loop hhas completed, the new result does not already exist and can be appended to this.results
    //         if (j == this.results.length) {
    //           // console.log("push " + trusted[i].url);
    //           this.results.push(trusted[i]);
    //         }
    //       }

    //       // Signal we have new results. Update the view
    //       this.refreshTab();

    //       // Request is not pending anymore
    //       break;

    //     case 'KB_DELIB':
    //       console.log('Deliberations :');
    //       console.log(request.json.filter(this.filterTrusted));
    //       break;

    //     case 'KB_LOI':
    //       console.log('Lois :');
    //       console.log(request.json.filter(this.filterTrusted));
    //       break;

    //     case 'KB_GOUV':
    //       console.log('Gouv :');
    //       console.log(request.json.filter(this.filterTrusted));
    //       break;
    //   }

    //   console.log('<handleMessage');
    // },

    // filterTrusted: function(el) {
    //   return el.status == 'trusted';
    // },

    // A pagination button has been pressed: see if we need to add results
    // pageSelect: function(select) {
    //   console.log('>pageSelect: page = ' + select);

    //   switch (select) {
    //     case 'next':
    //       if (!(this.pendingRequest || this.allFetched)) this.currentPage++;
    //       break;
    //     case 'prev':
    //       if (this.currentPage > 1) this.currentPage--;
    //       break;
    //     default:
    //       this.currentPage = select;
    //       break;
    //   }
    //   console.log('this.currentPage=' + this.currentPage);
    //   this.getResults();
    // },
  },
};
</script>

<style>
@tailwind base;

/* Restore google settings */
a {
  color: #1a0dab;
  text-decoration: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}
@tailwind components;
@tailwind utilities;
@import '../assets/styles/google.css';
</style>

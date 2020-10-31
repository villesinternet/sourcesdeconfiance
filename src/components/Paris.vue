<template>
  <div>
    <div class="sdc-rounded-t sdc-bg-gray-400 sdc-p-2 sdc-flex sdc-justify-start sdc-items-center">
      <img class="sdc-pr-1" src="https://www.paris.fr/favicon.ico" style="height:24px" />
      <h2>{{ title }}</h2>
    </div>

    <div class="sdc-border sdc-border-gray-400 sdc-rounded-b sdc-p-2 ">
      <div class="sdc-overflow-hidden">
        <!-- <WebFilters v-if="loggedIn" /> -->
        <div class="sdc-pb-4 sdc-text-gray-500 sdc-text-s"></div>

        <div class="sdc-flex">
          <div class="sdc-pr-2 sdc-overflow-hidden">
            <Result v-for="result in results" :key="result.url" :result="result" class="sdc-pb-3" :showUrl="prefs.showUrl" :showSnippet="prefs.showSnippet" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as se from '../search_engines/paris';

import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import * as Events from '../helpers/events.js';

import Result from './Result.vue';
import Pagination from './Pagination.vue';
import Rotate from './Rotate.vue';

export default {
  name: 'Paris',

  components: {
    Result,
    Pagination,
    Rotate,
  },

  props: {
    name: {
      type: String,
      required: true,
    },
    prefs: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      //resultsPerPage: global.sdcConfig.get('search_engines.paris.resultsPerPage')

      searchWords: '',

      results: [],

      pendingRequest: false,

      se: {
        resultsCount: 0, // The search engine results
        start: 0,
        index: 0,
        maxResultsPerRequest: 0,
        maxResults: 0,
        noMoreResults: false,
      },
    };
  },

  computed: {
    title: function() {
      return `Paris.fr - ${this.results.length} résultats`;
    },

    /**
     * currentResults - array of results displayed in the current page
     *
     * @return     Array  Lust of results
     */
    currentResults: function() {
      var start = (this.currentPage - 1) * this.prefs.resultsPerPage;
      return this.results.slice(start, start + this.prefs.resultsPerPage);
    },

    /**
     * pageIncomplete - more results needed to fill the current page
     *
     * @return     boolean
     */
    pageIncomplete: function() {
      return this.currentResults.length < this.prefs.resultsPerPage;
    },

    /**
     * allFetched - can we get more results
     *s
     * @return     {<type>}  { description_of_the_return_value }
     */
    allFetched: function() {
      return this.results.length >= this.maxResults || this.noMoreResults;
    },
  },

  watch: {
    active: function(val, oldval) {
      console.log('>' + this.$options.name + '@active changed from ' + oldval + ' to ' + val);
      if (val) this.moreResults();
    },
  },

  created: function() {
    Events.listen('WIDGET_REFRESH', pl => {
      // Is this for us?
      if (pl.name != this.name) return;

      this.moreResults();
    });
  },

  beforeMount: function() {
    console.log('>' + this.$options.name + '@beforeMount');
  },

  mounted: function() {
    console.log('>' + this.$options.name + '@mounted');

    // Get ready for Paris.fr search
    this.searchWords = this.$SE.getSearchWords();
  },

  methods: {
    /**
     * moreResults - search for additional results if needed
     */
    moreResults: function() {
      console.log('>' + this.$options.name + '@moreResults');

      if (this.pendingRequest) {
        console.log('Request already pending');
        return;
      }

      // We only get results when we're displayed (visible and tab is selected)
      // if (!(this.visible && this.isActive)) {
      //   console.log('skipping');
      //   return;
      // }

      // Do we need more results for this page ? Can we get more (not all fetched)?
      if (this.pageIncomplete && !this.allFetched) {
        //var searchUrl = this.getNextSearchUrl();
        console.log('need more results for ' + this.searchWords);

        console.assert(!this.pendingRequest, 'pendingRequest should not be true');

        this.pendingRequest = true;
        comms
          .toBackground('paris', {
            //searchengine: "paris",
            type: 'GET_RESULTS',
            searchWords: this.searchWords,
          })
          .then(
            msg => {
              console.log(`got ${msg.results.length} results back`);

              this.pendingRequest = false;

              this.results = this.results.concat(msg.results);
            },
            e => {
              this.pendingRequest = false;
              console.assert(false, 'Error on GET_PAGE: ' + e);
            }
          );
      } else console.log('page complete');
    },
  },
};
</script>

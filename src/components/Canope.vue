<template>
  <div>
    <div class="sdc-rounded-t sdc-bg-gray-400 sdc-p-2 sdc-flex sdc-justify-start sdc-items-center">
      <img class="sdc-pr-1" src="https://www.reseau-canope.fr/fileadmin/template/images/favicon.ico" style="height:24px" />
      <h2>{{ title }}</h2>
    </div>

    <div class="sdc-border sdc-border-gray-400 sdc-rounded-b sdc-p-2 ">
      <div class="sdc-overflow-hidden">
        <div class="sdc-pb-4 sdc-text-gray-500 sdc-text-s"></div>

        <div class="sdc-flex">
          <div class="sdc-pr-2 sdc-overflow-hidden">
            <Result v-for="result in results" :key="result.url" :result="result" class="sdc-pb-3" />
          </div>

          <div v-if="pendingRequest" class="sdc-flex sdc-m-auto sdc-justify-center">
            <Rotate />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as Canope from '../search_engines/canope';

import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import * as Events from '../helpers/events.js';

import Result from './Result.vue';
import Pagination from './Pagination.vue';
import Rotate from './Rotate.vue';

export default {
  name: 'Canope',

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

    rootClass: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      resultsPerPage: global.sdcConfig.get('search_engines.canope.resultsPerPage'),
      maxResults: global.sdcConfig.get('search_engines.canope.maxResults'),

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
      return `Canope - ${this.results.length} résultats`;
    },

    /**
     * currentResults - array of results displayed in the current page
     *
     * @return     Array  Lust of results
     */
    currentResults: function() {
      console.log(`>currentResults:`);
      var start = (this.currentPage - 1) * this.resultsPerPage;
      return this.results.slice(start, start + this.resultsPerPage);
    },

    /**
     * pageIncomplete - more results needed to fill the current page
     *
     * @return     boolean
     */
    pageIncomplete: function() {
      return this.currentResults.length < this.resultsPerPage;
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
    // active: function(val, oldval) {
    //   console.log('>' + this..name + '@active changed from ' + oldval + ' to ' + val);
    //   if (val) this.moreResults();
    // },
  },

  created: function() {
    Events.listen('WIDGET_REFRESH', pl => {
      // Is this for us?
      if (pl.name != this.name) return;

      this.moreResults();
    });
  },

  beforeMount: function() {
    console.log(`>${this.name}@beforeMount`);
  },

  mounted: function() {
    console.log(`>${this.name}@mounted`);

    // Settings for the current search engine
    this.se.maxResultsPerRequest = global.sdcConfig.get('search_engines.canope').maxResultsPerRequest;
    this.se.maxResults = global.sdcConfig.get('search_engines.canope').maxResults;

    // Get ready for Paris.fr search
    this.searchWords = this.$SE.getSearchWords();
  },

  beforeDestroy: function() {
    console.log('>' + this.name + '@beforeDestroy');
  },

  destroyed: function() {
    console.log('>' + this.name + '@destroyed');
  },

  methods: {
    /**
     * moreResults - search for additional results if needed
     */
    moreResults: function() {
      console.log(`>${this.name}@moreResults`);

      if (this.pendingRequest) {
        console.log('Request already pending');
        return;
      }

      // Do we need more results for this page ? Can we get more (not all fetched)?
      if (!this.pageIncomplete || this.allFetched) {
        console.log('page complete');
        return;
      }

      //var searchUrl = this.getNextSearchUrl();
      console.log('need more results for ' + this.searchWords);

      var num = Math.min(this.se.maxResultsPerRequest, this.se.maxResults - this.se.resultsCount);
      var searchUrl = Canope.buildSearchUrl(this.searchWords, this.se.index, num);

      this.pendingRequest = true;
      comms
        .toBackground('canope', {
          //searchengine: "paris",
          type: 'GET_RESULTS',
          searchUrl: searchUrl,
        })
        .then(
          msg => {
            console.log(`${this.name}: got results back`);

            this.pendingRequest = false;
            this.results = this.results.concat(msg.results);
          },
          e => {
            this.pendingRequest = false;
            console.assert(false, 'Error on GET_PAGE: ' + e);
          }
        );
    },
  },
};
</script>

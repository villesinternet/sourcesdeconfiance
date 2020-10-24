<template>
  <div>
    <div class="sdc-rounded-t sdc-bg-gray-400 sdc-p-2 sdc-flex sdc-justify-start sdc-items-center">
      <img class="sdc-pr-1" :src="sdcLogo" />
      <h2>{{ title }}</h2>
    </div>

    <div class="sdc-border sdc-border-gray-400 sdc-rounded-b sdc-p-2 ">
      <div class="sdc-overflow-hidden">
        <!-- <WebFilters v-if="loggedIn" /> -->
        <div class="sdc-pb-4 sdc-text-gray-500 sdc-text-s"></div>

        <div class="sdc-flex">
          <div class="sdc-pr-2 sdc-overflow-hidden">
            <Result v-for="result in currentResults" :key="result.url" :result="result" class="sdc-pb-3" />
          </div>
          <!-- <div v-if="isCantine">
            <img class="sc-w-2/5" :src="cantineImg" />
          </div> -->
        </div>

        <div v-if="waitingFoResults" class="sdc-flex sdc-m-auto sdc-justify-center">
          <Rotate />
        </div>

        <Pagination v-show="trusted.length" v-model="currentPage" :countItems="trusted.length" :itemsPerPage="10" @pageselect="pageSelect" />
      </div>
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';

import Result from './Result.vue';
import Pagination from './Pagination.vue';
import Rotate from './Rotate.vue';
import WebFilters from './WebFilters';

export default {
  name: 'Confiance',

  components: {
    Pagination,
    Result,
    Rotate,
    //WebFilters,
  },

  props: {
    // se: {
    //   type: Object,
    //   required: true,
    // },

    // status: {
    //   type: String,
    //   required: true,
    // },

    active: {
      type: Boolean,
      required: true,
    },

    // getSearchWords: {
    //   type: String,
    //   default: '',
    // },

    // useSERP: {
    //   type: Boolean,
    //   required: true,
    // },

    // service: {
    //   type: String,
    //   required: true,
    // },

    // loggedIn: {
    //   type: Boolean,
    //   default: false,
    // },
  },

  data() {
    return {
      resultsPerPage: global.sdcConfig.get('components.confiance.resultsPerPage'),
      maxResults: global.sdcConfig.get('components.confiance.maxResults'),

      searchWords: '',

      trusted: [], // The trusted results

      currentPage: 1,

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
    // isCantine: function() {
    //   return this.$SE.getgetSearchWords() == 'cantine paris 13';
    // },

    // cantineImg: function() {
    //   return helpers.asset('img/CaisseEcoles13eme.jpg');
    // },

    title: function() {
      return `Sources de Confiance - ${this.trusted.length} sur les ${this.se.resultsCount} premiers résultats de ${helpers.capitalize(this.$SE.name)})`;
    },

    sdcLogo: function() {
      return helpers.asset('icons/sdc-24.png');
    },

    /**
     * currentResults - array of results displayed in the current page
     *
     * @return     Array  Lust of results
     */
    currentResults: function() {
      var start = (this.currentPage - 1) * this.resultsPerPage;
      return this.trusted.slice(start, start + this.resultsPerPage);
    },

    /**
     * pageIncomplete - more results needed to fill the current page
     *
     * @return     boolean
     */
    pageIncomplete: function() {
      console.log('>pageIncomplete: ');
      return this.currentResults.length < this.resultsPerPage;
    },

    /**
     * allFetched - is there more searches possible?
     *s
     * @return     {<type>}  { description_of_the_return_value }
     */
    allFetched: function() {
      return this.se.resultsCount >= this.se.maxResults || this.se.noMoreResults;
    },

    waitingFoResults: function() {
      return this.pendingRequest || (this.pageIncomplete && !this.allFetched);
    },
  },

  watch: {
    active: function(val, oldval) {
      console.log('>' + this.$options.name + '@active changed from ' + oldval + ' to ' + val);
      this.moreResults();
    },
  },

  beforeMount: function() {
    console.log('>' + this.$options.name + '@beforeMount');
  },

  mounted: function() {
    console.log('>Confiance@mounted');

    // Settings for the current search engine
    this.se.maxResultsPerRequest = global.sdcConfig.get('search_engines')[this.$SE.name].maxResultsPerRequest;
    this.se.maxResults = global.sdcConfig.get('search_engines')[this.$SE.name].maxResults;

    // The current search words
    this.searchWords = this.$SE.getSearchWords();

    // What is the index of the curent results
    this.se.start = this.$SE.getCurrentResultIndex();

    // Process the results in the SERP, highlight them and add them to the Web panel
    this.firstResults();
  },

  methods: {
    /**
     * firstResults - categorize results we have received from the first SERP
     */
    firstResults: function() {
      console.log('>' + this.$options.name + '@firstResults for ' + this.$SE.name);

      // Extract all results
      var seResults = this.$SE.scrape(document);

      // Pass them to SdC API
      console.assert(!this.pendingRequest, 'pendingRequest should not be true');
      this.pendingRequest = true;
      comms
        .toBackground('sdc', {
          searchengine: this.$SE.name,
          type: 'CATEGORIZE',
          request: this.searchWords,
          results: seResults,
        })
        .then(
          m => {
            console.log('>CATEGORIZE: got ' + m.payload.results.length + ' results');
            console.assert(m.payload.results);

            this.se.resultsCount = m.payload.results.length;

            var newResults = m.payload.results.filter(result => result.status == 'trusted');
            this.trusted = this.trusted.concat(newResults);

            this.pendingRequest = false;

            if (this.se.start == 0)
              // If current SERP is the first search page
              this.se.index = this.se.start + this.se.resultsCount;
            // Next results are after this page
            else this.se.index = 0; // Next results are before this page

            this.moreResults();
          },
          e => console.assert(false, 'CATEGORIZE error: ' + e)
        );

      console.log('<firstResults');
    },

    /**
     * moreResults - search for additional results if needed
     */
    moreResults: function() {
      console.log('>' + this.$options.name + '@moreResults');

      if (this.pendingRequest) {
        console.log('Request already pending. Moving on.');
        return;
      }

      // We only get results when we're displayed (visible and tab is selected)
      if (!this.active) {
        console.log("skipping - we're not active");
        return;
      }

      // Do we need more results for this page ? Can we get more (not all fetched)?
      if (!(this.pageIncomplete && !this.allFetched)) {
        console.log('page complete');
        return;
      }

      console.log('need more results.');

      // Create next search Url
      var num = Math.min(this.se.maxResultsPerRequest, this.se.maxResults - this.se.resultsCount);
      var searchUrl = this.$SE.buildSearchUrl(this.searchWords, this.se.index, num);
      console.log('requesting ' + searchUrl);

      console.assert(!this.pendingRequest, 'pendingRequest should not be true');
      this.pendingRequest = true;

      comms
        .toBackground(this.$SE.name, {
          //searchengine: this.$SE.name,
          type: 'GET_RESULTS',
          searchUrl: searchUrl,
        })
        .then(
          msg => {
            console.log(msg);
            this.pendingRequest = false;

            console.log('got ' + msg.results.length + ' more results.');

            if (!msg.results.length) this.se.noMoreResults = true;

            console.log('se.index=' + this.se.index);
            this.se.index += msg.results.length;
            console.log('se.index=' + this.se.index);

            if (this.allFetched) {
              console.log('all fetched');
              return;
            }

            this.pendingRequest = true;
            comms
              .toBackground('sdc', {
                searchengine: this.$SE.name,
                type: 'CATEGORIZE',
                request: this.searchWords,
                results: msg.results,
              })
              .then(
                m => {
                  this.pendingRequest = false;

                  console.log('>CATEGORIZE: got ' + m.payload.results.length + ' results');

                  this.se.resultsCount += m.payload.results.length;

                  var newResults = m.payload.results.filter(result => result.status == 'trusted');
                  this.trusted = this.trusted.concat(newResults);

                  console.log(this.trusted.length + ' trusted messages found');

                  this.moreResults();
                },
                e => {
                  this.pendingRequest = false;
                  console.assert(false, 'CATEGORIZE error: ' + e);
                }
              );
          },
          e => {
            this.pendingRequest = false;
            console.assert(false, 'GET_RESULTS error : ' + e);
          }
        );
    },

    // A pagination button has been pressed: see if we need to add results
    pageSelect: function(select) {
      console.log('>Web pageSelect: page = ' + select);

      switch (select) {
        case 'next':
          if (!(this.pendingRequest || this.allFetched)) this.currentPage++;
          break;
        case 'prev':
          if (this.currentPage > 1) this.currentPage--;
          break;
        default:
          this.currentPage = select;
          break;
      }
      this.moreResults();
    },
  },
};
</script>

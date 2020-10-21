<template>
  <div v-show="isActive">
    <div v-if="service == 'web'">
      <WebFilters v-if="loggedIn" />
      <div class="sdc-pb-4 sdc-text-gray-500 sdc-text-s">{{ resultsCount }} résultats de confiance</div>
    </div>

    <div class="sdc-flex">
      <div class="sdc-pr-2 sdc-overflow-hidden">
        <Result v-for="result in currentResults" :key="result.url" :result="result" class="sdc-pb-3" />
      </div>
      <div v-if="isCantine">
        <img class="sc-w-2/5" :src="cantineImg" />
      </div>
    </div>

    <div v-if="waitingFoResults" class="sdc-flex sdc-m-auto sdc-justify-center">
      <Rotate />
    </div>

    <Pagination v-show="results.length" v-model="currentPage" :countItems="results.length" :itemsPerPage="10" @pageselect="pageSelect" />
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
    WebFilters,
  },

  props: {
    se: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    visible: {
      type: Boolean,
      required: true,
    },

    searchWords: {
      type: String,
      default: '',
    },

    useSERP: {
      type: Boolean,
      required: true,
    },

    service: {
      type: String,
      required: true,
    },

    loggedIn: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      // Configuration
      resultsPerPage: 10,
      isHighlighted: false, // Has the current SERP been enhaced with trusted results signs

      results: [],
      pendingRequest: false,
      currentPage: 1,

      searchUrls: [],
      //countSearches: 0
    };
  },

  computed: {
    isCantine: function() {
      return this.$SE.getSearchWords() == 'cantine paris 13';
    },

    cantineImg: function() {
      return helpers.asset('img/CaisseEcoles13eme.jpg');
    },

    isActive: function() {
      return this.status == 'active';
    },

    resultsCount: function() {
      return this.results.length;
    },

    /**
     * currentResults - array of results displayed in the current page
     *
     * @return     Array  Lust of results
     */
    currentResults: function() {
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
     * allFetched - is there more searches possible?
     *s
     * @return     {<type>}  { description_of_the_return_value }
     */
    allFetched: function() {
      return this.searchUrls.length ? false : true;
    },

    waitingFoResults: function() {
      return this.pendingRequest || (this.pageIncomplete && !this.allFetched);
    },
  },

  watch: {
    visible: function(val) {
      console.log('>visible: ' + val + ' service=' + this.service);
      this.moreResults();
    },

    status: function(val, oldval) {
      console.log('>status: ' + val + ' service=' + this.service);
      this.moreResults();
    },
  },

  mounted: function() {
    console.log('>Web component mounted');

    // Register this service in the comms helper
    comms.register(this.service, this.fromBackground);

    // Get the searchUrls for this query
    if (this.searchWords) {
      console.log('using search words: ' + this.searchWords);
      this.searchUrls = this.$SE.createSearchLinks(this.searchWords);
    } else this.searchUrls = this.$SE.getSearchLinks();

    // Process the results in the SERP, highlight them and add them to the Web panel
    if (this.useSERP) this.firstResults();
  },

  methods: {
    /**
     * firstResults - categorize results we have received from the first SERP
     */
    firstResults: function() {
      console.log('>firstResults');

      // -- Process the SERP
      // Extract all results
      var seResults = this.$SE.extractFromSERP(document);

      // Pass them to SdC API
      console.assert(!this.pendingRequest, 'pendingRequest should not be true');
      this.pendingRequest = true;
      comms.toBackground(this.service, {
        searchengine: this.$SE.name,
        type: 'CATEGORIZE',
        request: this.$SE.getSearchWords(),
        results: seResults,
      });

      console.log('<firstResults');
    },

    /**
     * moreResults - search for additional results if needed
     */
    moreResults: function() {
      console.log('>moreResults: this.visible=' + this.visible + ', this.isActive=' + this.isActive);

      if (this.pendingRequest) {
        console.log('Request already pending');
        return;
      }

      // We only get results when we're displayed (visible and tab is selected)
      if (!(this.visible && this.isActive)) {
        console.log('skipping');
        return;
      }

      // Do we need more results for this page ? Can we get more (not all fetched)?
      if (this.pageIncomplete && !this.allFetched) {
        console.log('need more results.');
        var searchUrl = this.getNextSearchUrl();
        console.log('requesting ' + searchUrl);

        console.assert(!this.pendingRequest, 'pendingRequest should not be true');
        this.pendingRequest = true;
        comms.toBackground(this.service, {
          searchengine: this.$SE.name,
          type: 'GET_SERP',
          searchUrl: searchUrl,
        });
      } else console.log('page complete');
    },

    /**
     * fromBackground
     *
     * @param      object  msg     The message
     */
    fromBackground: function(msg) {
      console.log('>Web:fromBackground service=' + this.service + ' msg.type=' + msg.type);

      // The pending request is now completed
      this.pendingRequest = false;

      if (msg.status == 'error') {
        console.log(msg.error);
        return;
      }

      switch (msg.type) {
        case 'CATEGORIZE':
          // Extract the filtered results (they're now visible in the Web panel)
          var newResults = msg.results.filter(result => result.status == 'trusted');
          this.results = this.results.concat(newResults);

          // Signal panel that we have new results so that they can be highlited in SERP
          this.$emit('trustedresults', this.results, !this.allFetched);

          this.moreResults();

          break;

        case 'GET_SERP':
          // Pass them to SdC API
          console.assert(!this.pendingRequest, 'pendingRequest should not be true');
          this.pendingRequest = true;
          comms.toBackground(this.service, {
            searchengine: this.$SE.name,
            type: 'CATEGORIZE',
            request: this.$SE.getSearchWords(),
            results: msg.results,
          });
      }
    },

    getNextSearchUrl: function() {
      return this.searchUrls.shift();
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

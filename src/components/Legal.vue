<template>
  <div v-show="isActive">
    <Web service="legal" :se="$SE" :visible="isActive" :status="status" :useSERP="false" :searchWords="searchWords" @trustedresults="trustedResults" />
  </div>
</template>

<script>
import Web from './Web.vue';

export default {
  name: 'Legal',
  components: {
    Web,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },
  },

  computed: {
    isActive: function() {
      return this.status == 'active';
    },
  },

  data() {
    return {
      searchWords: '',
    };
  },

  watch: {
    status: function(val, oldval) {
      console.log('Legal:status changed from ' + oldval + ' to ' + val);
    },
  },

  beforeMount: function() {
    console.log('Legal:beforeMount');
    this.searchWords = this.$SE.getSearchWords() + '&as_sitesearch=legifrance.gouv.fr';
    console.log('searchWords: ' + this.searchWords);
  },

  mounted: function() {
    console.log('>Legal:mounted');
    //console.log(this.$SE.createSearchLinks(encodeURIComponent('"' + this.$SE.getSearchWords() + '"' + "+délibération")));
    //console.log(this.$SE.createSearchLinks(this.searchWords);
  },

  methods: {
    trustedResults: function() {
      console.log('>Legal:trustedResults');
    },
  },
};
</script>

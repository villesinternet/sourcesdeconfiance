<template>
  <div v-show="isActive">
    <!-- <Web service="legal" :se="$SE" :visible="isActive" :status="status" :useSERP="false" :getSearchWords="getSearchWords" @trustedresults="trustedResults" /> -->
  </div>
</template>

<script>
// import Web from './Web.vue';

export default {
  name: 'Legal',
  components: {
    // Web,
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
      getSearchWords: '',
    };
  },

  watch: {
    status: function(val, oldval) {
      console.log('Legal:status changed from ' + oldval + ' to ' + val);
    },
  },

  beforeMount: function() {
    console.log('Legal:beforeMount');
    this.getSearchWords = this.$SE.getgetSearchWords() + '&as_sitesearch=legifrance.gouv.fr';
    console.log('getSearchWords: ' + this.getSearchWords);
  },

  mounted: function() {
    console.log('>Legal:mounted');
    //console.log(this.$SE.createSearchLinks(encodeURIComponent('"' + this.$SE.getgetSearchWords() + '"' + "+délibération")));
    //console.log(this.$SE.createSearchLinks(this.getSearchWords);
  },

  methods: {
    trustedResults: function() {
      console.log('>Legal:trustedResults');
    },
  },
};
</script>

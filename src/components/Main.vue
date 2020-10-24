<template>
  <div v-show="active" class="sdc-flex">
    <div class="sdc-w-2/3 sdc-mr-2">
      <!-- <Confiance :active="active"/> -->
    </div>

    <div class="sdc-w-1/3 sdc-ml-2">
      <Paris :active="active" />
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';

import Confiance from './Confiance2.vue';
import Paris from './Paris.vue';

//import * as Google from '../search_engines/google'

export default {
  name: 'Main',

  components: {
    Confiance,
    Paris,
    // Pagination,
    // Result,
    // Rotate,
    // WebFilters,
  },

  props: {
    active: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {},

  watch: {},

  mounted: function() {
    console.log('>Main component mounted');

    // Register this service in the comms helper
    //this.service = this.$options.name;
  },

  methods: {},
};
</script>

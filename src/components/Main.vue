<template>
  <div class="sdc-flex">
    <div>
      <!-- <div v-show="active" class="sdc-w-2/3 sdc-mr-2"> -->
      <div class="sdc-mr-2">
        <!-- <Confiance :active="active" @categorized="categorized"/> -->
      </div>

      <!-- <div class="sdc-w-1/3 sdc-ml-2">
        <Paris :active="active" />
      </div> -->
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import Events from '../helpers/eventbus.js';

import Confiance from './Confiance.vue';
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
    // active: {
    //   type: Boolean,
    //   required: true
    // },
    // selected: {
    //   type: Boolean,
    //   required: true
    // }
  },

  data() {
    return {};
  },

  computed: {},

  watch: {
    // active: function (is, was) {
    //   console.log(`>${this.$options.name}@active: was=${was} is=${is}`);
    // },
    // selected: function (is, was) {
    //   console.log(`>${this.$options.name}@selected: was=${was} is=${is}`);
    // }
  },

  mounted: function() {
    console.log(`>${this.$options.name}@mounted: active=${this.active}`);

    // Events.$on('PANEL_ACTIVE', (payload) => {
    //   console.log('PANEL_ACTIVE');
    //   console.log(payload);
    // });

    // Events.$on('TAB_SELECTED', (payload) => {
    //   console.log('TAB_SELECTED');
    //   console.log(payload);
    // });
  },

  methods: {
    categorized: function(results) {
      console.log(`>${this.$options.name}@categorized`);
      // We now have categorized results from first SERP - signal it to parent
      this.$emit('categorized', results);
    },
  },
};
</script>

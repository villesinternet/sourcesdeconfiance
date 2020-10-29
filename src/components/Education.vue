<template>
  <div class="sdc-flex">
    <div v-for="widget in widgets" class="sdc-mr-2" :class="widget.rootClass">
      <component :key="widget.name" :is="widget.component" :name="widget.name" />
      <!-- <div  class="sdc-w-2/3 sdc-mr-2">
        <Canope/>
      </div>

      <div class="sdc-w-1/3 sdc-mr-2">
        <Edutheque/>
      </div> -->
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import Events from '../helpers/eventbus.js';

import Edutheque from './Edutheque.vue';
import Canope from './Canope.vue';

export default {
  name: 'Education',

  components: {
    Canope,
    Edutheque,
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    // active: {
    //   type: Boolean,
    //   required: true
    // },

    // selected: {
    //   type: Boolean,
    //   required: true
    // },
  },

  data() {
    return {
      widgets: {},
    };
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

  beforeMount: function() {
    console.log(`>${this.name}@beforeMount`);
  },

  created: function() {
    console.log(`>${this.name}@created`);

    // Get our widgets list and configuration
    this.widgets = global.sdcConfig.get('panel.tabs.education.widgets');

    console.log(this.widgets);
  },

  mounted: function() {
    console.log(`>${this.name}@mounted`);

    Events.$on('TAB_REFRESH', pl => {
      console.log('received TAB_REFRESH');
      console.assert(pl.name, 'Error: name is undefined');

      // Is this for us?
      if (pl.name != this.name) return;

      console.log('For us');

      Object.values(this.widgets).forEach(widget => {
        Events.$emit('WIDGET_REFRESH', {
          name: widget.name,
        });
      });
    });
  },

  beforeDestroy: function() {
    console.log('>' + this.name + '@beforeDestroy');
  },

  destroyed: function() {
    console.log('>' + this.name + '@destroyed');
  },

  watch: {
    // active: function (is, was) {
    //   console.log(`>${this.$options.name}@active: was=${was} is=${is}`);
    // }
  },

  methods: {},
};
</script>

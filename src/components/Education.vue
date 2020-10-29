<template>
  <div class="sdc-flex">
    <div v-for="widget in widgets" class="sdc-mr-2" :class="widget.rootClass">
      <component :key="widget.name" :is="widget.component" :name="widget.name" />
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import * as Events from '../helpers/events.js';

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
  },

  data() {
    return {
      widgets: {},

      active: false,
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

    Events.listen('TAB_SHOW', pl => {
      console.assert(pl.name, 'Error: name is undefined');

      // Is this for us?
      if (pl.name != this.name) return;

      console.log(`${this.name} received TAB_SHOW`);

      this.active = true;
    });

    Events.listen('TAB_HIDE', pl => {
      console.assert(pl.name, 'Error: name is undefined');

      // Is this for us?
      if (pl.name != this.name) return;
      console.log(`${this.name} received TAB_HIDE`);

      this.active = false;
    });

    Events.listen('TAB_REFRESH', pl => {
      console.assert(pl.name, 'Error: name is undefined');

      // Is this for us?
      if (pl.name != this.name) return;

      Object.values(this.widgets).forEach(widget => {
        Events.send('WIDGET_REFRESH', {
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

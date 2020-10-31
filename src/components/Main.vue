<template>
  <div class="sdc-flex">
    <div v-for="widget in widgets" class="sdc-mr-2" :class="widget.rootClass">
      <component :is="widget.component" :name="widget.name" :prefs="widget.prefs" />
    </div>
  </div>
</template>

<script>
import * as comms from '../helpers/comms.js';
import * as helpers from '../helpers/general.js';
import * as Events from '../helpers/events.js';

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

  created: function() {
    this.widgets = global.sdcConfig.get('panel.tabs.main.widgets');

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

  mounted: function() {
    console.log(`>${this.$options.name}@mounted: active=${this.active}`);
  },

  methods: {
    // categorized: function(results) {
    //   console.log(`>${this.$options.name}@categorized`);
    //   // We now have categorized results from first SERP - signal it to parent
    //   this.$emit('categorized', results);
    // },
  },
};
</script>

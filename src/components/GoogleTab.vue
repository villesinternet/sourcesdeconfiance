<template>
  <div @click="click" class="hdtb-mitem hdtb-imb" :class="{ 'hdtb-msel': isActive }" aria-hidden="true">
    <span v-if="isActive">
      <slot name="logo_active">
        <!-- Default active logo -->
        <img :src="logo" style="display:inline;" />
      </slot>

      <!-- Default content -->
      <slot>
        Sources de Confiance
      </slot>

      <slot name="count"></slot>
    </span>

    <span v-else>
      <slot name="logo_inactive">
        <!-- Default inactive logo -->
        <img :src="logo" style="display:inline;" />
      </slot>

      <slot>
        Inactive
      </slot>

      <slot name="count"></slot>
    </span>
  </div>
</template>

<script>
import * as helpers from '../helpers/general.js';

export default {
  name: 'GoogleTab',

  computed: {
    logo: function() {
      return this.isActive ? helpers.asset('icons/sdc-12.png') : helpers.asset('icons/sdc-off-12.png');
    },
  },

  data() {
    return {
      isActive: false,

      activeTab: null,

      inactiveTab: null,
    };
  },

  mounted: function() {
    console.log('>Tab:mounted');

    this.activeTab = document
      .getElementById('hdtb-msb-vis')
      .getElementsByTagName('div')[0]
      .cloneNode(true);

    this.inactiveTab = document.createElement('div');
    this.inactiveTab.setAttribute('class', 'hdtb-mitem hdtb-imb');
    var a = document.createElement('a');
    a.setAttribute('class', 'q qs');
    a.setAttribute('href', window.location.pathname + window.location.search);
    a.setAttribute('data-sc', 'A');
    this.inactiveTab.appendChild(a);

    var span = document.createElement('span');
    span.setAttribute('class', 'HF9Klc iJddsb');
    span.setAttribute('style', 'height:16px;width:16px');
    a.appendChild(span);

    var text = document.createTextNode(this.activeTab.textContent);
    a.appendChild(text);

    var svg = document.createElement('svg');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', '0 0 24 24');
    span.appendChild(svg);

    var path = document.createElement('path');
    path.setAttribute('d', 'M16.32 14.88a8.04 8.04 0 1 0-1.44 1.44l5.76 5.76 1.44-1.44-5.76-5.76zm-6.36 1.08c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6');
    svg.appendChild(path);
  },

  updated: function() {
    //console.log('>Tab:updated');
    this.$nextTick(function() {
      //console.log('>Tab:updated>nextTick');
    });
  },

  methods: {
    click: function() {
      this.$parent.$emit('tabClick', this.isActive);
    },

    activate: function(active) {
      console.log('>activate ' + active);
      this.isActive = active;

      console.log(this.isActive ? this.inactiveTab : this.activeTab);

      // Set Google's 'All' tab to reflect position
      document
        .getElementById('hdtb-msb-vis')
        .getElementsByTagName('div')[0]
        .replaceWith(this.isActive ? this.inactiveTab : this.activeTab);
    },
  },
};
</script>

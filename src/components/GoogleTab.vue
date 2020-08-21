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

    // this.activeTab = document.getElementById('hdtb-msb-vis').getElementsByTagName('div')[0];

    // this.inactiveTab = this.activeTab.cloneNode(true);

    // this.inactiveTab.classList.remove("hdtb-msel");

    // var svg = document.createElement("svg");
    // svg.setAttribute("focusable","false");
    // svg.setAttribute("viewBox","0 0 24 24");
    // var path = document.createElement("path");
    // path.setAttribute("d","M16.32 14.88a8.04 8.04 0 1 0-1.44 1.44l5.76 5.76 1.44-1.44-5.76-5.76zm-6.36 1.08c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6");
    // svg.appendChild(path);
    // this.inactiveTab.getElementsByTagName("svg")[0].replaceWith(svg);

    // var anchor = document.createElement("a");
    // anchor.setAttribute("class", "q qs");
    // var el = this.inactiveTab.firstChild;
    // while (el) {
    //   console.log(el);
    //   anchor.appendChild(el);
    //   el = el.nextSibling;
    // }
    // anchor.textContent = this.inactiveTab.textContent;
    // for (let item of this.inactiveTab.children) {
    //   anchor.appendChild(item);
    // }

    //this.inactiveTab.textContent = null;
    // this.inactiveTab.appendChild(anchor);

    // this.activeTab.parentNode.insertBefore(this.inactiveTab,this.activeTab.nextSibling);

    /*
      <div class="hdtb-mitem hdtb-imb">
        <a class="q qs" href="/search?q=lyon&amp;biw=1111&amp;bih=623&amp;source=lnms&amp;sa=X&amp;ved=0ahUKEwjDhvirj6rrAhUFzhoKHd8sDL0Q_AUIDSgA" data-sc="A">
          <span class="HF9Klc iJddsb" style="height:16px;width:16px">
            <svg focusable="false" viewBox="0 0 24 24">
              <path d="M16.32 14.88a8.04 8.04 0 1 0-1.44 1.44l5.76 5.76 1.44-1.44-5.76-5.76zm-6.36 1.08c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6">
              </path>
            </svg>
          </span>
          Tous
        </a>
      </div>
     */
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

      // Set Google's 'All' tab to reflect position
    },
  },
};
</script>

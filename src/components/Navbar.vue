<template>
  <div class="sdc-flex sdc-justify-between sdc-items-center">
    <div class="sdc-flex sdc-items-center sdc-justify-between sdc-p-0">
      <div v-show="false">
        <img class="sdc-h-5" :src="logo" alt="Logo Sources de Confiance" />
      </div>
      <div class="">
        <ul class="sdc-flex">
          <li v-for="(tab, key) in tabs" :class="tab.status ? 'sdc--mb-px' : ''" class="sdc-mr-1">
            <button :id="key" v-bind:disabled="isDisabled(tab)" :class="tabClass(tab.status)" v-on:click="$emit('select', key)">{{ tab.title }}</button>
          </li>
          <!-- <li class="sdc--mb-px sdc-mr-1">
            <a :class="activeClass" href="#">Web</a>
          </li>
          <li class="sdc-mr-1">
            <a :class="inactiveClass" href="#">Tab</a>
          </li>
          <li class="sdc-mr-1">
            <a :class="inactiveClass" href="#">Tabs</a>
          </li>
          <li class="sdc-mr-1">
            <a :class="disabledClass" href="#">Tab</a>
          </li> -->
        </ul>
      </div>
    </div>
    <div>
      Login
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBar',

  props: {
    logo: {
      type: String,
      required: true,
    },

    tabs: {
      type: Object,
      required: true,
    },
  },

  computed: {
    baseClass: function() {
      return 'sdc-inline-block sdc-bg-white hover:sdc-no-underline';
    },

    activeClass: function() {
      return this.baseClass + ' sdc-border-b-4 sdc-border-green-600 sdc-py-2 sdc-px-4 sdc-text-blue-700 ';
    },

    inactiveClass: function() {
      return this.baseClass + ' sdc-border-b-0 sdc-py-2 sdc-px-4 sdc-text-blue-500 hover:sdc-text-blue-800';
    },

    disabledClass: function() {
      return this.baseClass + ' sdc-py-2 sdc-px-4 sdc-text-gray-400 ';
    },
  },

  methods: {
    isDisabled: function(tab) {
      return tab.status == 'disabled';
    },

    tabClass: function(status) {
      switch (status) {
        case 'active':
          return this.activeClass;
        case 'inactive':
          return this.inactiveClass;
        case 'disabled':
          return this.disabledClass;
      }
    },
  },
};
</script>

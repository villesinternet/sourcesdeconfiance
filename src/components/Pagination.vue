<template>
  <!-- <div class="sdc-bg-white sdc-px-4 sdc-py-3 sdc-flex sdc-items-center sdc-justify-between sdc-border-t sdc-border-gray-200 sm:sdc-px-6"> -->
  <div class="">
    <div class="sdc-hidden sm:sdc-flex-1 sm:sdc-flex sm:sdc-items-center sm:sdc-justify-between">
      <div>
        <p class="sdc-text-sm sdc-leading-5 sdc-text-gray-700">
          Résultats
          <span class="sdc-font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
          à
          <span class="sdc-font-medium">
            {{ currentPage * itemsPerPage > countItems ? countItems : currentPage * itemsPerPage }}
          </span>
        </p>
      </div>

      <div>
        <nav class="sdc-relative sdc-z-0 sdc-inline-flex sdc-shadow-sm">
          <a
            v-for="i in countPages"
            ref="sdcPageButtons"
            href="#"
            :class="{ focus: currentPage == i }"
            class="-sdc-ml-px sdc-relative sdc-inline-flex sdc-items-center sdc-px-4 sdc-py-2 
            sdc-border sdc-border-gray-300 
            sdc-bg-white 
            sdc-text-sm sdc-leading-5 sdc-font-medium sdc-text-gray-700 
            hover:sdc-text-gray-500 
            focus:sdc-z-10 focus:sdc-outline-none focus:sdc-border-blue-300 focus:sdc-shadow-outline-blue focus:sdc-text-red
            active:sdc-bg-blue-400 active:sdc-text-gray-700 
            sdc-transition sdc-ease-in-out sdc-duration-150"
            @click.stop.prevent="updatePage(i)"
          >
            {{ i }}
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',

  props: {
    countItems: {
      type: Number,
      required: true,
    },

    itemsPerPage: {
      type: Number,
      required: true,
    },
  },

  data: function() {
    return {
      currentPage: 1,
    };
  },

  computed: {
    countPages: function() {
      return Math.ceil(this.countItems / this.itemsPerPage);
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.focusPageSelector();
    });
  },

  methods: {
    updatePage: function(pageNumber) {
      this.currentPage = pageNumber;

      this.focusPageSelector();

      this.$emit('pageselect', this.currentPage);
    },

    focusPageSelector: function() {
      if (this.$refs['sdcPage' + this.currentPage]) this.$refs['sdcPage' + this.currentPage].focus();
    },
  },
};
</script>

<template>
  <!-- <div class="sdc-bg-white sdc-px-4 sdc-py-3 sdc-flex sdc-items-center sdc-justify-between sdc-border-t sdc-border-gray-200 sm:sdc-px-6"> -->
  <div class="">
    <!-- <div class="sdc-flex-1 sdc-flex sdc-justify-between sm:sdc-hidden">
      <a
        href="#"
        class="sdc-relative sdc-inline-flex sdc-items-center sdc-px-4 sdc-py-2 sdc-border sdc-border-gray-300 sdc-text-sm sdc-leading-5 sdc-font-medium sdc-rounded-md sdc-text-gray-700 sdc-bg-white hover:sdc-text-gray-500 focus:sdc-outline-none focus:sdc-shadow-outline-blue focus:sdc-border-blue-300 active:sdc-bg-gray-100 active:sdc-text-gray-700 sdc-transition sdc-ease-in-out sdc-duration-150"
      >
        Précedent
      </a>
      <a
        href="#"
        class="sdc-ml-3 sdc-relative sdc-inline-flex sdc-items-center sdc-px-4 sdc-py-2 sdc-border border-gray-300 sdc-text-sm sdc-leading-5 sdc-font-medium sdc-rounded-md sdc-text-gray-700 sdc-bg-white hover:sdc-text-gray-500 focus:sdc-outline-none focus:sdc-shadow-outline-blue focus:sdc-border-blue-300 active:sdc-bg-gray-100 active:sdc-text-gray-700 sdc-transition sdc-ease-in-out sdc-duration-150"
      >
        Suivant
      </a>
    </div> -->
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
          <!-- <a
            ref="sdcPagePrev"
            href="#"
            class="sdc-relative sdc-inline-flex sdc-items-center sdc-px-2 sdc-py-2 
            sdc-rounded-l-md sdc-border sdc-border-gray-300 
            sdc-bg-white 
            sdc-text-sm sdc-leading-5 sdc-font-medium sdc-text-gray-500 
            hover:sdc-text-gray-400 focus:sdc-z-10 focus:sdc-outline-none 
            active:sdc-bg-red-100 active:sdc-text-gray-500             
            sdc-transition sdc-ease-in-out sdc-duration-150"
            aria-label="Précedent"
            @click="updatePage('prev')"
          >
            <svg class="sdc-h-5 sdc-w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </a> -->

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

          <!-- <a
            v-show="nextButton"
            ref="sdcPageNext"
            href="#"
            class="-sdc-ml-px sdc-relative sdc-inline-flex sdc-items-center sdc-px-2 sdc-py-2 
            sdc-rounded-r-md sdc-border sdc-border-gray-300 
            sdc-bg-white 
            sdc-text-sm sdc-leading-5 sdc-font-medium sdc-text-gray-500 
            hover:sdc-text-gray-400 focus:sdc-z-10 focus:sdc-outline-none 
            active:sdc-bg-red-100 active:sdc-text-gray-500 
            sdc-transition sdc-ease-in-out sdc-duration-150"
            aria-label="Suivant"
            @click="updatePage('next')"
          >
            <svg class="sdc-h-5 sdc-w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </a> -->
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

  data: function() {
    return {
      currentPage: 1,
    };
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

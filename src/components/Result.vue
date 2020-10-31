<template>
  <div class="sdc-flex">
    <div class="sdc-mt-0">
      <a v-show="showUrl" :href="result.url" class="sdc-text-xs sdc-text-gray-500">
        <p class="sdc-truncate">{{ result.url }}</p>
      </a>

      <a v-show="showTitle" :href="result.url" class="sdc-block sdc-text-base sdc-leading-tight sdc-text-green-500 hover:sdc-underline">
        {{ result.title }}
      </a>

      <p v-show="showSnippet" class="sdc-text-gray-700 sdc-text-sm">
        {{ result.snippet }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Result',

  props: {
    result: {
      type: Object,
      required: false,
    },

    showUrl: {
      type: Boolean,
      default: true,
    },

    showTitle: {
      type: Boolean,
      default: true,
    },

    showSnippet: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<template>
  <div class="sdc-flex">
    <div class="sdc-mt-0">
      <a :href="result.url" class="sdc-text-sm sdc-text-gray-500">
        <p class="sdc-truncate">{{ result.url }}</p>
      </a>

      <a :href="result.url" class="sdc-block sdc-text-lg sdc-leading-tight sdc-text-green-500 hover:sdc-underline">
        {{ result.name }}
      </a>

      <p class="sdc-text-gray-700">
        {{ result.snippet }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Result',

  props: ['result'],
};
</script>

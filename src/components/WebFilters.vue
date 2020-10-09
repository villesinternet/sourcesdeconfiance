<template>
  <div class="sdc-flex md:sdc-items-center sdc-justify-start sdc-mb-6">
    <div class="sdc-flex sdc-items-center sdc-mr-3">
      <label class="sdc-block sdc-text-gray-700">
        <input class="sdc-mr-2 sdc-leading-tight" type="checkbox" v-model="checked" />
        <span class="sdc-text-sm">
          Seulement Paris
        </span>
      </label>
    </div>

    <div v-if="checked" class="sdc-flex">
      <label class="sdc-block sdc-text-gray-700 p-r-1">
        Arrondissement:
      </label>
      <select
        class="sdc-block sdc-appearance-none sdc-w-full sdc-border-b sdc-border-gray-700 sdc-text-gray-700 sdc-pb-0 sdc-leading-tight focus:sdc-outline-none focus:sdc-bg-white focus:sdc-border-gray-700 sdc-text-right"
      >
        <option>Tous</option>
        <option>1er</option>
        <option>2ème</option>
        <option>3ème</option>
        <option>4ème</option>
        <option>5ème</option>
        <option>6ème</option>
        <option>7ème</option>
        <option>8ème</option>
        <option>9ème</option>
        <option>10ème</option>
        <option>11ème</option>
        <option>12ème</option>
        <option>13ème</option>
        <option>14ème</option>
        <option>15ème</option>
        <option>16ème</option>
        <option>17ème</option>
        <option>18ème</option>
        <option>19ème</option>
        <option>20ème</option>
      </select>
      <div class="sdc-flex sdc-inset-y-0 sdc-items-center sdc-border-b sdc-right-0 sdc-text-gray-700  sdc-border-gray-700 sdc-pointer-events-auto">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="sdc-fill-current sdc-h-4 sdc-w-4">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WebFilters',

  data() {
    return {
      checked: false,
    };
  },
};
</script>

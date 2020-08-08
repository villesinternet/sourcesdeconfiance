<template>
  <div class="sdc-relative sdc-inline-flex sdc-rounded-md sdc-shadow-sm">
    <button
      type="button"
      class="sdc-inline-flex sdc-items-center sdc-px-4 sdc-py-2 sdc-border sdc-border-gray-400 sdc-text-base sdc-leading-6 sdc-font-medium sdc-rounded-md sdc-text-gray-800 sdc-bg-white hover:sdc-text-gray-700 focus:sdc-outline-none focus:sdc-border-blue-300 focus:sdc-shadow-outline-blue active:sdc-text-gray-800 active:sdc-bg-gray-50 sdc-transition sdc-ease-in-out sdc-duration-150"
    >
      Transactions
    </button>
    <span class="sdc-flex sdc-absolute sdc-h-3 sdc-w-3 sdc-top-0 sdc-right-0 sdc--mt-1 sdc--mr-1">
      <span class="sdc-animate-ping sdc-absolute sdc-inline-flex sdc-h-full sdc-w-full sdc-rounded-full sdc-bg-pink-400 sdc-opacity-75"></span>
      <span class="sdc-relative sdc-inline-flex sdc-rounded-full sdc-h-3 sdc-w-3 sdc-bg-pink-500"></span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'Pulse',
};
</script>

<template>
  <div id="agregate" @click="toggle()" class="hdtb-mitem hdtb-imb" :class="{ 'hdtb-msel': isActive }" aria-hidden="true">
    <span v-if="isActive">
      <a class="q qs" href="#" data-sc="A">
        <span class="HF9Klc iJddsb" style="height:16px;width:16px">
          <svg focusable="false" viewBox="0 0 24 24">
            <path d="M10 2v2a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8" fill="#34A853"></path>
            <path d="M10 4V2a8 8 0 0 0-8 8h2c0-3.3 2.7-6 6-6" fill="#EA4335"></path>
            <path d="M4 10H2a8 8 0 0 0 8 8v-2c-3.3 0-6-2.69-6-6" fill="#FBBC04"></path>
            <path d="M22 20.59l-5.69-5.69A7.96 7.96 0 0 0 18 10h-2a6 6 0 0 1-6 6v2c1.85 0 3.52-.64 4.88-1.68l5.69 5.69L22 20.59" fill="#4285F4"></path>
          </svg>
        </span>
        SdC
      </a>
    </span>

    <span v-else>
      <span class="HF9Klc iJddsb" style="height:16px;width:16px">
        <svg focusable="false" viewBox="0 0 24 24">
          <path d="M16.32 14.88a8.04 8.04 0 1 0-1.44 1.44l5.76 5.76 1.44-1.44-5.76-5.76zm-6.36 1.08c-3.36 0-6-2.64-6-6s2.64-6 6-6 6 2.64 6 6-2.64 6-6 6"></path>
        </svg>
      </span>
      SdC
    </span>
  </div>
</template>

<script>
export default {
  props: ['agregates'],

  created: function() {
    // `this` points to the vm instance
    //console.log('created, agregates=' + this.agregates)
  },

  mounted: function() {
    // `this` points to the vm instance
    console.log('mounted, agregates=' + this.agregates);
  },

  data() {
    return {
      isActive: false,
    };
  },

  methods: {
    toggle: function() {
      this.isActive = !this.isActive;
    },
  },
};
</script>

<div id="agregate" class="hdtb-mitem hdtb-imb hdtb-msel">
    <span class="HF9Klc iJddsb" style="height: 16px; width: 16px;">
        <svg focusable="false" viewBox="0 0 24 24">
            <path d="M10 16.5l6-4.5-6-4.5" fill="#4285F4"></path>
            <path d="M20 12h2v7.5a2.5 2.5 0 0 1-2.5 2.5H12v-2h7a1 1 0 0 0 1-1v-7" fill="#EA4335"></path>
            <path d="M20 12V5a1 1 0 0 0-1-1h-7V2h7.6A2.4 2.4 0 0 1 22 4.4V12h-2" fill="#FBBC04"></path>
            <path d="M12 20v2H5a3 3 0 0 1-3-3V4.4A2.4 2.4 0 0 1 4.4 2H12v2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7" fill="#34A853"></path>
        </svg>
        </span> 
        <a class="q qs">
            SdC
        </a>
    </div>

<div class="hdtb-mitem hdtb-msel hdtb-imb" aria-hidden="true">
    <span class="HF9Klc iJddsb" style="height:16px;width:16px">
        <svg focusable="false" viewBox="0 0 24 24">
            <path d="M10 2v2a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8" fill="#34A853"></path>
            <path d="M10 4V2a8 8 0 0 0-8 8h2c0-3.3 2.7-6 6-6" fill="#EA4335"></path>
            <path d="M4 10H2a8 8 0 0 0 8 8v-2c-3.3 0-6-2.69-6-6" fill="#FBBC04"></path>
            <path d="M22 20.59l-5.69-5.69A7.96 7.96 0 0 0 18 10h-2a6 6 0 0 1-6 6v2c1.85 0 3.52-.64 4.88-1.68l5.69 5.69L22 20.59" fill="#4285F4"></path>
        </svg>
    </span>
    All
</div>

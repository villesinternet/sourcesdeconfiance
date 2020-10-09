<template>
  <div v-if="open" class="sdc-modal sdc-h-screen sdc-w-full sdc-fixed sdc-left-0 sdc-top-0 sdc-flex sdc-justify-center sdc-items-center sdc-bg-black sdc-bg-opacity-50">
    <!-- modal -->
    <!-- <div class="sdc-bg-white sdc-rounded sdc-shadow-lg sdc-w-1/3">
    	<div class="sdc-border-b sdc-px-4 sdc-py-2 sdc-flex sdc-justify-between sdc-items-center">
        	<h3 class="sdc-font-semibold sdc-text-lg">Modal Title</h3>
        	<button class="sdc-text-black " @click="close">&cross;</button>
      	</div>
      	<div class="sdc-p-3">
        	Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rerum, delectus cumque fugiat nemo ducimus quae deserunt cupiditate sapiente incidunt aut accusantium dolore assumenda vitae similique, exercitationem voluptatum praesentium laboriosam nam.
      	</div>
      	<div class="sdc-flex sdc-justify-end sdc-items-center sdc-w-100 sdc-border-t p-3">
        	<button class="sdc-bg-red-600 hover:sdc-bg-red-700 sdc-px-3 sdc-py-1 sdc-rounded sdc-text-white sdc-mr-1" @click="close">Cancel</button>
        	<button class="sdc-bg-blue-600 hover:sdc-bg-blue-700 sdc-px-3 sdc-py-1 sdc-rounded sdc-text-white" @click="close">Ok</button>
      	</div>
    </div> -->
    <div class="sdc-bg-white sdc-shadow-md sdc-rounded sdc-px-8 sdc-pt-6 sdc-pb-8 sdc-mb-4 sdc-flex sdc-flex-col">
      <div class="sdc-mb-4">
        <label class="sdc-block sdc-text-grey-darker sdc-text-sm sdc-font-bold sdc-mb-2" for="username"> </label>
        <input
          class="sdc-shadow sdc-appearance-none sdc-border sdc-rounded sdc-w-full sdc-py-2 sdc-px-3 sdc-text-grey-darker"
          id="email"
          type="text"
          placeholder="votre adresse mail"
        />
      </div>

      <div class="sdc-mb-6">
        <label class="sdc-block sdc-text-grey-darker sdc-text-sm sdc-font-bold sdc-mb-2" for="password"> </label>
        <input
          class="sdc-shadow sdc-appearance-none sdc-border sdc-rounded sdc-w-full sdc-py-2 sdc-px-3 sdc-text-grey-darker sdc-mb-3"
          id="password"
          type="password"
          placeholder="mote de passe"
        />
      </div>
      <div>
        <div class="sdc-flex sdc-items-center sdc-justify-between">
          <button class="sdc-bg-transparent hover:sdc-bg-teal sdc-text-teal-dark hover:sdc-text-white sdc-py-2 sdc-px-4 mr-2" @click="close">
            Annuler
          </button>

          <button
            class="sdc-bg-transparent hover:sdc-bg-teal sdc-text-teal-dark sdc-font-semibold hover:sdc-text-white sdc-py-2 sdc-px-4 sdc-border sdc-border-teal hover:sdc-border-transparent sdc-rounded mr-2"
            @click="close"
          >
            Connexion
          </button>
        </div>
      </div>
      <div class="sdc-justify-center">
        <a class="sdc-inline-block sdc-align-baseline sdc-text-sm sdc-text-grey-500 hover:sdc-text-grey-darker" href="#" @click="close">
          Mot de passe oublié?
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',

  props: {
    active: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      open: false,
    };
  },

  watch: {
    active: function(val) {
      console.log('>Login:active val=' + val);
      this.open = val;
    },
  },

  methods: {
    close: function() {
      console.log('>Login:close');
      this.open = false;
      this.$emit('loggedin');
    },
  },
};
</script>

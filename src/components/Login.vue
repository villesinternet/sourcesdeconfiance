<template>
  <div v-if="open" class="sdc-modal sdc-h-screen sdc-w-full sdc-fixed sdc-left-0 sdc-top-0 sdc-flex sdc-justify-center sdc-items-center sdc-bg-black sdc-bg-opacity-50">
    <div class="sdc-relative sdc-w-full sdc-max-w-sm sdc-p-4 sdc-bg-white sdc-rounded-md sdc-shadow-md sdc-sm:p-6">
      <div class="sdc-absolute sdc-right-0 sdc-pr-4 sdc-pt-1">
        <svg class="sdc-fill-current sdc-h-6 sdc-w-6 sdc-text-grey-700" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" @click="close">
          <title>
            Fermer
          </title>
          <path
            d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
          ></path>
        </svg>
      </div>

      <div class="sdc-flex sdc-items-center sdc-justify-center">
        <!-- <span class="sdc-text-xl sdc-font-medium sdc-text-gray-900">Login</span> -->
        <h4 id="modal-headline" class="sdc-text-2xl sdc-pt-1 sdc-leading-6 sdc-font-black sdc-text-gray-700">
          Connexion
        </h4>
      </div>

      <form class="sdc-mt-4">
        <label for="email" class="sdc-block">
          <span class="sdc-text-sm tsdc-ext-gray-700">Adresse mail</span>
          <input
            type="email"
            id="email"
            name="email"
            autocomplete="username"
            class="sdc-block sdc-w-full sdc-px-3 sdc-py-2 sdc-mt-1 sdc-text-gray-700 sdc-border sdc-rounded-md sdc-form-input focus:sdc-border-indigo-600"
            required
          />
        </label>
        <label for="password" class="sdc-block sdc-mt-3">
          <span class="sdc-text-sm sdc-text-gray-700">Mot de passe</span>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            class="sdc-block sdc-w-full sdc-px-3 sdc-py-2 sdc-mt-1 sdc-text-gray-700 sdc-border sdc-rounded-md sdc-form-input focus:sdc-border-indigo-600"
            required
          />
        </label>
        <div class="sdc-flex sdc-items-center sdc-justify-between sdc-mt-4">
          <div>
            <label class="sdc-inline-flex sdc-items-center">
              <input type="checkbox" class="sdc-text-indigo-600 sdc-border sdc-form-checkbox" />
              <span class="sdc-mx-2 sdc-text-sm sdc-text-gray-600">Se souvenir de moi</span>
            </label>
          </div>
          <div>
            <a class="sdc-block sdc-text-sm sdc-text-indigo-700 sdc-fontme hover:sdc-underline" href="#" @click="forgotPassword">Mot de passe oublié</a>
          </div>
        </div>
        <div class="sdc-mt-6">
          <button
            type="submit"
            class="sdc-w-full sdc-px-4 sdc-py-2 sdc-text-sm sdc-text-center sdc-text-white sdc-bg-indigo-600 sdc-rounded-md hover:sdc-bg-indigo-500"
            @click="loggedIn"
          >
            Connexion
          </button>
        </div>
      </form>
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
      this.open = false;
      this.$emit('close');
    },

    loggedIn: function() {
      this.close();
      this.$emit('loggedin');
    },

    forgotPassword: function() {
      this.close();
      this.$emit('forgot_password');
    },
  },
};
</script>

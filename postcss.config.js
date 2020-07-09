/* eslint-disable import/no-extraneous-dependencies */
const tailwindcss = require('tailwindcss');

const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: ['./src/**/*.vue'],

  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],

  extractors: [
    // https://purgecss.com/guides/vue.html
    {
      extensions: ['vue'],
      extractor(content) {
        const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
        return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || [];
      },
    },
  ],

  whitelist: [],
  whitelistPatterns: [
    /-(leave|enter|appear)(|-(to|from|active))$/, // transitions
    /data-v-.*/, // scoped css
  ],
});

module.exports = {
  plugins: [tailwindcss(), ...(process.env.NODE_ENV === 'production' ? [purgecss] : [])],
};

import * as sdc from './sdc.js';
import * as helpers from './helpers/google.js';

console.log('Google SDC instance creation');

// Search Engine description & utilisy functions
var google = {
  name: 'google',
  maxRequests: 10,

  getSearchLinks: helpers.getSearchLinks, // Build links table to get additional results
  extractFromSERP: helpers.extractFromSERP, // Extract results from current page
  injectSDC: helpers.injectSDC, // Inject SDC Frame
  injectMenuItem: helpers.injectMenuItem, // Inject SDC Menu item

  menu: {
    // Menu management variables
    el: null, // Our item DOM element
    isActive: false, // Status
  },
};

// We only need to run SDC on the "All" Google pane (not images, news, etc)
if (!new URLSearchParams(window.location.search).get('tbm')) sdc.run(google);
// And... off we go !
else console.log('not launching. tbm=' + search.get('tbm'));

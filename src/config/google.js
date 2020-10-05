import * as helpers from '../helpers/google.js';

const config = {
  name: 'google',
  maxResults: 200,
  maxResultsPerRequest: 100,
  requestsDelay: 1500,

  getQueryString: helpers.getQueryString, // Get the query string
  getSearchLinks: helpers.getSearchLinks, // Build links table to get additional results
  extractFromSERP: helpers.extractFromSERP, // Extract results from current page
  injectFrame: helpers.injectFrame, // Inject SDC Frame
  injectMenuItem: helpers.injectMenuItem, // Inject SDC Menu item
  refreshTitle: helpers.refreshTitle, // Refresh tab's title & appearance
  highlight: helpers.highlight, // Highlight results in home page
};

export function getConfig() {
  return config;
}

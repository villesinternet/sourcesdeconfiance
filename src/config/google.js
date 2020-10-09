import * as helpers from '../helpers/google.js';

const config = {
  name: 'google',
  maxResults: 200,
  maxResultsPerRequest: 100,
  requestsDelay: 1500,

  getSearchWords: helpers.getSearchWords,
  buildSearchUrl: helpers.buildSearchUrl, // Build query string from search words
  getSearchLinks: helpers.getSearchLinks, // Build links table based on the current query
  createSearchLinks: helpers.createSearchLinks, // Create links with given searchwords
  getSearchWords: helpers.getSearchWords, // return search words for the current SERP
  extractFromSERP: helpers.extractFromSERP, // Extract results from current page
  injectFrame: helpers.injectFrame, // Inject SDC Frame
  injectMenuItem: helpers.injectMenuItem, // Inject SDC Menu item
  refreshTitle: helpers.refreshTitle, // Refresh tab's title & appearance
  highlight: helpers.highlight, // Highlight results in home page
};

export function getConfig() {
  return config;
}

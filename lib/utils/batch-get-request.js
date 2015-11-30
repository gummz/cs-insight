require('es6-promise').polyfill();

var getRequest = require('./get-request');
var pathToRegexp = require('path-to-regexp')

/**
 * async request data by GET and return Promise
 *
 * @param urls
 * @param items
 * @param options
 * @returns {Promise}
 */
module.exports = function(urls, items, options) {
  items = items !== undefined ? items : [];
  options = options || {};


  return Promise.all([].concat(items).map(function(item) {
    return Promise.all([].concat(urls).map(function(url) {
      var tokens = pathToRegexp.parse(url);
      var queryUrl;
      if (tokens.length > 1) {
        queryUrl = pathToRegexp.tokensToFunction(tokens)(item);
      } else {
        queryUrl = url + item;
      }
      if (options.proxyUrl) {
        queryUrl = options.proxyUrl + encodeURIComponent(queryUrl);
      }
      return getRequest(queryUrl, options)
        .catch(function(err) {
          return Promise.reject({
            item: item,
            url: url,
            res: err
          });
        });
    }))
      .then(function(res) {
        return Array.isArray(urls) ? res : res[0];
      });
  }));
};

require('es6-promise').polyfill();

var getRequest = require('./get-request');
var pathToRegexp = require('path-to-regexp');

/**
 * async request data by GET and return Promise
 *
 * @param urls
 * @param items
 * @param options
 * @returns {Promise}
 */
module.exports = function(urls, items, options) {
  items = items !== undefined ? [].concat(items) : [];

  //filter empty items
  items = items.filter(function(item) {
    return !!item;
  });

  return Promise.all(items.map(function(item) {
    return Promise.all([].concat(urls).map(function(url) {
      var tokens = pathToRegexp.parse(url);
      var queryUrl;
      if (tokens.length > 1) {
        queryUrl = pathToRegexp.tokensToFunction(tokens)(item);
      } else {
        queryUrl = url + item;
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

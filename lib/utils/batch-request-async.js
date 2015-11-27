require('es6-promise').polyfill();

var getRequest = require('./make-request-async');

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
      var queryUrl = url + item;
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

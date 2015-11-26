var axios = require('axios');
var Promise = require('bluebird');

/**
 * async request data by GET and return Promise
 *
 * @param urls
 * @param items
 * @param options
 * @returns {Promise}
 */
module.exports = function(urls, items, options) {
  if (items === undefined) {
    return Promise.reject();
  }

  options = options || {};

  return Promise.all([].concat(items).map(function(item) {
    return Promise.all([].concat(urls).map(function(url) {
      var queryUrl = url + item;
      if (options.proxyUrl) {
        queryUrl = options.proxyUrl + encodeURIComponent(queryUrl);
      }
      return axios.get(queryUrl)
        .then(function(res) {
          return res.data;
        });
    }));
  }));
};

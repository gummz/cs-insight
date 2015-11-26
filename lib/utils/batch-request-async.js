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

  return Promise.all([].concat(items).map(function(item) {
    return Promise.all([].concat(urls).map(function(url) {
      return axios.get(url + item)
        .then(function(res) {
          return res.data;
        });
    }));
  }));
};

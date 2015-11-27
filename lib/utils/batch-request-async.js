var axios = require('axios');
var Promise = require('bluebird');

function request(url, retry) {
  return axios.get(url)
    .catch(function(err) {
      if (err.code === 'ECONNRESET' && --retry > 0) {
        return request(url, retry);
      }
      return Promise.reject(err);
    });
}

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
      return request(queryUrl, options.retry || 10)
        .then(function(res) {
          return res.data;
        })
        .catch(function(err) {
          return Promise.reject({
            item: item,
            url: url,
            res: err
          });
        });
    }));
  }));
};

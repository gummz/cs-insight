var axios = require('axios');

/**
 * async request data by GET and return Promise
 *
 * @param uris
 * @param items
 * @param options
 * @returns {Promise}
 */
module.exports = function(uris, items, options) {
  return axios.get(uris);
};

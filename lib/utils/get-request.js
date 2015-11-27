require('es6-promise').polyfill();

var axios = require('axios');

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
 * @param url
 * @param options
 * @returns {Promise}
 */
module.exports = function(url, options) {
  return request(url, options ? options.retry : 10)
    .then(function(res) {
      return res.data;
    });
};

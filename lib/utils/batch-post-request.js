require('es6-promise').polyfill();

var axios = require('axios');

module.exports = function(url, items, options) {
  return Promise.all([].concat(items).map(function(item) {
    var queryUrl = url;
    options = options || {};

    if (options.proxyUrl) {
      queryUrl = options.proxyUrl + encodeURIComponent(queryUrl);
    }

    return axios.post(queryUrl, item)
      .catch(function(err) {
        return Promise.reject({
          item: item,
          url: url,
          res: err
        });
      });
  }));
};

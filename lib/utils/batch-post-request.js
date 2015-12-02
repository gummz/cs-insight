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

});

describe('cb-tests with proxy', function() {
  var options = {};

  before(function() {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });

    mockery.registerMock('httpify', function(options) {
      if (options.url && options.url.indexOf('https://tbtc.blockr.io/api/') === 0) {
        assert.fail(options.uri, proxyURL, 'Expect proxy URL used for request, but currently requesting blockr API directly');
      } else {
        request.apply(null, arguments);
      }
    });
  });

  beforeEach(function() {
    options.blockchain = new Blockchain('testnet', proxyURL);
  });

  require('cb-tester')(options);

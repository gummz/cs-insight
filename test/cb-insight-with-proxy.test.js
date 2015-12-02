require('es6-promise').polyfill();

var assert = require('assert');
var axios = require('axios');
var mockery = require('mockery');
var proxyURL = 'https://proxy.coin.space/?url=';


describe('cb-tests with proxy', function() {
  var options = {};

  before(function() {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    });

    mockery.registerMock('axios', {
      get: function(url) {
        if (url && url.indexOf(proxyURL) !== 0) {
          assert.fail(url, proxyURL, 'Expect proxy URL used for request, but currently requesting Bitpay API directly');
        } else {
          return axios.get(url);
        }
      },
      post: function(url, data) {
        if (url && url.indexOf(proxyURL) !== 0) {
          assert.fail(url, proxyURL, 'Expect proxy URL used for request, but currently requesting Bitpay API directly');
        } else {
          return axios.post(url, data);
        }
      }
    });
  });

  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  beforeEach(function() {
    options.blockchain = new (require('../'))('testnet', proxyURL);
  });

  require('cb-tester')(options);
});

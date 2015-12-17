var chai = require('chai');
var nock = require('nock');
var Wrapper = require('../');

var expect = chai.expect;

describe('Transactions', function() {
  var wrapper;

  describe('propagate', function() {
    it('should post new transaction', function(done) {
      wrapper = new Wrapper('testnet');
      nock('https://test-insight.bitpay.com')
        .post('/api/tx/send')
        .reply(200, 'hello world!');

      wrapper.transactions.propagate('ffd316b0c4feb9d29c61c3734fcde0167600441e560931c8c7267a9de3d9e29a')
        .then(function(res) {
          expect(res.data).to.be.equal('hello world!');
          done();
        })
        .catch(done);
    });

    it('should use proxy url if it was passed as option', function(done) {
      wrapper = new Wrapper('testnet', 'http://proxy.org/?url=');

      nock('http://proxy.org')
        .post('/?url=' + encodeURIComponent('https://test-insight.bitpay.com/api/tx/send'))
        .reply(200);

      wrapper.transactions.propagate('ffd316b0c4feb9d29c61c3734fcde0167600441e560931c8c7267a9de3d9e29a')
        .then(function() {

          done();
        })
        .catch(done);
    });
  });
});

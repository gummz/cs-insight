/*eslint no-new: 0*/

var assert = require('assert');
var Blockchain = require('../');

var proxyURL = 'https://proxy.coin.space/?url=';

describe('Blockchain', function() {
  describe('Constructor', function() {
    it('defaults to the bitcoin network', function() {
      var blockchain = new Blockchain();

      assert.equal(blockchain.getNetwork(), 'bitcoin');
    });

    it('allows a proxyURL to be passed in as the 2nd argument', function() {
      var blockchain = new Blockchain('testnet', proxyURL);
      assert.equal(blockchain.getProxyURL(), proxyURL);
    });
  });

  describe('getNetwork', function() {
    it('returns the underlying network name', function() {
      var blockchain = new Blockchain('testnet');

      assert.equal(blockchain.getNetwork(), 'testnet');
    });

    it('throws on unknown network', function() {
      assert.throws(function() {
        new Blockchain('zoigberg');
      }, /Unknown network: zoigberg/);
    });
  });
});

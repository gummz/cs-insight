/**
 * test transaction with block height
 */

var assert = require('assert');
var fixtures = require('./fixtures');

module.exports = function(options) {
  describe('Transactions', function() {
    var blockchain;

    beforeEach(function() {
      blockchain = options.blockchain;
    });

    describe('Get', function() {
      fixtures.transactions.slice(0, 10).forEach(function(f) {
        it('returns the transaction for ' + f.txId + ' correctly', function(done) {
          blockchain.transactions.get(f.txId, function(err, result) {
            assert.ifError(err);

            assert.strictEqual(result.txId, f.txId);
            assert.strictEqual(result.blockId, f.blockId);
            assert.strictEqual(result.txHex, f.txHex, result.txHex + ' != ' + f.txHex);

            done();
          });
        });
      });

      fixtures.invalid.transactions.forEach(function(f) {
        it('throws on ' + f, function(done) {
          blockchain.transactions.get(f, function(err) {
            assert.throws(function() {
              if (err) throw err;
            }, new RegExp(f + ' is not a valid txId'));

            done();
          });
        });
      });

      it('works for n of 0', function(done) {
        blockchain.transactions.get([], function(err, results) {
          assert.ifError(err);
          assert.strictEqual(results.length, 0);

          return done();
        });
      });

      it('works for n of ' + fixtures.transactions.length + ' transactions', function(done) {
        var txIds = fixtures.transactions.map(function(f) { return f.txId; });

        blockchain.transactions.get(txIds, function(err, results) {
          assert.ifError(err);

          assert.strictEqual(results.length, fixtures.transactions.length);

          fixtures.transactions.forEach(function(f) {
            assert(results.some(function(result) {
              return (result.txId === f.txId) && (result.txHex === f.txHex);
            }));
          });

          done();
        });
      });
    });
  });
};

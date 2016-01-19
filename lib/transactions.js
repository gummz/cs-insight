require('es6-promise').polyfill();

var assert = require('assert');
var batchGetRequest = require('./utils/index').batchGetRequest;
var batchPostRequest = require('./utils/index').batchPostRequest;

var rejectCallback = require('./utils/reject-callback');
var resolveCallback = require('./utils/resolve-callback');

function getTotalValue(inputs) {
  if (!inputs) return 0;

  return inputs.reduce(function(memo, input) {
    return memo + Math.round(input.value * 1e8);
  }, 0);
}

function Transactions(url, proxyUrl, blockEndpoint) {
  this.url = url;
  this.blockEndpoint = blockEndpoint;

  this.proxyUrl = proxyUrl;
}

/**
 * request information about transaction(s) by id(s)
 *
 * @param txIds
 * @param callback
 * @returns {axios.Promise}
 */
Transactions.prototype.get = function(txIds, callback) {
  var self = this;
  return batchGetRequest([this.url + 'rawtxs/', this.url + 'txs/'], txIds, {
    proxyUrl: this.proxyUrl
  })
    .then(function(transactions) {
      return Promise.all(transactions.map(function(item) {
        var raw = item[0];
        var summary = item[1];
        return self.blockEndpoint.summary(summary.blockhash)
          .then(function(block) {
            return {
              txId: summary.txid,
              txHex: raw.rawtx,
              blockId: summary.blockhash,
              blockHeight: block.blockHeight,

              // non-standard
              __blockTimestamp: summary.blocktime,
              __confirmations: summary.confirmations || 0
            };
          });
      }));
    })
    .then(function(results) {
      return resolveCallback(txIds, callback, results);
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
    });
};

Transactions.prototype.latest = function() {
  assert(false, 'There no appropriate API for that');
};

/**
 * request summary of transaction(s) by id(s)
 *
 * @param txIds
 * @param callback
 * @returns {axios.Promise}
 */
Transactions.prototype.summary = function(txIds, callback) {
  return batchGetRequest(this.url + 'txs/', txIds, {
    proxyUrl: this.proxyUrl
  })
    .then(function(txs) {
      var results = txs.map(function(tx) {
        return {
          txId: tx.txid,
          blockId: tx.blockhash,
          blockHeight: tx.blockheight,
          nInputs: tx.vin.length,
          nOutputs: tx.vout.length,
          totalInputValue: getTotalValue(tx.vin),
          totalOutputValue: getTotalValue(tx.vout)
        };
      });

      return resolveCallback(txIds, callback, results);
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
    });
};

/**
 * post some transactions
 *
 * @param transactions
 * @param callback
 * @returns {axios.Promise}
 */
Transactions.prototype.propagate = function(transactions, callback) {
  return batchPostRequest(
    this.url + 'tx/send',
    [].concat(transactions).map(function(hex) {
      return {rawtx: hex};
    }), {
      proxyUrl: this.proxyUrl
    })
    .then(function(results) {
      return resolveCallback(
        transactions,
        callback,
        results.map(function(item) {
          return item.data;
        }));
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
    });
};

module.exports = Transactions;

require('es6-promise').polyfill();

var batchRequestAsync = require('./../utils').batchRequestAsync;

var async = require('async');
var utils = require('./../utils');
var rejectCallback = require('./../utils/rejectCallback');
var resolveCallback = require('./../utils/resolveCallback');

function getTotalValue(inputs) {
  if (!inputs) return 0;

  return inputs.reduce(function(memo, input) {
    return memo + Math.round(input.value * 1e8);
  }, 0);
}

function Transactions(url, blockEndpoint) {
  this.url = url;
  this.blockEndpoint = blockEndpoint;
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
  return batchRequestAsync([this.url + 'rawtx/', this.url + 'tx/'], txIds)
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

/**
 * request summary of transaction(s) by id(s)
 *
 * @param txIds
 * @param callback
 * @returns {axios.Promise}
 */
Transactions.prototype.summary = function(txIds, callback) {
  var self = this;
  return batchRequestAsync(this.url + 'tx/', txIds)
    .then(function(transactions) {
      return Promise.all(transactions.map(function(transaction) {
        return self.blockEndpoint.summary(transaction.blockhash)
          .then(function(block) {
            return {
              txId: transaction.txid,
              blockId: transaction.blockhash,
              blockHeight: block.blockHeight,
              nInputs: transaction.vin.length,
              nOutputs: transaction.vout.length,
              totalInputValue: getTotalValue(transaction.vin),
              totalOutputValue: getTotalValue(transaction.vout)
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

Transactions.prototype.propagate = function(transactions, callback) {
  var uri = this.url + '/tx/send';

  if (!Array.isArray(transactions)) {
    transactions = [transactions];
  }

  var requests = transactions.map(function(txHex) {
    return function(cb) {
      utils.makePostRequest(uri, { hex: txHex }, cb);
    };
  });

  async.parallel(requests, callback);
};

module.exports = Transactions;

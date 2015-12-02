require('es6-promise').polyfill();

var assert = require('assert');
var batchGetRequest = require('./../utils').batchGetRequest;
var batchPostRequest = require('./../utils').batchPostRequest;

var rejectCallback = require('./../utils/reject-callback');
var resolveCallback = require('./../utils/resolve-callback');

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
  return batchGetRequest([this.url + 'rawtx/', this.url + 'tx/'], txIds, {
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
  var self = this;
  return batchGetRequest(this.url + 'tx/', txIds, {
    proxyUrl: this.proxyUrl
  })
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
      return { rawtx: hex };
    }, {
      proxyUrl: this.proxyUrl
    })
  )
    .then(function() {
      resolveCallback(callback);
    })
    .catch(callback);
};

module.exports = Transactions;

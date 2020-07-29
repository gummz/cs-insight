require('es6-promise').polyfill();

var assert = require('assert');
var batchGetRequest = require('./utils/index').batchGetRequest;
var batchPostRequest = require('./utils/index').batchPostRequest;

var rejectCallback = require('./utils/reject-callback');
var resolveCallback = require('./utils/resolve-callback');

function Transactions(url) {
  this.url = url;
}

/**
 * request information about transaction(s) by id(s)
 *
 * @param txIds
 * @param params
 * @param callback
 * @returns {axios.Promise}
 */
Transactions.prototype.get = function(txIds, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  return batchGetRequest(this.url + 'txs/', txIds, {
    params: params
  })
    .then(function(txs) {
      var results = txs.map(function(tx) {
        return {
          txId: tx.txid,
          fees: tx.fees,
          timestamp: tx.time,
          confirmations: tx.confirmations,
          vin: tx.vin,
          vout: tx.vout,
          version: tx.version
        };
      });
      return resolveCallback(txIds, callback, results);
    })
    .catch(function(err) {
<<<<<<< HEAD
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
=======
      return rejectCallback(callback, err, 'One or more transactions were not found. The block explorer might be temporarily unavailable, please try again later.');
>>>>>>> ce11e999166b690a1edb9c946674ac05dcff300c
    });
};

Transactions.prototype.latest = function() {
<<<<<<< HEAD
  assert(false, 'There no appropriate API for that');
=======
  assert(false, 'There\'s no appropriate API for that.');
>>>>>>> ce11e999166b690a1edb9c946674ac05dcff300c
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
    }))
    .then(function(results) {
      return resolveCallback(
        transactions,
        callback,
        results.map(function(item) {
          return item.data;
        }));
    })
    .catch(function(err) {
<<<<<<< HEAD
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
=======
      return rejectCallback(callback, err, 'Unable to send transaction. The block explorer might be temporarily unavailable, or there was a mistake in the transaction.');
>>>>>>> ce11e999166b690a1edb9c946674ac05dcff300c
    });
};

module.exports = Transactions;

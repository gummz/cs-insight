/**
 * Has only one method 'get' from original Transaction API
 * to request transaction info without block height
 */

require('es6-promise').polyfill();

var batchGetRequest = require('./../utils').batchGetRequest;
var rejectCallback = require('./../utils/reject-callback');
var resolveCallback = require('./../utils/resolve-callback');

function LightTransactions(url, proxyUrl) {
  this.url = url;
  this.proxyUrl = proxyUrl;
}

/**
 * get transaction with block height
 *
 * @param txIds
 * @param callback
 * @returns {Promise}
 */
LightTransactions.prototype.get = function(txIds, callback) {
  return batchGetRequest([this.url + 'rawtxs/', this.url + 'txs/'], txIds, {
    proxyUrl: this.proxyUrl
  })
    .then(function(data) {
      var results = data.map(function(item) {
        var raw = item[0];
        var summary = item[1];
        return {
          txId: summary.txid,
          txHex: raw.rawtx,
          blockId: summary.blockhash,

          // non-standard
          __blockTimestamp: summary.blocktime,
          __confirmations: summary.confirmations || 0
        };
      });
      return resolveCallback(txIds, callback, results);
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid txId');
    });
};

module.exports = LightTransactions;

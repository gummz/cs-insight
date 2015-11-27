/**
 * Has only one method 'get' from original Transaction API
 * to request transaction info without block height
 */

var batchRequestAsync = require('./../utils').batchRequestAsync;
var Promise = require('bluebird');

function LightTransactions(url) {
  this.url = url;
}

/**
 * get transaction with block height
 *
 * @param txIds
 * @param callback
 * @returns {axios.Promise}
 */
LightTransactions.prototype.get = function(txIds, callback) {
  return batchRequestAsync([this.url + 'rawtx/', this.url + 'tx/'], txIds)
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

      if (callback) {
        callback(null, results.length === 1 ? results[0] : results);
      }

      return Array.isArray(txIds) ? results : results[0];
    })
    .catch(function(err) {
      if (callback) {
        callback(new Error(err.item + ' is not a valid txId'));
      } else {
        return Promise.reject(err);
      }
    });
};

module.exports = LightTransactions;

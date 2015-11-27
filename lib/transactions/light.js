/**
 * Has only one method 'get' from original Transaction API
 * to request transaction info without block height
 */

var batchRequestAsync = require('./../utils').batchRequestAsync;

function LightTransactions(url) {
  this.url = url;
}

LightTransactions.prototype.get = function(txIds, callback) {
  batchRequestAsync([this.url + 'rawtx/', this.url + 'tx/'], txIds)
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
      callback(null, results.length === 1 ? results[0] : results);
    })
    .catch(function(err) {
      callback(new Error(err.item + ' is not a valid txId'));
    });
};

module.exports = LightTransactions;

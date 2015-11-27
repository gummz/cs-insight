var async = require('async');
var utils = require('./../utils');

function getTotalValue(inputs) {
  if (!inputs) return 0;

  return inputs.reduce(function(memo, input) {
    return memo + Math.round(input.amount * 1e8);
  }, 0);
}

function Transactions(url) {
  this.url = url;
}

Transactions.prototype.summary = function(txIds, callback) {
  var uri = this.url + '/tx/';

  utils.batchRequest(uri, txIds, {params: ['output=coinspace']}, function(err, data) {
    if (err) return callback(err);

    var results = data.map(function(res) {
      return {
        txId: res.txid,
        blockId: res.blockhash,
        blockHeight: res.block,
        nInputs: res.vin.length,
        nOutputs: res.vout.length,
        totalInputValue: -getTotalValue(res.vin),
        totalOutputValue: getTotalValue(res.vout)
      };
    });

    callback(null, Array.isArray(txIds) ? results : results[0]);
  });
};

Transactions.prototype.get = function(txIds, callback) {
  var uri = this.url + '/rawtx/';
  var queryTxIds = [].concat(txIds);

  utils.batchRequest(uri, queryTxIds, {params: ['output=coinspace']}, function(err, data) {
    if (err) return callback(err);

    var results = data.map(function(d, i) {
      return {
        txId: queryTxIds[i],
        txHex: d.tx.hex,
        blockId: d.tx.blockhash,
        blockHeight: d.tx.blockheight,

        // non-standard
        __blockTimestamp: d.tx.blocktime,
        __confirmations: d.tx.confirmations || 0
      };
    });

    callback(null, Array.isArray(txIds) ? results : results[0]);
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

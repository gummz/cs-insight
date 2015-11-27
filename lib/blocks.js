var assert = require('assert');
var batchRequestAsync = require('./utils').batchRequestAsync;
var bitcoinjs = require('bitcoinjs-lib');
var Promise = require('bluebird');
var utils = require('./utils');

function Blocks(url, txEndpoint) {
  this.url = url;
  this.txEndpoint = txEndpoint;
}

Blocks.prototype.get = function(idsOrHeights, callback) {
  var txEndpoint = this.txEndpoint;

  batchRequestAsync(this.url, idsOrHeights)
    .then(function(data) {
      return Promise.all(data.map(function(blockData) {
        var block = new bitcoinjs.Block();
        block.version = blockData.version;
        block.prevHash = bitcoinjs.bufferutils.reverse(new Buffer(blockData.previousblockhash, 'hex'));
        block.merkleRoot = bitcoinjs.bufferutils.reverse(new Buffer(blockData.merkleroot, 'hex'));
        block.timestamp = blockData.time;
        block.bits = parseInt(blockData.bits, 16);
        block.nonce = blockData.nonce;

        return txEndpoint.get(blockData.tx)
          .then(function(transactions) {
            block.transactions = transactions.map(function(t) {
              //add missed in light transaction block height
              t.blockheight = blockData.height;
              return bitcoinjs.Transaction.fromHex(t.txHex);
            });

            return block.toHex();
          });
      }));
    })
    .then(function(results) {
      callback(null, Array.isArray(idsOrHeights) ? results : results[0]);
    })
    .catch(function(err) {
      callback(new Error(err.item + ' is not a valid txId'));
    });
};

Blocks.prototype.latest = function(callback) {
  var uri = this.url + 'raw/last/';

  utils.makeRequest(uri, function(err, data) {
    if (err) return callback(err);

    callback(null, {
      blockId: data.hash,
      prevBlockId: data.previousblockhash,
      merkleRootHash: data.merkleroot,
      nonce: data.nonce,
      version: data.version,
      blockHeight: data.height,
      blockSize: parseInt(data.bits, 16),
      timestamp: data.time,
      txCount: data.tx.length
    });
  });
};

Blocks.prototype.propagate = function() {
  assert(false, 'TODO');
};

Blocks.prototype.summary = function() {
  assert(false, 'TODO');
};

module.exports = Blocks;

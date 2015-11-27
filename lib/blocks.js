require('es6-promise').polyfill();

var assert = require('assert');
var batchRequestAsync = require('./utils').batchRequestAsync;
var bitcoinjs = require('bitcoinjs-lib');
var getRequest = require('./utils').makeRequestAsync;

function Blocks(url, txEndpoint) {
  this.url = url;
  this.txEndpoint = txEndpoint;
}

/**
 * request block by ids
 *
 * @param idsOrHeights
 * @param callback
 */
Blocks.prototype.get = function(idsOrHeights, callback) {
  var txEndpoint = this.txEndpoint;

  batchRequestAsync(this.url + 'block/', idsOrHeights)
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

/**
 * request last block
 *
 * @param callback
 * @returns {axios.Promise}
 */
Blocks.prototype.latest = function(callback) {
  var self = this;
  return getRequest(self.url + 'blocks')
    .then(function(data) {
      var blocks = data.blocks;
      return Promise.all([
        blocks.length > 1 ? blocks[1].hash : null,
        getRequest(self.url + 'block/' + blocks[0].hash)
      ]);
    })
    .then(function(blocks) {
      var previousHash = blocks[0];
      var block = blocks[1];
      callback(null, {
        blockId: block.hash,
        prevBlockId: previousHash,
        merkleRootHash: block.merkleroot,
        nonce: block.nonce,
        version: block.version,
        blockHeight: block.height,
        blockSize: parseInt(block.bits, 16),
        timestamp: block.time,
        txCount: block.tx.length
      });
    })
    .catch(function(err) {
      callback(err);
    });
};

Blocks.prototype.propagate = function() {
  assert(false, 'TODO');
};


Blocks.prototype.summary = function(ids, callback) {
  batchRequestAsync(this.url + 'block/', ids)
    .then(function(data) {
      return data.map(function(block) {
        return {
          blockId: block.hash,
          blockHeight: block.height,
          prevBlockId: block.previousblockhash,
          merkleRootHash: block.merkleroot,
          nonce: block.nonce,
          version: block.version,
          blockSize: parseInt(block.bits, 16),
          timestamp: block.time,
          txCount: block.tx.length
        };
      });
    })
    .then(function(results) {
      setTimeout(function() {
        callback(null, Array.isArray(ids) ? results : results[0]);
      });
    })
    .catch(function(err) {
      setTimeout(function() {
        callback(new Error(err.item + ' is not a valid blockId'));
      });
    });
};

module.exports = Blocks;

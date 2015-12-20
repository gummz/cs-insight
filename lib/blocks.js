require('es6-promise').polyfill();

var assert = require('assert');
var batchGetRequest = require('./utils').batchGetRequest;
var bitcoinjs = require('bitcoinjs-lib');
var getRequest = require('./utils').getRequest;
var rejectCallback = require('./utils/reject-callback');
var resolveCallback = require('./utils/resolve-callback');

function Blocks(url, proxyUrl, txEndpoint) {
  this.url = url;
  this.proxyUrl = proxyUrl;
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

  return batchGetRequest(this.url + 'block/', idsOrHeights, {
    proxyUrl: this.proxyUrl
  })
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

            return {
              blockHex: block.toHex(),
              blockId: blockData.hash
            };
          });
      }));
    })
    .then(function(results) {
      return resolveCallback(idsOrHeights, callback, results);
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid blockId');
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

  return getRequest(self.url + 'blocks', {
    proxyUrl: this.proxyUrl
  })
    .then(function(data) {
      var blocks = data.blocks;
      return Promise.all([
        blocks.length > 1 ? blocks[1].hash : null,
        getRequest(self.url + 'block/' + blocks[0].hash, {
          proxyUrl: self.proxyUrl
        })
      ]);
    })
    .then(function(blocks) {
      var previousHash = blocks[0];
      var block = blocks[1];

      return resolveCallback(null, callback, {
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
      return rejectCallback(callback, err);
    });
};

Blocks.prototype.propagate = function() {
  assert(false, 'TODO');
};

/**
 * request block summary by id(s)
 *
 * @param ids
 * @param callback
 */
Blocks.prototype.summary = function(ids, callback) {
  try {
    return batchGetRequest(this.url + 'block/', ids, {
      proxyUrl: this.proxyUrl
    })
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
        return resolveCallback(ids, callback, results);
      })
      .catch(function(err) {
        return rejectCallback(callback, err, err.item + ' is not a valid blockId');
      });
  } catch (err) {
    console.warn(err);
  }
};

module.exports = Blocks;

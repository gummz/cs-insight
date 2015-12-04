require('es6-promise').polyfill();

var _ = require('lodash');
var batchGetRequest = require('./utils').batchGetRequest;
var bitcoinjs = require('bitcoinjs-lib');
var rejectCallback = require('./utils/reject-callback');
var resolveCallback = require('./utils/resolve-callback');


function validateAddresses(addresses) {
  return new Promise(function(resolve, reject) {
    var invalidAddresses = [].concat(addresses).filter(function(address) {
      try {
        bitcoinjs.Address.fromBase58Check(address);
      } catch (e) {
        return true;
      }
    });

    if (invalidAddresses.length === 1) {
      reject({
        item: invalidAddresses[0],
        url: '',
        res: new Error(invalidAddresses[0] + ' is not a valid address')
      });
    } else if (invalidAddresses.length > 1) {
      reject({
        item: invalidAddresses.join(', '),
        url: '',
        res: new Error(invalidAddresses.join(', ') + ' are not a valid address')
      });
    }

    resolve();
  });
}

function Addresses(url, blocksEndpoint, txEndpoint) {
  this.url = url;
  this.blocksEndpoint = blocksEndpoint;
  this.txEndpoint = txEndpoint;
}

Addresses.prototype.summary = function(ids, callback) {
  var self = this;

  validateAddresses(ids)
    .then(function() {
      return batchGetRequest(self.url + 'addr/', ids);
    })
    .then(function(data) {
      resolveCallback(ids, callback,
        data.map(function(res) {
          return {
            address: res.addrStr,
            balance: res.balance + res.unconfirmedBalance,
            totalReceived: res.totalReceivedSat,
            txCount: res.txApperances
          };
        })
      );
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid address');
    });
};

Addresses.prototype.transactions = function(addresses, blockHeightFilter, callback) {
  // API /addrs/:addrs/txs
  // {from: 0, to: 1000}

  // optional blockHeight
  if (typeof blockHeightFilter === 'function') {
    callback = blockHeightFilter;
    blockHeightFilter = 0;
  }

  if (blockHeightFilter > 0) {
    console.warn('Insight API does not support blockHeight filter for addresses.transactions');
  }

  addresses = [].concat(addresses);

  var params = addresses.map(function(id) { return {id: id}; });
  var self = this;

  batchGetRequest(this.url + 'addrs/:id/txs', params)
    .then(function(data) {
      var result = [];
      data.forEach(function(address) {
        result = result.concat(address.items.map(function(tx) {
          return Promise
            .all([
              self.blocksEndpoint.summary(tx.blockhash),
              self.txEndpoint.get(tx.txid)
            ])
            .then(function(result) {
              return {
                blockHeight: result[0] && result[0].blockHeight,
                blockId: tx.blockhash,
                txHex: result[1] && result[1].txHex,
                txId: tx.txid,
                __blockTimestamp: result[1].__blockTimestamp,
                __confirmations: result[1].__confirmations
              };
            });
        }));
      });
      return Promise.all(result);
    })
    .then(function(result) {
      //filter transaction by block height
      //because Insight API doesn't support filtering we do it after result
      result = result.filter(function(tx) {
        return !blockHeightFilter || blockHeightFilter === tx.blockHeight;
      });

      return resolveCallback(addresses, callback, _.uniq(result, 'txId'), {
        arrayOnly: true
      });
    }, function(err) {
      return rejectCallback(callback, err, err.item.id + ' is not a valid address');
    });
};

Addresses.prototype.unspents = function(addresses, callback) {
  var self = this;

  addresses = [].concat(addresses);

  validateAddresses(addresses)
    .then(function() {
      var params = addresses.map(function(id) { return {id: id}; });
      return batchGetRequest(self.url + 'addrs/:id/utxo', params);
    })
    .then(function(result) {
      result = _.flatten(result).map(function(tx) {
        return {
          address: tx.address,
          confirmations: tx.confirmations,
          txId: tx.txid,
          value: tx.amount,
          vout: tx.vout
        };
      });
      return resolveCallback(addresses, callback, result, {
        arrayOnly: true
      });
    })
    .catch(function(err) {
      return rejectCallback(callback, err, err.item + ' is not a valid address');
    });
};

module.exports = Addresses;

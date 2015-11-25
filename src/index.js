var assert = require('assert');

var Addresses = require('./addresses');
var Blocks = require('./blocks');
var Transactions = require('./transactions');
var utils = require('./utils');

var NETWORKS = {
  testnet: "tbtc",
  bitcoin: "btc",
  litecoin: "ltc"
};

function Blockr(network, proxyURL) {
  network = network || 'bitcoin';
  assert(network in NETWORKS, 'Unknown network: ' + network);
  var BASE_URL = 'https://insight.bitpay.com/api/';

  // end points
  this.transactions = new Transactions(BASE_URL + 'tx/');
  this.addresses = new Addresses(BASE_URL + 'addr/', this.transactions);
  this.blocks = new Blocks(BASE_URL + 'block/', this.transactions);

  this.network = network;

  utils.setProxyURL(proxyURL);
  this.proxyURL = proxyURL;
}

Blockr.Addresses = Addresses;
Blockr.Blocks = Blocks;
Blockr.Transactions = Transactions;

Blockr.prototype.getNetwork = function() { return this.network };
Blockr.prototype.getProxyURL = function() { return this.proxyURL };

module.exports = Blockr;

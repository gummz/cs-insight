var assert = require('assert');

var Addresses = require('./lib/addresses');
var Blocks = require('./lib/blocks');
var LightTransactions = require('./lib/transactions/light');
var Transactions = require('./lib/transactions');
var utils = require('./lib/utils');

var NETWORKS = {
  testnet: 'test-insight',
  bitcoin: 'insight',
  litecoin: 'ltc'
};

function Wrapper(network, proxyURL) {
  network = network || 'bitcoin';
  assert(network in NETWORKS, 'Unknown network: ' + network);
  var BASE_URL = 'https://' + NETWORKS[network] + '.bitpay.com/api/';

  // end points
  this.lightTransactions = new LightTransactions(BASE_URL);
  this.blocks = new Blocks(BASE_URL, this.lightTransactions);
  this.transactions = new Transactions(BASE_URL, this.blocks);
  this.addresses = new Addresses(BASE_URL, this.blocks, this.lightTransactions);

  this.network = network;

  utils.setProxyURL(proxyURL);
  this.proxyURL = proxyURL;
}

Wrapper.Addresses = Addresses;
Wrapper.Blocks = Blocks;
Wrapper.Transactions = Transactions;

Wrapper.prototype.getNetwork = function() { return this.network; };
Wrapper.prototype.getProxyURL = function() { return this.proxyURL; };

module.exports = Wrapper;

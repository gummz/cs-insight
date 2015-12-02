var assert = require('assert');

var Addresses = require('./lib/addresses');
var Blocks = require('./lib/blocks');
var LightTransactions = require('./lib/transactions/light');
var Transactions = require('./lib/transactions');

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
  this.lightTransactions = new LightTransactions(BASE_URL, proxyURL);
  this.blocks = new Blocks(BASE_URL, proxyURL, this.lightTransactions);
  this.transactions = new Transactions(BASE_URL, proxyURL, this.blocks);
  this.addresses = new Addresses(BASE_URL, proxyURL, this.blocks, this.lightTransactions);

  this.network = network;
  this.proxyURL = proxyURL;
}

Wrapper.Addresses = Addresses;
Wrapper.Blocks = Blocks;
Wrapper.Transactions = Transactions;

Wrapper.prototype.getNetwork = function() { return this.network; };
Wrapper.prototype.getProxyURL = function() { return this.proxyURL; };

module.exports = Wrapper;

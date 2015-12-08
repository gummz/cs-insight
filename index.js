var assert = require('assert');

var Addresses = require('./lib/addresses');
var Blocks = require('./lib/blocks');
var LightTransactions = require('./lib/transactions/light');
var Mustache = require('mustache');
var Transactions = require('./lib/transactions');

var NETWORKS = {
  testnet: 'test-insight',
  bitcoin: 'insight',
  litecoin: 'ltc'
};

function Wrapper(network, proxyURL, baseURL) {
  network = network || 'bitcoin';
  baseURL = baseURL || 'https://{{#network}}{{.}}.{{/network}}bitpay.com/api/';
  assert(network in NETWORKS, 'Unknown network: ' + network);

  var BASE_URL = Mustache.render(baseURL, {
    network: NETWORKS[network]
  });

  // end points
  this.lightTransactions = new LightTransactions(BASE_URL, proxyURL);
  this.blocks = new Blocks(BASE_URL, proxyURL, this.lightTransactions);
  this.transactions = new Transactions(BASE_URL, proxyURL, this.blocks);
  this.addresses = new Addresses(BASE_URL, proxyURL, this.blocks, this.lightTransactions);

  this.apiURL = BASE_URL;
  this.network = network;
  this.proxyURL = proxyURL;
}

Wrapper.Addresses = Addresses;
Wrapper.Blocks = Blocks;
Wrapper.Transactions = Transactions;

Wrapper.prototype.getNetwork = function() { return this.network; };
Wrapper.prototype.getProxyURL = function() { return this.proxyURL; };

module.exports = Wrapper;

var assert = require('assert');

var Addresses = require('./lib/addresses');
var Blocks = require('./lib/blocks');
var Transactions = require('./lib/transactions');

function Wrapper(network, proxyURL, baseURL) {
  network = network || 'bitcoin';
  baseURL = baseURL || 'https://test-insight.bitpay.com/api/';

  // end points
  this.addresses = new Addresses(baseURL, proxyURL);
  this.blocks = new Blocks(baseURL, proxyURL);
  this.transactions = new Transactions(baseURL, proxyURL);

  this.apiURL = baseURL;
  this.network = network;
  this.proxyURL = proxyURL;
}

Wrapper.Addresses = Addresses;
Wrapper.Blocks = Blocks;
Wrapper.Transactions = Transactions;

Wrapper.prototype.getNetwork = function() { return this.network; };
Wrapper.prototype.getProxyURL = function() { return this.proxyURL; };

module.exports = Wrapper;

var assert = require('assert');

var Addresses = require('./lib/addresses');
var Blocks = require('./lib/blocks');
var Transactions = require('./lib/transactions');

function Wrapper(network, baseURL) {
    network = network || 'smileycoin';
    //baseURL = baseURL || 'https://blocks.smileyco.in/api/';
    baseURL = baseURL || 'https://skodari.broslaugin.com/api/'; // MUNA AÐ SKIPTA ÚT

    // end points
    this.addresses = new Addresses(baseURL);
    this.blocks = new Blocks(baseURL);
    this.transactions = new Transactions(baseURL);

    this.apiURL = baseURL;
    this.network = network;
}

Wrapper.Addresses = Addresses;
Wrapper.Blocks = Blocks;
Wrapper.Transactions = Transactions;

Wrapper.prototype.getNetwork = function() { return this.network; };

module.exports = Wrapper;
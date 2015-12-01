var Blockchain = require('../');

describe('cb-tests', function() {
  var options = {};

  beforeEach(function() {
    options.blockchain = new Blockchain('testnet');
  });

  require('cb-tester')(options);
});

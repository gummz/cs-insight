var Blockchain = require('../');

describe('cb light transactions get tests', function() {
  var options = {};

  beforeEach(function() {
    options.blockchain = {
      transactions: new Blockchain('testnet').lightTransactions
    };
  });

  require('./tester/light-transactions-get')(options);
});
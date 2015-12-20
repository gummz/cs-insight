/*eslint no-unused-expressions: 0*/

describe.skip('cb-tests', function() {
  var options = {};

  beforeEach(function() {
    var Blockchain = require('../');
    options.blockchain = new Blockchain('testnet');
  });

  require('cb-tester')(options);
});

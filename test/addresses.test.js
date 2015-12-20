/*eslint no-unused-expressions: 0*/

var Blockchain = require('../');
var chai = require('chai');
var setupFixtures = require('./setup-fixtures');

var expect = chai.expect;

describe('Addresses', function() {
  var addresses;

  before(function() {
    var api = new Blockchain('testnet');
    addresses = api.addresses;
  });

  before(setupFixtures.lightUp);

  describe.only('summary', function() {
    it('should return address', function(done) {
      addresses
        .summary(
          'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY'
        )
        .then(function(res) {
          expect(res).to.exist;
          expect(res).to.has.property('address', 'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY');
          done();
        })
        .catch(done);
    });

    it('should return error when address is not valid', function(done) {
      addresses
        .summary('XXXX')
        .then(function() {
          done('does not fail');
        })
        .catch(function(err) {
          expect(err.res.message).to.equal('XXXX is not a valid address');
          done();
        });
    });
  });

  describe('transactions', function() {
    it('should return transactions', function(done) {
      addresses
        .transactions(
          'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY'
        )
        .then(function(res) {
          expect(res).to.be.instanceof(Array);
          expect(res).has.length(2);
          expect(res[0]).to.has.property('blockId', '00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4');
          expect(res[0]).to.has.property('txId', '4979a0b69703f888dc5936a4be039dabb976fae7d45604d57b5fad35b3c94200');
          expect(res[1]).to.has.property('blockId', '00000000a1e890e1c2cfe6edf939b83b9a4d6fd4b066324b84f67660215887b0');
          expect(res[1]).to.has.property('txId', 'ffd316b0c4feb9d29c61c3734fcde0167600441e560931c8c7267a9de3d9e29a');
          done();
        })
        .catch(done);
    });
  });

  describe('unspents', function() {
    it('should return transactions', function(done) {
      addresses
        .unspents(
          'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY'
        )
        .then(function(res) {
          expect(res).to.be.instanceof(Array);
          expect(res).has.length(2);
          expect(res[0]).to.has.property('address', 'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY');
          expect(res[0]).to.has.property('txId', 'ffd316b0c4feb9d29c61c3734fcde0167600441e560931c8c7267a9de3d9e29a');
          expect(res[1]).to.has.property('address', 'mpNDUWcDcZw1Teo3LFHvr8usNdwDLKdTaY');
          expect(res[1]).to.has.property('txId', '4979a0b69703f888dc5936a4be039dabb976fae7d45604d57b5fad35b3c94200');
          done();
        })
        .catch(done);
    });
  });

  after(setupFixtures.down);
});

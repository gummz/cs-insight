/*eslint no-unused-expressions: 0*/

var Blockchain = require('../');
var chai = require('chai');
var setupFixtures = require('./setup-fixtures');

var expect = chai.expect;

describe('Blocks', function() {
  var blocks;

  before(function() {
    var api = new Blockchain('testnet');
    blocks = api.blocks;
  });

  before(setupFixtures.lightUp);

  describe('get', function() {
    it('should return block', function(done) {
      blocks
        .get(
          '00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4'
        )
        .then(function(res) {
          expect(res).to.exist;
          expect(res).to.has.property('blockId', '00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4');
          done();
        })
        .catch(done);
    });

    it('should fail on wrong block it', function(done) {
      blocks
        .get('XXXX')
        .then(function(res) {
          done('does not fail');
        })
        .catch(function(err) {
          expect(err).to.exist;
          expect(err.res).to.exist;
          done();
        });
    });
  });

  describe('latest', function() {
    it('should return last block', function(done) {
      blocks
        .latest()
        .then(function(res) {
          expect(res).to.exist;
          expect(res).to.has.property('blockId', '00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4');
          expect(res).to.has.property('blockHeight', 396393);
          expect(res).to.has.property('blockSize', 437402107);
          done();
        })
        .catch(done);
    });
  });

  describe('summary', function() {
    it('should return summary about block', function(done) {
      blocks
        .summary('00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4')
        .then(function(res) {
          expect(res).to.exist;
          expect(res).to.has.property('blockId', '00000000000010efb93b48b18d489d9e959997dd4f9e2acaf3191ad9ec1aa3e4');
          expect(res).to.has.property('blockHeight', 396393);
          done();
        })
        .catch(done);
    });
  });

  after(setupFixtures.down);
});

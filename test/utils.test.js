var batchRequestAsync = require('../lib/utils').batchRequestAsync;
var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');

describe('utils', function() {
  this.timeout(100);

  it('should be defined', function() {
    expect(batchRequestAsync).to.exist;
  });

  it('should request GET http://some.dom/uri and return result as Promise on successful response', function(done) {
    nock('http://some.dom')
      .get('/uri')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.dom/uri')
      .then(function(res) {
        expect(res.status).to.equal(200);
        expect(res.data).to.equal('Hello World!');
        done();
      })
      .catch(done);
  });
});

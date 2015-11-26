/*eslint no-unused-expressions: 0*/

var batchRequestAsync = require('../lib/utils').batchRequestAsync;
var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');

describe('utils', function() {
  this.timeout(100);

  it('should be defined', function() {
    expect(batchRequestAsync).to.exist;
  });

  it('should reject Promise if there no any items are passed', function(done) {
    nock('http://some.org')
      .get('/url')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.org/url')
      .then(function() {
        done('should reject Promise');
      })
      .catch(function() {
        done();
      });
  });

  it('should do single request GET http://some.org/url/:id and return result as Promise on successful response', function(done) {
    nock('http://some.org')
      .get('/url/123456')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.org/url/', 123456)
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello World!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.org/url/:id and return result as Promise on successful response', function(done) {
    nock('http://some.org')
      .get('/url/1')
      .reply(200, 'Hello World 1!');

    nock('http://some.org')
      .get('/url/2')
      .reply(200, 'Hello World 2!');

    batchRequestAsync('http://some.org/url/', [1, 2])
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello World 1!');
        expect(res[1][0]).to.equal('Hello World 2!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.org/url/:id and http://another.org/url/:id and return result as Promise on successful response', function(done) {
    nock('http://one.org')
      .get('/url/1')
      .reply(200, 'Hello One World!');

    nock('http://another.org')
      .get('/url/1')
      .reply(200, 'Hello Another World!');

    batchRequestAsync(['http://one.org/url/', 'http://another.org/url/'], 1)
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello One World!');
        expect(res[0][1]).to.equal('Hello Another World!');
        done();
      })
      .catch(done);
  });

  it('should request thought proxy if it passed to options', function(done) {
    nock('http://proxy.org')
      .get('/url?query=' + encodeURIComponent('http://one.org/url/1'))
      .reply(200);

    batchRequestAsync('http://one.org/url/', 1, {proxyUrl: 'http://proxy.org/url?query='})
      .then(function() {
        done();
      })
      .catch(done);
  });
});

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
    nock('http://some.dom')
      .get('/url')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.dom/url')
      .then(function() {
        done('should reject Promise');
      })
      .catch(function() {
        done();
      });
  });

  it('should do single request GET http://some.dom/url/:id and return result as Promise on successful response', function(done) {
    nock('http://some.dom')
      .get('/url/123456')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.dom/url/', 123456)
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello World!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.dom/url/:id and return result as Promise on successful response', function(done) {
    nock('http://some.dom')
      .get('/url/1')
      .reply(200, 'Hello World 1!');

    nock('http://some.dom')
      .get('/url/2')
      .reply(200, 'Hello World 2!');

    batchRequestAsync('http://some.dom/url/', [1, 2])
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello World 1!');
        expect(res[1][0]).to.equal('Hello World 2!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.dom/url/:id and http://another.dom/url/:id and return result as Promise on successful response', function(done) {
    nock('http://one.dom')
      .get('/url/1')
      .reply(200, 'Hello One World!');

    nock('http://another.dom')
      .get('/url/1')
      .reply(200, 'Hello Another World!');

    batchRequestAsync(['http://one.dom/url/', 'http://another.dom/url/'], 1)
      .then(function(res) {
        expect(res[0][0]).to.equal('Hello One World!');
        expect(res[0][1]).to.equal('Hello Another World!');
        done();
      })
      .catch(done);
  });
});

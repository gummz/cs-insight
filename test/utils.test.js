/*eslint no-unused-expressions: 0*/

var batchRequestAsync = require('../lib/utils').batchRequestAsync;
var chai = require('chai');
var expect = chai.expect;
var nock = require('nock');

describe('utils', function() {
  this.timeout(100);

  it('should return empty array if there no any items are passed', function(done) {
    batchRequestAsync('http://some.org/url')
      .then(function(res) {
        expect(res).to.be.empty;
        done();
      })
      .catch(done);
  });

  it('should retry on ECONNRESET', function(done) {
    var i = 4;
    while (--i >= 0) {
      nock('http://google.com')
        .get('/cat-poems/1')
        .replyWithError({code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read'});
    }

    nock('http://google.com')
      .get('/cat-poems/1')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://google.com/cat-poems/', 1, {retry: 5})
      .then(function(res) {
        expect(res[0]).to.equal('Hello World!');
        done();
      })
      .catch(done);
  });

  it('should fail after number of retries is over', function(done) {
    var i = 5;
    while (--i >= 0) {
      nock('http://google.com')
        .get('/missed-cat-poems/1')
        .replyWithError({code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read'});
    }

    nock('http://google.com')
      .get('/missed-cat-poems/1')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://google.com/missed-cat-poems/', 1, {retry: 5})
      .then(function(res) {
        done('got result', res);
      })
      .catch(function(err) {
        expect(err.item).to.equal(1);
        expect(err.res.code).to.equal('ECONNRESET');
        done();
      });
  });

  it('should do single request GET http://some.org/url/:id and return Promise on successful response', function(done) {
    nock('http://some.org')
      .get('/url/123456')
      .reply(200, 'Hello World!');

    batchRequestAsync('http://some.org/url/', 123456)
      .then(function(res) {
        expect(res[0]).to.equal('Hello World!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.org/url/:id and return Promise on successful response', function(done) {
    nock('http://some.org')
      .get('/url/1')
      .reply(200, 'Hello World 1!');

    nock('http://some.org')
      .get('/url/2')
      .reply(200, 'Hello World 2!');

    batchRequestAsync('http://some.org/url/', [1, 2])
      .then(function(res) {
        expect(res[0]).to.equal('Hello World 1!');
        expect(res[1]).to.equal('Hello World 2!');
        done();
      })
      .catch(done);
  });

  it('should do multi request GET http://some.org/url/:id and http://another.org/url/:id and return Promise on successful response', function(done) {
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

  it('should reject Promise on 404', function(done) {
    nock('http://some.org')
      .get('/url/123456')
      .reply(404, 'Not found');

    batchRequestAsync('http://some.org/url/', 123456)
      .then(function() {
        done('should reject Promise');
      })
      .catch(function(err) {
        expect(err.item).to.equal(123456);
        expect(err.url).to.equal('http://some.org/url/');
        expect(err.res.data).to.equal('Not found');
        done();
      });
  });
});

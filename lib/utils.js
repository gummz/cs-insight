var assert = require('assert');
var request = require('httpify');
var async = require('async');
var proxyURL;

function assertJSend(body) {
  assert.notEqual(body.status, 'error', body.message || 'Invalid JSend response:' + JSON.stringify(body));
  assert.notEqual(body.status, 'fail', body.data || 'Invalid JSend response: ' + JSON.stringify(body));

  assert.equal(body.status, 'success', 'Unexpected JSend response: ' + body);
  assert.notEqual(body.data, undefined, 'Unexpected JSend response: ' + body);
}

function handleJSend(callback) {
  return function(err, response) {
    if (err) return callback(err);

    if (response.statusCode === 200) {
      response.body = {
        'status': 'success',
        'data': response.body
      };
    }

    try {
      assertJSend(response.body);
    } catch (exception) {
      return callback(exception);
    }

    callback(null, response.body.data);
  };
}

function makeRequest(uri, params, callback) {
  if (Array.isArray(params)) {
    uri += '?' + params.join('&');
  } else if (params instanceof Function) {
    callback = params;
  }

  if (proxyURL) {
    uri = proxyURL + encodeURIComponent(uri);
  }

  request({
    uri: uri,
    method: 'GET',
    type: 'json',
    timeout: 20000
  }, handleJSend(callback));
}

function batchRequest(uri, items, options, callback) {
  items = [].concat(items);
  var urlAfter = '';

  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'object') {
    if (options.url) {
      urlAfter = options.url;
      delete options.url;
    }
    options = options || {};
  } else {
    urlAfter = options;
    options = {};
  }

  var itemsPerBatch = options.itemsPerBatch || 20;
  var params = options.params;

  var batches = [];
  while (items.length > itemsPerBatch) {
    var batch = items.splice(0, itemsPerBatch);
    batches.push(batch);
  }

  if (items.length > 0) batches.push(items);

  var requests = batches.map(function(batch) {
    return function(cb) {
      makeRequest(uri + batch.join(',') + urlAfter, params, cb);
    };
  });

  var consolidated = [];
  async.parallel(requests, function(err, results) {
    if (err) return callback(err);

    results.forEach(function(r) {
      consolidated = consolidated.concat(r);
    });

    callback(null, consolidated);
  });
}

function makePostRequest(uri, payload, callback) {
  if (proxyURL) {
    uri = proxyURL + encodeURIComponent(uri);
  }

  request({
    url: uri,
    method: 'POST',
    json: payload,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  }, handleJSend(callback));
}

function setProxyURL(url) {
  proxyURL = url;
}

module.exports = {
  batchRequest: batchRequest,
  handleJSend: handleJSend,
  makePostRequest: makePostRequest,
  makeRequest: makeRequest,
  setProxyURL: setProxyURL
};

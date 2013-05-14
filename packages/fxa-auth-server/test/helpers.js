const request = require('request');
const crypto = require('crypto');
const Hapi = require('hapi');
const hoek = require('hoek');
const config = require('../lib/config');

exports.server = require('../server');


// Generate a unique, randomly-generated ID.
// Handy for testing auth tokens and the like..
//
exports.uniqueID = function() {
  return crypto.randomBytes(10).toString('hex');
};


// Construct a request-making object that can talk to either a local Hapi
// server instance, or a live remote server.
//
// Individual testcases can instantiate this object with their specific server
// of interest, and call its makeRequest() method to send simulated HTTP
// requests into the server.  If the TEST_REMOTE environment variable is set
// then these requests will be transparently redirected to a live server.
//
function TestClient(options) {
  options = options || {};
  this.server = options.server || exports.server;
  this.remoteURL = options.remoteURL || process.env.TEST_REMOTE;
  this.basePath = options.basePath || '';
  this.defaultHeaders = options.defaultHeaders || {};
}

exports.TestClient = TestClient;

TestClient.prototype.makeRequest = function(method, path, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  // Normalize the request information using defaults.
  path = this.basePath + path;
  opts.headers = hoek.applyToDefaults(this.defaultHeaders,
                                            opts.headers || {});

  // Send it via http or inject, as determined by the test environment.
  if (this.remoteURL) {
    return this._makeRequestViaHTTP(method, path, opts, cb);
  } else {
    return this._makeRequestViaInject(method, path, opts, cb);
  }
};


// Make a HTTP request by injecting calls directly into a Hapi server.
// This bypasses all networking and node layers and just exercises the
// application code, making it faster and better for debugging.
//
TestClient.prototype._makeRequestViaInject = function(method, path, opts, cb) {
  var next = function (res) {
    // nodejs lowercases response headers, so simulate that behaviour here.
    var normalizedHeaders = {};
    for (var key in res.headers) {
      if (res.headers.hasOwnProperty(key)) {
        normalizedHeaders[key.toLowerCase()] = res.headers[key];
      }
    }
    res.headers = normalizedHeaders;
    return cb(res);
  };

  // nodejs lowercases request headers, so simulate that behaviour here.
  var rawHeaders = opts.headers || {};
  var headers = {};
  for (var key in rawHeaders) {
    if (rawHeaders.hasOwnProperty(key)) {
      headers[key.toLowerCase()] = rawHeaders[key];
    }
  }

  this.server.inject({
    method: method,
    url: path,
    payload: JSON.stringify(opts.payload),
    headers: headers
  }, next);
};


// Make a HTTP request by actually sending it out over the network.
// This uses the same API as makeRequestViaInject above, but sends it to
// a live server.  This lets you easily re-use unittests to acceptance
// test a live server.
//
TestClient.prototype._makeRequestViaHTTP = function(method, path, opts, cb) {
  var body = "";
  if (opts.payload !== undefined) {
    body = JSON.stringify(opts.payload);
  }

  request({
    url: this.remoteURL + path,
    method: method,
    headers: opts.headers || {},
    body: body
  }, function (err, res, body) {
    if (err) return cb({statusCode: 599, error: err});
    if (body && res.headers['content-type'] === 'application/json') {
      res.result = JSON.parse(body);
    } else {
      res.result = body;
    }
    return cb(res);
  });
};


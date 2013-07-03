const request = require('request');
const bigint = require('bigint');
const crypto = require('crypto');
const Hapi = require('hapi');
const hoek = require('hoek');
const config = require('../lib/config').root();
const routes = require('../routes');
const srp = require('../lib/srp');
const srpParams = require('../lib/srp_group_params');
const util = require('../lib/util');
const hawk = require('hawk');


const noop = function () {};
const nullLog = {
  trace: noop,
  debug: noop,
  info: noop,
  log: noop,
  warn: noop,
  error: noop,
  fatal: noop
};

exports.server = require('../server')(config, routes, nullLog);


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

TestClient.prototype.createSRP = function (email, password, kB, cb) {
  var alg = 'sha256';
  var salt = crypto.randomBytes(32);
  var verifier = srp.getv(salt, email, password, srpParams['2048'].N, srpParams['2048'].g, alg);
  this.makeRequest(
    'POST',
    '/create',
    {
      payload: {
        email: email,
        verifier: verifier.toString(16),
        salt: salt.toString('hex'),
        wrapKb: kB,
        params: {
          alg: alg,
          N_bits: config.N_bits
        }
      }
    },
    function (res) {
      var err = null;
      if (res.statusCode !== 200) { err = new Error(res.result.message); }
      cb(err, res);
    }
  );
};

TestClient.prototype.loginSRP = function (email, password, cb) {
  this.startLogin(
    email,
    function (err, session) {
      this.finishLogin(session, email, password, cb);
    }.bind(this)
  );
};

TestClient.prototype.startLogin = function (email, cb) {
  this.makeRequest(
    'POST',
    '/startLogin',
    {
      payload: {
        email: email
      }
    },
    function (res) {
      cb(null, res.result);
    }
  );
};

TestClient.prototype.finishLogin = function (session, email, password, cb) {
  var json = session;
  var a = bigint.fromBuffer(crypto.randomBytes(32));
  var g = srpParams[json.srp.N_bits].g;
  var N = srpParams[json.srp.N_bits].N;
  var A = srp.getA(g, a, N);
  var B = bigint(json.srp.B, 16);
  var S = srp.client_getS(
    Buffer(json.srp.s, 'hex'),
    email,
    password,
    N,
    g,
    a,
    B,
    json.srp.alg
  );

  var M = srp.getM(A, B, S);
  var K = srp.getK(S, json.srp.alg).toBuffer();
  this.makeRequest(
    'POST',
    '/finishLogin',
    {
      payload: {
        sessionId: json.sessionId,
        A: A.toString(16),
        M: M.toString(16)
      }
    },
    function (res) {
      var json = res.result;
      util.srpResponseKeys(
        K,
        function (err, keys) {
          var blob = Buffer(json.bundle, 'base64');
          var cyphertext = blob.slice(0, blob.length - 32);
          var hmac = blob.slice(blob.length - 32, blob.length);

          var check = crypto.createHmac('sha256', keys.respHMACkey);
          check.update(cyphertext);
          if (hmac.toString('hex') !== check.digest('hex')) {
            return cb(new Error("Corrupted Message"));
          }
          var cleartext = bigint.fromBuffer(cyphertext)
            .xor(bigint.fromBuffer(keys.respXORkey))
            .toBuffer();
          var result = {
            kA: cleartext.slice(0, 32).toString('base64'),
            wrapKb: cleartext.slice(32, 64).toString('base64'),
            signToken: cleartext.slice(64).toString('hex')
          };
          cb(null, result);
        }
      );
    }
  );
};

TestClient.prototype.sign = function (publicKey, duration, signToken, hashPayload, cb) {
  util.signCertKeys(
    Buffer(signToken, 'hex'),
    function (err, keys) {
      var credentials = {
        id: keys.tokenId.toString('base64'),
        key: keys.reqHMACkey.toString('base64'),
        algorithm: 'sha256'
      };
      var payload = {
        publicKey: publicKey,
        duration: duration
      };
      var verify = {
        credentials: credentials,
        contentType: 'application/json'
      };
      if (hashPayload) {
        verify.payload = JSON.stringify(payload);
      }
      var header = hawk.client.header('http://localhost/sign', 'POST', verify);

      this.makeRequest(
        'POST',
        '/sign',
        {
          headers: {
            Authorization: header.field,
            Host: 'localhost',
            'Content-Type': 'application/json'
          },
          payload: payload
        },
        function (res) {
          cb(null, res.result);
        }
      );
    }.bind(this)
  );
};

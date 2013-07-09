const crypto = require('crypto');

const request = require('request');
const bigint = require('bigint');
const hawk = require('hawk');

const srp = require('../lib/srp');
const srpParams = require('../lib/srp_group_params');
const util = require('../lib/util');

const tokenTypes = {
  sign: {
    startPath: '/startLogin',
    finishPath: '/finishLogin',
    context: 'getSignToken'
  },
  reset: {
    startPath: '/startResetToken',
    finishPath: '/finishResetToken',
    context: 'getResetToken'
  }
};

function Client(server) {
  this.server = server;
}

Client.prototype.makeRequest = function (method, path, options, callback) {
  options = options || {};

  request({
    url: this.server + path,
    method: method,
    headers: options.headers,
    json: options.payload
  }, function (err, res, body) {
    callback(err, body);
  });
};

Client.prototype.getToken1 = function (tokenType, email, callback) {
  this.makeRequest(
    'POST',
    tokenTypes[tokenType].startPath,
    {
      payload: {
        email: email
      }
    },
    callback
  );
};

Client.prototype.getToken2 = function (tokenType, session, email, password, callback) {
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
    tokenTypes[tokenType].finishPath,
    {
      payload: {
        sessionId: json.sessionId,
        A: A.toBuffer().toString('hex'),
        M: M.toBuffer().toString('hex')
      }
    },
    function (err, res) {
      if (err) return callback(err);
      var json = res;
      util.srpResponseKeys(
        K,
        tokenTypes[tokenType].context,
        function (err, keys) {
          var blob = Buffer(json.bundle, 'hex');
          var cyphertext = blob.slice(0, blob.length - 32);
          var hmac = blob.slice(blob.length - 32, blob.length);

          var check = crypto.createHmac('sha256', keys.respHMACkey);
          check.update(cyphertext);
          if (hmac.toString('hex') !== check.digest('hex')) {
            return callback(new Error("Corrupted Message"));
          }
          var cleartext = bigint.fromBuffer(cyphertext)
            .xor(bigint.fromBuffer(keys.respXORkey))
            .toBuffer();
          var result = {
            kA: cleartext.slice(0, 32).toString('hex'),
            wrapKb: cleartext.slice(32, 64).toString('hex'),
            token: cleartext.slice(64).toString('hex')
          };
          callback(null, result);
        }
      );
    }
  );
};

Client.prototype.create = function (email, password, kB, callback) {
  var alg = 'sha256';
  var salt = crypto.randomBytes(32);
  var verifier = srp.getv(salt, email, password, srpParams['2048'].N, srpParams['2048'].g, alg);

  this.makeRequest(
    'POST',
    '/create',
    {
      payload: {
        email: email,
        verifier: verifier.toBuffer().toString('hex'),
        salt: salt.toString('hex'),
        wrapKb: kB,
        params: {
          srp: {
            alg: alg,
            N_bits: 2048
          },
          stretch: {
            rounds: 0
          }
        }
      }
    },
    callback
  );
};

Client.prototype.startLogin = function (email, callback) {
  return this.getToken1('sign', email, callback);
};

Client.prototype.finishLogin = function (session, email, password, callback) {
  return this.getToken2('sign', session, email, password, callback);
};

Client.prototype.sign = function (publicKey, duration, signToken, callback) {
  util.signCertKeys(
    Buffer(signToken, 'hex'),
    function (err, keys) {
      var credentials = {
        id: keys.tokenId.toString('hex'),
        key: keys.reqHMACkey.toString('hex'),
        algorithm: 'sha256'
      };
      var payload = {
        publicKey: publicKey,
        duration: duration
      };
      var verify = {
        credentials: credentials,
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      };
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
        callback
      );
    }.bind(this)
  );
};

Client.prototype.resetAccount = function (resetToken, email, password, kA, kB, callback) {
  var alg = 'sha256';
  var salt = crypto.randomBytes(32);
  var verifier = srp.getv(salt, email, password, srpParams['2048'].N, srpParams['2048'].g, alg);
  var cleartext = Buffer.concat([Buffer(kA, 'hex'), Buffer(kB, 'hex'), salt, verifier.toBuffer()]);

  util.resetKeys(
    Buffer(resetToken, 'hex'),
    cleartext.length,
    function (err, keys) {

      // encrypt payload to the server
      var cyphertext = bigint.fromBuffer(cleartext)
        .xor(bigint.fromBuffer(keys.respXORkey))
        .toBuffer();

      var credentials = {
        id: keys.tokenId.toString('hex'),
        key: keys.reqHMACkey.toString('hex'),
        algorithm: 'sha256'
      };
      var payload = {
        bundle: cyphertext.toString('hex')
      };
      var verify = {
        credentials: credentials,
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      };
      var header = hawk.client.header('http://localhost/resetAccount', 'POST', verify);

      this.makeRequest(
        'POST',
        '/resetAccount',
        {
          headers: {
            Authorization: header.field,
            Host: 'localhost',
            'Content-Type': 'application/json'
          },
          payload: payload
        },
        callback
      );
    }.bind(this)
  );
};

module.exports = Client;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var request = require('request')
var bigint = require('bigint')
var hawk = require('hawk')
var P = require('p-promise')

var Bundle = require('../bundle')
var Token = require('../models/token')(inherits, Bundle)
var tokens = {
  AccountResetToken: require('../models/account_reset_token')(inherits, Token, crypto),
  KeyFetchToken: require('../models/key_fetch_token')(inherits, Token),
  SessionToken: require('../models/session_token')(inherits, Token)
}
var AuthBundle = require('../models/auth_bundle')(inherits, Bundle, null, tokens)

var srp = require('../srp')

var tokenTypes = {
  login: {
    startPath: '/session/auth/start',
    finishPath: '/session/auth/finish',
    context: 'session/auth'
  },
  passwordChange: {
    startPath: '/password/change/auth/start',
    finishPath: '/password/change/auth/finish',
    context: 'password/change'
  }
}

function Client(server) {
  this.server = server
}

Client.prototype.makeRequest = function (method, path, options, callback) {
  options = options || {}

  request({
    url: this.server + path,
    method: method,
    headers: options.headers,
    json: options.payload || true
  }, function (err, res, body) {
    callback(err, body)
  })
}

Client.prototype.getToken1 = function (tokenType, email, callback) {
  this.makeRequest(
    'POST',
    tokenTypes[tokenType].startPath,
    {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        email: email
      }
    },
    callback
  )
}

Client.prototype.getToken2 = function (tokenType, session, email, password, callback) {
  var json = session
  var a = bigint.fromBuffer(crypto.randomBytes(32))
  var g = srp.params[json.srp.N_bits].g
  var N = srp.params[json.srp.N_bits].N
  var A = srp.getA(g, a, N)
  var B = bigint(json.srp.B, 16)
  var S = srp.client_getS(
    Buffer(json.srp.s, 'hex'),
    Buffer(email),
    Buffer(password),
    N,
    g,
    a,
    B,
    json.srp.alg
  )

  var M = srp.getM(A, B, S)
  var K = srp.getK(S, N, json.srp.alg).toBuffer()
  this.makeRequest(
    'POST',
    tokenTypes[tokenType].finishPath,
    {
      payload: {
        srpToken: json.srpToken,
        A: A.toBuffer().toString('hex'),
        M: M.toBuffer().toString('hex')
      }
    },
    function (err, res) {
      if (err) return callback(err)
      var json = res
      AuthBundle.create(K, tokenTypes[tokenType].context)
        .done(
          function (b) {
            var tokens = b.unbundle(json.bundle)
            var result = {
              keyFetchToken: tokens.keyFetchToken
            }
            if (tokenType === 'login') {
              result.sessionToken = tokens.otherToken
            }
            else {
              result.accountResetToken = tokens.otherToken
            }
            callback(null, result)
          }
        )
    }
  )
}

Client.prototype.create = function (email, password, callback) {
  var alg = 'sha256'
  var salt = crypto.randomBytes(32)
  var verifier = srp.getv(
    Buffer(salt, 'hex'),
    Buffer(email),
    Buffer(password),
    srp.params['2048'].N,
    srp.params['2048'].g,
    alg
  )

  this.makeRequest(
    'POST',
    '/account/create',
    {
      payload: {
        email: email,
        verifier: verifier.toBuffer().toString('hex'),
        salt: salt.toString('hex'),
        params: {
          srp: {
            alg: alg,
            N_bits: 2048
          },
          stretch: {
            salt: 'DEAD',
            rounds: 0
          }
        }
      }
    },
    function (err, data) {
      if (d) {
        return err ? d.reject(err) : d.resolve(data)
      }
      callback(err, data)
    }
  )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.startLogin = function (email, callback) {
  this.getToken1(
    'login',
    email,
    function (err, data) {
      if (d) {
        return err ? d.reject(err) : d.resolve(data)
      }
      callback(err, data)
    }
  )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.finishLogin = function (email, password, session, callback) {
  this.getToken2(
    'login',
    session,
    email,
    password,
    function (err, data) {
      if (d) {
        return err ? d.reject(err) : d.resolve(data)
      }
      callback(err, data)
    }
  )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.sign = function (publicKey, duration, sessionToken, callback) {
  tokens.SessionToken.fromHex(sessionToken)
    .done(
      function (key) {
        var keys = {
          id: key.slice(0, 32),
          key: key.slice(32, 64)
        }
        var credentials = {
          id: keys.id.toString('hex'),
          key: keys.key.toString('hex'),
          algorithm: 'sha256'
        }
        var payload = {
          publicKey: publicKey,
          duration: duration
        }
        var verify = {
          credentials: credentials,
          contentType: 'application/json',
          payload: JSON.stringify(payload)
        }
        var header = hawk.client.header('http://localhost/certificate/sign', 'POST', verify)
        this.makeRequest(
          'POST',
          '/certificate/sign',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            },
            payload: payload
          },
          function (err, data) {
            if (d) {
              return err ? d.reject(err) : d.resolve(data)
            }
            callback(err, data)
          }
        )
      }.bind(this)
    )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.passwordChangeStart = function (sessionToken, callback) {
  tokens.SessionToken.fromHex(sessionToken)
    .done(
      function (token) {
        var credentials = {
          id: token.id,
          key: token.key,
          algorithm: 'sha256'
        }
        var verify = {
          credentials: credentials,
          contentType: 'application/json'
        }

        var header = hawk.client.header('http://localhost/password/change/auth/start', 'POST', verify)

        this.makeRequest(
          'POST',
          '/password/change/auth/start',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            }
          },
          function (err, data) {
            if (d) {
              return err ? d.reject(err) : d.resolve(data)
            }
            callback(err, data)
          }
        )

      }.bind(this)
    )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.passwordChangeFinish = function (session, email, password, callback) {
  this.getToken2(
    'passwordChange',
    session,
    email,
    password,
    function (err, data) {
      if (d) {
        return err ? d.reject(err) : d.resolve(data)
      }
      callback(err, data)
    }
  )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

Client.prototype.resetAccount = function (resetToken, email, password, salt, wrapKb, callback) {
  tokens.AccountResetToken.fromHex(resetToken)
    .done(
      function (token) {
        var verifier = srp.getv(
          Buffer(salt, 'hex'),
          Buffer(email),
          Buffer(password),
          srp.params['2048'].N,
          srp.params['2048'].g,
          'sha256'
        ).toBuffer().toString('hex')

        var credentials = {
          id: token.id,
          key: token.key,
          algorithm: 'sha256'
        }

        var payload = {
          bundle: token.bundle(wrapKb, verifier),
          params: {
            srp: {
              alg: 'sha256',
              N_bits: 2048
            },
            stretch: {
              salt: salt,
              rounds: 1000000
            }
          }
        }

        var verify = {
          credentials: credentials,
          contentType: 'application/json',
          payload: JSON.stringify(payload)
        }

        var header = hawk.client.header('http://localhost/account/reset', 'POST', verify)
        this.makeRequest(
          'POST',
          '/account/reset',
          {
            headers: {
              Authorization: header.field,
              Host: 'localhost',
              'Content-Type': 'application/json'
            },
            payload: payload
          },
          function (err, data) {
            if (d) {
              return err ? d.reject(err) : d.resolve(data)
            }
            callback(err, data)
          }
        )
      }.bind(this)
    )
  if (typeof(callback) !== 'function') {
    var d = P.defer()
    return d.promise
  }
}

module.exports = Client

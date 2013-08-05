/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var P = require('p-promise')
var srp = require('srp')

var ClientApi = require('./api')
var models = require('../models')({},{},{})
var tokens = models.tokens
var AuthBundle = models.AuthBundle

function Client(origin) {
  this.api = new ClientApi(origin)
  this.algorithm = 'sha256'
  this.salt = null
  this.email = null
  this.verifier = null
  this.sessionToken = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.kA = null
  this.wrapKb = null
}

Client.Api = ClientApi

function getAMK(srpSession, email, password) {
  var a = crypto.randomBytes(32)
  var g = srp.params[srpSession.srp.N_bits].g
  var N = srp.params[srpSession.srp.N_bits].N
  var A = srp.getA(g, a, N)
  var B = Buffer(srpSession.srp.B, 'hex')
  var S = srp.client_getS(
    Buffer(srpSession.srp.s, 'hex'),
    Buffer(email),
    Buffer(password),
    N,
    g,
    a,
    B,
    srpSession.srp.alg
  )

  var M = srp.getM(A, B, S, N)
  var K = srp.getK(S, N, srpSession.srp.alg)

  return {
    srpToken: srpSession.srpToken,
    A: A.toString('hex'),
    M: M.toString('hex'),
    K: K
  }
}

function verifier(salt, email, password, algorithm) {
  return srp.getv(
    Buffer(salt, 'hex'),
    Buffer(email),
    Buffer(password),
    srp.params['2048'].N,
    srp.params['2048'].g,
    algorithm
  ).toString('hex')
}

Client.create = function (origin, email, password, callback) {
  var c = new Client(origin)
  c.email = email
  c.password = password
  c.salt = crypto.randomBytes(32).toString('hex')
  c.verifier = verifier(c.salt, c.email, c.password, c.algorithm)
  var p = c.create()
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.parse = function (string) {
  var object = JSON.parse(string)
  var client = new Client(object.api.origin)
  client.salt = object.salt
  client.email = object.email
  client.password = object.password
  client.salt = object.salt
  client.verifier = object.verifier
  client.sessionToken = object.sessionToken
  client.accountResetToken = object.accountResetToken
  client.keyFetchToken = object.keyFetchToken
  client.kA = object.kA
  client.wrapKb = object.wrapKb

  return client
}

Client.prototype.create = function (callback) {
  var p = this.api.accountCreate(
    this.email,
    this.verifier,
    this.salt,
    {
      srp: {
        alg: this.algorithm,
        N_bits: 2048
      },
      stretch: {
        salt: 'DEAD',
        rounds: 0
      }
    }
  )
  .then(
    function () {
      return this
    }.bind(this)
  )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.stringify = function () {
 return JSON.stringify(this)
}

Client.prototype.login = function (callback) {
  var K = null
  var p = this.api.sessionAuthStart(this.email)
    .then(
      function (srpSession) {
        var x = getAMK(srpSession, this.email, this.password)
        K = x.K
        return this.api.sessionAuthFinish(x.srpToken, x.A, x.M)
      }.bind(this)
    )
    .then(
      function (json) {
        return AuthBundle.create(K, 'session/auth')
          .then(
            function (b) {
              var tokens = b.unbundle(json.bundle)
              return {
                keyFetchToken: tokens.keyFetchToken,
                sessionToken: tokens.otherToken
              }
            }
          )
      }.bind(this)
    )
    .then(
      function (tokens) {
        this.sessionToken = tokens.sessionToken
        this.keyFetchToken = tokens.keyFetchToken
        return tokens
      }.bind(this)
    )

  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.sign = function (publicKey, duration, callback) {
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
    function () {
      return this.api.certificateSign(this.sessionToken, publicKey, duration)
    }.bind(this)
  )
  .then(
    function (x) {
      return x.cert
    }
  )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.changePassword = function (newPassword, callback) {
  var K = null
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
    function () {
      this.api.paswordChangeAuthStart(this.sessionToken)
    }.bind(this)
  )
  .then(
    function (srpSession) {
      var x = getAMK(srpSession, this.email, this.password)
      K = x.K
      return this.api.passwordChangeAuthFinish(x.srpToken, x.A, x.M)
    }
  )
  .then(
    function (json) {
      AuthBundle.create(K, 'password/change')
        .then(
          function (b) {
            var tokens = b.unbundle(json.bundle)
            return {
              keyFetchToken: tokens.keyFetchToken,
              accountResetToken: tokens.otherToken
            }
          }
        )
    }.bind(this)
  )
  .then(
    function (tokens) {
      this.keyFetchToken = tokens.keyFetchToken
      this.accountResetToken = tokens.accountResetToken
    }.bind(this)
  )
  .then(
    function () {
      return tokens.AccountResetToken.fromHex(this.accountResetToken)
    }.bind(this)
  )
  .then(
    function (token) {
      this.salt = crypto.randomBytes(32).toString('hex')
      this.password = newPassword
      this.verifier = verifier(this.salt, this.email, newPassword, this.algorithm)
      var bundle = token.bundle(this.wrapKb, this.verifier)
      var params = this.params
      return this.api.accountReset(
        this.accountResetToken,
        bundle,
        params
      )
    }.bind(this)
  )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.keys = function (callback) {
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
    function () {
      return this.api.accountKeys(this.keyFetchToken)
    }.bind(this)
  )
  .then(
    function (data) {
      return tokens.KeyFetchToken.fromHex(this.keyFetchToken)
        .then(
          function (token) {
            return token.unbundle(data.bundle)
          }
        )
    }.bind(this)
  )
  .then(
    function (keys) {
      this.kA = keys.kA
      this.wrapKb = keys.wrapKb
      return keys
    }.bind(this)
  )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

//TODO recovery methods, devices, forgot password, session status/destroy

module.exports = Client

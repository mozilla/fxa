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
  this.passwordSalt = null
  this.srp = null
  this.email = null
  this.authToken = null
  this.sessionToken = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.kA = null
  this.wrapKb = null
}

Client.Api = ClientApi

function getAMK(srpSession, email, password) {
  var a = crypto.randomBytes(32)
  var g = srp.params[2048].g
  var N = srp.params[2048].N
  var A = srp.getA(g, a, N)
  var B = Buffer(srpSession.srp.B, 'hex')
  var S = srp.client_getS(
    Buffer(srpSession.srp.salt, 'hex'),
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
  // TODO: password stretching
  c.email = email
  c.password = password
  c.srp = {}
  c.srp.type = 'SRP-6a/SHA256/2048/v1'
  c.srp.salt = crypto.randomBytes(32).toString('hex')
  c.srp.algorithm = 'sha256'
  c.srp.verifier = verifier(c.srp.salt, c.email, c.password, c.srp.algorithm)
  c.passwordSalt = crypto.randomBytes(32).toString('hex')
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
  client.email = object.email
  client.password = object.password
  client.srp = object.srp
  c.passwordSalt = object.passwordSalt
  client.passwordStretching = object.passwordStretching
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
    this.srp.verifier,
    this.srp.salt,
    {
      type: 'PBKDF2/scrypt/PBKDF2/v1',
      PBKDF2_rounds_1: 20000,
      scrypt_N: 65536,
      scrypt_r: 8,
      scrypt_p: 1,
      PBKDF2_rounds_2: 20000,
      salt: this.passwordSalt
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

Client.prototype.auth = function (callback) {
  var K = null
  var p = this.api.authStart(this.email)
    .then(
      function (srpSession) {
        var x = getAMK(srpSession, this.email, this.password)
        K = x.K
        return this.api.authFinish(x.srpToken, x.A, x.M)
      }.bind(this)
    )
    .then(
      function (json) {
        return AuthBundle.create(K, 'auth/finish')
          .then(
            function (b) {
              return b.unbundle(json.bundle)
            }
          )
      }.bind(this)
    )
    .then(
      function (authToken) {
        this.authToken = authToken
        return authToken
      }.bind(this)
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.login = function (callback) {
  var K = null
  var p = this.auth()
    .then(
      function (authToken) {
        return this.api.sessionCreate(this.authToken)
      }.bind(this)
    )
    .then (
      function (json) {
        return tokens.AuthToken.fromHex(this.authToken)
          .then(
            function (t) {
              return t.unbundleSession(json.bundle)
            }
          )
      }.bind(this)
    )
    .then(
      function (tokens) {
        this.keyFetchToken = tokens.keyFetchToken
        this.sessionToken = tokens.sessionToken
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
  var p = this.auth()
    .then(
      function () {
        return this.api.passwordChangeStart(this.authToken)
      }.bind(this)
    )
    .then (
      function (json) {
        return tokens.AuthToken.fromHex(this.authToken)
          .then(
            function (t) {
              return t.unbundleAccountReset(json.bundle)
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
        return this.keys()
      }.bind(this)
    )
    .then(
      function () {
        return tokens.AccountResetToken.fromHex(this.accountResetToken)
      }.bind(this)
    )
    .then(
      function (token) {
        this.srp.salt = crypto.randomBytes(32).toString('hex')
        this.password = newPassword
        this.srp.verifier = verifier(this.srp.salt, this.email, newPassword, this.srp.algorithm)
        var bundle = token.bundle(this.wrapKb, this.srp.verifier)
        return this.api.accountReset(
          this.accountResetToken,
          bundle,
          {
            type: this.srp.type,
            salt: this.srp.salt,
            verifier: this.srp.verifier
          },
          this.passwordStretching
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

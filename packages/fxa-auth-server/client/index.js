/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var P = require('p-promise')
var srp = require('srp')

var ClientApi = require('./api')
var models = require('../models')({ trace: function () {}},{},{})
var keyStretch = require('./keystretch')
var tokens = models.tokens
var AuthBundle = models.AuthBundle

function Client(origin) {
  this.uid = null
  this.api = new ClientApi(origin)
  this.passwordSalt = null
  this.srp = null
  this.email = null
  this.authToken = null
  this.sessionToken = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.forgotPasswordToken = null
  this.kA = null
  this.wrapKb = null
  this._devices = null
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

function pad(n, length) {
  var padding = length - n.length
  console.assert(padding > -1, "Negative padding.  Very uncomfortable.")
  if (padding === 0) { return n }
  var result = new Buffer(length)
  result.fill(0, 0, padding)
  n.copy(result, padding)
  return result
}

function verifier(salt, email, password, algorithm) {
  return pad(
    srp.getv(
      Buffer(salt, 'hex'),
      Buffer(email),
      Buffer(password),
      srp.params['2048'].N,
      srp.params['2048'].g,
      algorithm
    ),
    256
  ).toString('hex')
}

Client.prototype.setupCredentials = function (email, password, customSalt) {
  if (!this.email) {
    this.email = Buffer(email).toString('hex')
  }

  var saltHex = customSalt ? customSalt : crypto.randomBytes(32).toString('hex')

  return keyStretch.derive(Buffer(this.email), Buffer(password), saltHex)
    .then(
      function (result) {
        this.srpPw = result.srpPw.toString('hex')
        this.unwrapBKey = result.unwrapBKey.toString('hex')
        this.srp = {}
        this.srp.type = 'SRP-6a/SHA256/2048/v1'
        this.srp.salt = crypto.randomBytes(32).toString('hex')
        this.srp.algorithm = 'sha256'
        this.srp.verifier = verifier(this.srp.salt, this.email, this.srpPw,
                                     this.srp.algorithm)
        this.passwordSalt = saltHex
      }.bind(this)
    )
}

Client.create = function (origin, email, password, callback) {
  var c = new Client(origin)

  var p = c.setupCredentials(email, password)
    .then(
      function() {
        return c.create()
      }
    )

  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.login = function (origin, email, password, callback) {
  var c = new Client(origin)
  c.email = Buffer(email).toString('hex')
  c.password = password

  var p = c.login()
    .then(
    function () {
      return c
    }
  )
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
  client.uid = object.uid
  client.email = object.email
  client.password = object.password
  client.srp = object.srp
  client.passwordSalt = object.passwordSalt
  client.passwordStretching = object.passwordStretching
  client.sessionToken = object.sessionToken
  client.accountResetToken = object.accountResetToken
  client.keyFetchToken = object.keyFetchToken
  client.forgotPasswordToken = object.forgotPasswordToken
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
      function (a) {
        this.uid = a.uid
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

Client.prototype._clear = function () {
  this.authToken = null
  this.sessionToken = null
  this.srpSession = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.forgotPasswordToken = null
  this.kA = null
  this.wrapKb = null
  this._devices = null
}

Client.prototype.stringify = function () {
  return JSON.stringify(this)
}

Client.prototype.accountExists = function (email, callback) {
  if (email) {
    this.email = Buffer(email).toString('hex')
  }
  var K = null
  var p = this.api.authStart(this.email)
    .then(
      function (srpSession) {
        this.srpSession = srpSession
        return true
      }.bind(this),
      function (err) {
        if (err.errno === 102) {
          return false
        } else {
          throw err
        }
      }
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
};

Client.prototype.auth = function (callback) {
  var K = null
  var session
  var sessionPromise = this.srpSession ? P(this.srpSession) : this.api.authStart(this.email)
  var p = sessionPromise
    .then(
      function (srpSession) {
        var k = P.defer()

        if (!this.srpPw) {
          session = srpSession

          keyStretch.derive(Buffer(this.email), Buffer(this.password), session.passwordStretching.salt)
            .then(
              function (result) {
                this.srpPw = result.srpPw.toString('hex')
                this.unwrapBKey = result.unwrapBKey.toString('hex')
                this.passwordSalt = session.passwordStretching.salt

                k.resolve(srpSession)
              }.bind(this),
              function (err) {
                k.reject(err)
              }
            )
        } else {
          k.resolve(srpSession)
        }
        return k.promise
      }.bind(this)
    )
    .then(
      function (srpSession) {
        var x = getAMK(srpSession, this.email, this.srpPw)
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

Client.prototype.destroySession = function (callback) {
  var p = P(null)
  if (this.sessionToken) {
    p = this.api.sessionDestroy(this.sessionToken)
      .then(
        function () {
          this.sessionToken = null
          return {}
        }.bind(this)
      )
  }
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.verifyEmail = function (code, callback) {
  var p = this.api.recoveryEmailVerifyCode(this.uid, code)
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.emailStatus = function (callback) {
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
      function () {
        return this.api.recoveryEmailStatus(this.sessionToken)
      }.bind(this)
    )
    .then(
    function (status) {
      // decode email
      status.email = Buffer(status.email, 'hex').toString()
      return status
    }
  )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.requestVerifyEmail = function (callback) {
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
    function () {
      return this.api.recoveryEmailResendCode(this.sessionToken, this.email)
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
    .then(this.keys.bind(this))
    .then(
      function () {
        return tokens.AccountResetToken.fromHex(this.accountResetToken)
      }.bind(this)
    )
    .then(
      function (token) {
        var salt = crypto.randomBytes(32).toString('hex')

        return keyStretch.derive(Buffer(this.email), Buffer(newPassword), salt)
          .then(
            function (result) {
              this.srpPw = result.srpPw.toString('hex')
              this.unwrapBKey = result.unwrapBKey.toString('hex')
              this.passwordSalt = salt

              return token
            }.bind(this)
          )
      }.bind(this)
    )
    .then(
      function (token) {
        this.srp.salt = crypto.randomBytes(32).toString('hex')
        this.srp.verifier = verifier(this.srp.salt, this.email, this.srpPw, this.srp.algorithm)
        var bundle = token.bundle(this.wrapKb, this.srp.verifier)
        return this.api.accountReset(
          this.accountResetToken,
          bundle,
          {
            type: this.srp.type,
            salt: this.srp.salt
          },
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
      }.bind(this)
    )
    .then(this._clear.bind(this))
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.keys = function (callback) {
  var o = this.keyFetchToken ? P(null) : this.login()
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
        this.keyFetchToken = null
        this.kA = keys.kA
        this.wrapKb = keys.wrapKb
        this.kB = keys.kB = keyStretch.xor(this.wrapKb, this.unwrapBKey).toString('hex')

        return keys
      }.bind(this),
      function (err) {
        this.keyFetchToken = null
        throw err
      }.bind(this)
    )

  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.devices = function (callback) {
  var o = this.sessionToken ? P(null) : this.login()
  var p = o.then(
      function () {
        return this.api.accountDevices(this.sessionToken)
      }.bind(this)
    )
    .then(
      function (json) {
        this._devices = json.devices
        return this._devices
      }.bind(this)
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.destroyAccount = function (callback) {
  var p = this.auth()
    .then(
      function () {
        return this.api.accountDestroy(this.authToken)
      }.bind(this)
    )
    .then(this._clear.bind(this))
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.forgotPassword = function (callback) {
  this._clear()
  var p = this.api.passwordForgotSendCode(this.email)
    .then(
      function (x) {
        this.forgotPasswordToken = x.forgotPasswordToken
      }.bind(this)
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.reforgotPassword = function (callback) {
  var p = this.api.passwordForgotResendCode(this.forgotPasswordToken, this.email)
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.verifyPasswordResetCode = function (code, callback) {
  var p = this.api.passwordForgotVerifyCode(this.forgotPasswordToken, code)
    .then(
      function (result) {
        this.accountResetToken = result.accountResetToken
      }.bind(this)
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

Client.prototype.resetPassword = function (newPassword, callback) {
  if (!this.accountResetToken) {
    throw new Error("call verifyPasswordResetCode before calling resetPassword");
  }
  // this will generate a new wrapKb on the server
  var wrapKb = '0000000000000000000000000000000000000000000000000000000000000000'
  var p = this.setupCredentials(this.email, newPassword)
    .then(
      tokens.AccountResetToken.fromHex.bind(null, this.accountResetToken)
    )
    .then(
      function (accountResetToken) {
        var bundle = accountResetToken.bundle(wrapKb, this.srp.verifier)
        return this.api.accountReset(
          accountResetToken.data,
          bundle,
          {
            type: this.srp.type,
            salt: this.srp.salt
          },
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
      }.bind(this)
    )
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

//TODO recovery methods, session status/destroy

module.exports = Client

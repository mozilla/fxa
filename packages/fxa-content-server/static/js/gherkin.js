require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var gherkinLib = require('./gherkin');
var codes = require('./lib/error_codes');

module.exports = {
  Client: gherkinLib,
  errorCodes: codes
};

gherkin = module.exports

},{"./gherkin":2,"./lib/error_codes":6}],2:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var P = require('p-promise')
var srp = require('srp')

var ClientApi = require('./lib/api')
var keyStretch = require('./lib/keystretch')
var tokens = require('./lib/tokens')({ trace: function () {}})
var Bundle = tokens.Bundle

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

function getAMK(srpSession, emailHex, passwordHex) {
  var a = crypto.randomBytes(32)
  var srpClient = new srp.Client(
    srp.params[2048],
    Buffer(srpSession.srp.salt, 'hex'),
    Buffer(emailHex, 'hex'),
    Buffer(passwordHex, 'hex'),
    a
  )
  var A = srpClient.computeA()
  var B = Buffer(srpSession.srp.B, 'hex')
  srpClient.setB(B)

  var M = srpClient.computeM1()
  var K = srpClient.computeK()

  return {
    srpToken: srpSession.srpToken,
    A: A.toString('hex'),
    M: M.toString('hex'),
    K: K
  }
}

function verifier(saltHex, emailHex, passwordHex) {
  return srp.computeVerifier(
    srp.params[2048],
    Buffer(saltHex, 'hex'),
    Buffer(emailHex, 'hex'),
    Buffer(passwordHex, 'hex')
    ).toString('hex')
}

Client.prototype.setupCredentials = function (email, password, customSalt, customSrpSalt) {
  if (!this.email) {
    this.email = Buffer(email).toString('hex')
  }

  var saltHex = customSalt ? customSalt : crypto.randomBytes(32).toString('hex')

  return keyStretch.derive(Buffer(this.email, 'hex'), Buffer(password), saltHex)
    .then(
      function (result) {
        this.srpPw = result.srpPw.toString('hex')
        this.unwrapBKey = result.unwrapBKey.toString('hex')
        this.srp = {}
        this.srp.type = 'SRP-6a/SHA256/2048/v1'
        this.srp.salt = customSrpSalt || crypto.randomBytes(32).toString('hex')
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

          keyStretch.derive(Buffer(this.email, 'hex'), Buffer(this.password), session.passwordStretching.salt)
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
        return Bundle.unbundle(K, 'auth/finish', json.bundle)
      }.bind(this)
    )
    .then(
      function (authToken) {
        this.authToken = authToken.toString('hex')
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
      function () {
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
      return this.api.recoveryEmailResendCode(this.sessionToken)
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
        var saltHex = crypto.randomBytes(32).toString('hex')

        return keyStretch.derive(Buffer(this.email, 'hex'), Buffer(newPassword), saltHex)
          .then(
            function (result) {
              this.srpPw = result.srpPw.toString('hex')
              this.unwrapBKey = result.unwrapBKey.toString('hex')
              this.passwordSalt = saltHex

              return token
            }.bind(this)
          )
      }.bind(this)
    )
    .then(
      function (token) {
        this.srp.salt = crypto.randomBytes(32).toString('hex')
        this.srp.verifier = verifier(this.srp.salt, this.email, this.srpPw, this.srp.algorithm)
        return token.bundleAccountData(this.wrapKb, this.srp.verifier)
      }.bind(this)
    )
    .then(
      function (bundle) {
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
              return token.unbundleKeys(data.bundle)
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
        return accountResetToken.bundleAccountData(wrapKb, this.srp.verifier)
      }.bind(this)
    )
    .then(
      function (bundle) {
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
  if (callback) {
    p.done(callback.bind(null, null), callback)
  }
  else {
    return p
  }
}

//TODO recovery methods, session status/destroy

module.exports = Client

},{"./lib/api":3,"./lib/keystretch":8,"./lib/tokens":16,"__browserify_Buffer":4,"crypto":"l4eWKl","p-promise":77,"srp":83}],3:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')

var hawk = require('hawk')
var P = require('p-promise')
var request = require('request')

var tokens = require('./tokens')({ trace: function() {}})

util.inherits(ClientApi, EventEmitter)
function ClientApi(origin) {
  EventEmitter.call(this)
  this.origin = origin
  this.baseURL = origin + "/v1"
}

ClientApi.prototype.Token = tokens

function hawkHeader(token, method, url, payload) {
  var verify = {
    credentials: token
  }
  if (payload) {
    verify.contentType = 'application/json'
    verify.payload = JSON.stringify(payload)
  }
  return hawk.client.header(url, method, verify).field
}

ClientApi.prototype.doRequest = function (method, url, token, payload) {
  var d = P.defer()
  var headers = {}
  if (token) {
    headers.Authorization = hawkHeader(token, method, url, payload)
  }
  var options = {
    url: url,
    method: method,
    headers: headers,
    json: payload || true
  }
  this.emit('startRequest', options)
  request(options, function (err, res, body) {
    this.emit('endRequest', options, err, res)
    if (err || body.error) {
      d.reject(err || body)
    }
    else {
      d.resolve(body)
    }
  }.bind(this))
  return d.promise
}

/*
 *  Creates a user account.
 *
 *  ___Parameters___
 *
 *  * email - the primary email for this account
 *  * verifier - the derived SRP verifier
 *  * salt - SPR salt
 *  * params
 *      * srp
 *          * alg - hash function for SRP (sha256)
 *          * N_bits - SPR group bits (2048)
 *      * stretch
 *          * rounds - number of rounds of password stretching
 *
 *   ___Response___
 *   {}
 *
 */
ClientApi.prototype.accountCreate = function (email, verifier, salt, passwordStretching) {
  return this.doRequest(
    'POST',
    this.baseURL + '/account/create',
    null,
    {
      email: email,
      srp: {
        type: 'SRP-6a/SHA256/2048/v1',
        verifier: verifier,
        salt: salt
      },
      passwordStretching: passwordStretching
    }
  )
}

ClientApi.prototype.accountDevices = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'GET',
          this.baseURL + '/account/devices',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountKeys = function (keyFetchTokenHex) {
  return tokens.KeyFetchToken.fromHex(keyFetchTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'GET',
          this.baseURL + '/account/keys',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountReset = function (accountResetTokenHex, bundle, srp, passwordStretching) {
  return tokens.AccountResetToken.fromHex(accountResetTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/account/reset',
          token,
          {
            bundle: bundle,
            srp: srp,
            passwordStretching: passwordStretching
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountDestroy = function (authTokenHex) {
  return tokens.AuthToken.fromHex(authTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/account/destroy',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.recoveryEmailStatus = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'GET',
          this.baseURL + '/recovery_email/status',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.recoveryEmailResendCode = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/recovery_email/resend_code',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.recoveryEmailVerifyCode = function (uid, code) {
  return this.doRequest(
    'POST',
    this.baseURL + '/recovery_email/verify_code',
    null,
    {
      uid: uid,
      code: code
    }
  )
}

ClientApi.prototype.certificateSign = function (sessionTokenHex, publicKey, duration) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/certificate/sign',
          token,
          {
            publicKey: publicKey,
            duration: duration
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.getRandomBytes = function () {
  return this.doRequest(
    'POST',
    this.baseURL + '/get_random_bytes'
  )
}

ClientApi.prototype.passwordChangeStart = function (authTokenHex) {
  return tokens.AuthToken.fromHex(authTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/change/start',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.passwordForgotSendCode = function (email) {
  return this.doRequest(
    'POST',
    this.baseURL + '/password/forgot/send_code',
    null,
    {
      email: email
    }
  )
}

ClientApi.prototype.passwordForgotResendCode = function (forgotPasswordTokenHex, email) {
  return tokens.ForgotPasswordToken.fromHex(forgotPasswordTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/forgot/resend_code',
          token,
          {
            email: email
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.passwordForgotVerifyCode = function (forgotPasswordTokenHex, code) {
    return tokens.ForgotPasswordToken.fromHex(forgotPasswordTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/forgot/verify_code',
          token,
          {
            code: code
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.authStart = function (email) {
  return this.doRequest(
    'POST',
    this.baseURL + '/auth/start',
    null,
    {
      email: email
    }
  )
}

ClientApi.prototype.authFinish = function (srpToken, A, M) {
  return this.doRequest(
    'POST',
    this.baseURL + '/auth/finish',
    null,
    {
      srpToken: srpToken,
      A: A,
      M: M
    }
  )
}

ClientApi.prototype.sessionCreate = function (authTokenHex) {
  return tokens.AuthToken.fromHex(authTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/session/create',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.sessionDestroy = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/session/destroy',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.rawPasswordAccountCreate = function (email, password) {
  return this.doRequest(
    'POST',
    this.baseURL + '/raw_password/account/create',
    null,
    {
      email: email,
      password: password
    }
  )
}

ClientApi.prototype.rawPasswordSessionCreate = function (email, password) {
  return this.doRequest(
    'POST',
    this.baseURL + '/raw_password/session/create',
    null,
    {
      email: email,
      password: password
    }
  )
}

ClientApi.heartbeat = function (origin) {
  return (new ClientApi(origin)).doRequest('GET', origin + '/__heartbeat__')
}

module.exports = ClientApi

},{"./tokens":16,"events":27,"hawk":58,"p-promise":77,"request":"hWH+d8","util":33}],4:[function(require,module,exports){
module.exports = require('buffer');

},{}],5:[function(require,module,exports){
// Local scrypt not included
module.exports = function() { };

},{}],6:[function(require,module,exports){

module.exports = {
  ACCOUNT_EXISTS: 101,
  UNKNOWN_ACCOUNT: 102,
  INCORRECT_PASSWORD: 103,
  UNVERIFIED_ACCOUNT: 104,
  INVALID_CODE: 105
}

},{}],7:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HKDF = require('hkdf')
var P = require('p-promise')

function kw(name) {
  return 'identity.mozilla.com/picl/v1/' + name
}

function hkdf(km, info, salt, len) {
  var d = P.defer()
  var df = new HKDF('sha256', salt, km)
  df.derive(
    kw(info),
    len,
    function(key) {
      d.resolve(key)
    }
  )
  return d.promise
}

module.exports = hkdf

},{"hkdf":75,"p-promise":77}],8:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('p-promise')
var pbkdf2 = require('./pbkdf2')
var scrypt = require('./scrypt')
var hkdf = require('./hkdf')
var crypto = require('crypto')

// The namespace for the salt functions
const NAMESPACE = 'identity.mozilla.com/picl/v1/'
const SCRYPT_HELPER = 'https://scrypt.dev.lcip.org/'


/** Derive a key from an email and password pair
 *
 * @param {Buffer} email The email hex buffer of the user
 * @param {Buffer} password The password of the user
 * @param {String} saltHex The salt to derive hkdf as a hex string
 * @return p.promise object - It will resolve with
 * {Buffer} srpPw srp password
 * {Buffer} unwrapBKey unwrapBKey
 * or fail with {object} err
 */
function derive(email, password, saltHex) {
  var p = P.defer()

  if (!password || !email || !saltHex) {
    p.reject('Bad password, salt or email input')
    return p.promise
  }

  var salt = Buffer(saltHex, 'hex')
  // derive the first key from pbkdf2
  pbkdf2
    .derive(password, KWE('first-PBKDF', email))
    .then(
      function(K1) {
        // request a hash from scrypt based on the first key
        return scrypt.hash(K1, KW("scrypt"), SCRYPT_HELPER)
      }
    )
    .then(
      function (K2) {
        // combine the K2 hex string and a password UTF8 into a bit array
        var scryptPassword = Buffer.concat([
          Buffer(K2, 'hex'),
          password
        ])
        // derive the second key from pbkdf2
        return pbkdf2.derive(scryptPassword, KWE('second-PBKDF', email))
      }
    )
    .then(
      function (stretchedPw) {
        var input = new Buffer (stretchedPw, 'hex')
        var lengthHkdf = 2 * 32

        return hkdf(input, 'mainKDF', salt, lengthHkdf)
      }
    )
    .done(
      function (hkdfResult) {
        var hkdfResultHex = hkdfResult.toString('hex')
        var srpPw = Buffer(hkdfResultHex.substring(0,64), 'hex')
        var unwrapBKey = Buffer(hkdfResultHex.substring(64,128), 'hex')

        p.resolve({ srpPw: srpPw, unwrapBKey: unwrapBKey })
      },
      function (err) {
        p.reject(err)
      }
    )

  return p.promise
}

/** XOR
 *
 * @param {Buffer|String} input1 first value of the buffer as a hex string or a buffer
 * @param {Buffer|String} input2 second value of the buffer as hex string or a buffer
 * @return {Buffer} xorResult Result XOR buffer
 */
function xor(input1, input2) {
  var buf1 = Buffer.isBuffer(input1) ? input1 : Buffer(input1, 'hex')
  var buf2 = Buffer.isBuffer(input2) ? input2 : Buffer(input2, 'hex')
  var xorResult = Buffer(buf1.length)

  if (buf1.length !== buf2.length) {
    throw new Error(
      'XOR buffers must be same length %d != %d',
      buf1.length,
      buf2.length
    )
  }
  for (var i = 0; i < xorResult.length; i++) {
    xorResult[i] = buf2[i] ^ buf1[i]
  }

  return xorResult
}


/** KWE
 *
 * @param {String} name The name of the salt
 * @param {Buffer} email The email of the user.
 * @return {Buffer} the salt combination with the namespace
 */
function KWE(name, email) {
  return Buffer(NAMESPACE + name + ':' + email)
}

/** KW
 *
 * @param {String} name The name of the salt
 * @return {Buffer} the salt combination with the namespace
 */
function KW(name) {
  return Buffer(NAMESPACE + name)
}

module.exports.derive = derive
module.exports.xor = xor

},{"./hkdf":7,"./pbkdf2":9,"./scrypt":10,"__browserify_Buffer":4,"crypto":"l4eWKl","p-promise":77}],9:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sjcl = require('sjcl')
var P = require('p-promise')

const ITERATIONS = 20 * 1000
const LENGTH = 32 * 8

/** pbkdf2 string creator
 *
 * @param  {Buffer}  input The password hex buffer.
 * @param  {Buffer}  salt The salt string buffer.
 * @return {Buffer}  the derived key hex buffer.
 */
function derive(input, salt) {
  var password = sjcl.codec.hex.toBits(input.toString('hex'))
  var saltBits = sjcl.codec.hex.toBits(salt.toString('hex'))
  var result = sjcl.misc.pbkdf2(password, saltBits, ITERATIONS, LENGTH, sjcl.misc.hmac)

  return P(Buffer(sjcl.codec.hex.fromBits(result), 'hex'))
}

module.exports.derive = derive

},{"__browserify_Buffer":4,"p-promise":77,"sjcl":79}],10:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')
var P = require('p-promise')
var Scrypt = require('./emscrypt')
var scrypt = Scrypt(128 * 1024 * 1024)

/**  hash Creates an scrypt hash
 *
 * @param {Buffer} input The input for scrypt
 * @param {Buffer} salt The salt for the hash
 * @param {String} url scrypt helper server url
 * @returns {Object} d.promise Deferred promise
 */
function hash(input, salt, url) {
  var p
  var payload = {
    salt: salt,
    N: 64 * 1024,
    r: 8,
    p: 1,
    buflen: 32,
    input: input
  }

  if (url) {
     p = remoteScryptHelper(payload, url)
  } else {
     p = localScrypt(payload)
  }

  return p
}

/** localScrypt generates the scrypt hash locally
 *
 * @param {Object} payload the payload required to generate the hash
 */
function localScrypt(payload) {
  return P(
    scrypt.to_hex(
      scrypt.crypto_scrypt(
        payload.input,
        payload.salt,
        payload.N,
        payload.r,
        payload.p,
        payload.buflen
      )
    )
  )
}

/** remoteScryptHelper generates the scrypt hash using a remote helper
 *
 * @param {Object} payload The payload required to generate the hash
 * @param {String} url The url of the remote helper
 */
function remoteScryptHelper(payload, url) {
  var d = P.defer()
  var method = 'POST'
  var headers = {}
  payload.input = payload.input.toString('hex')
  payload.salt = payload.salt.toString()
  request(
    {
      url: url,
      method: method,
      headers: headers,
      json: payload
    },
    function (err, res, body) {
      if ((err || body.error)) {
        d.reject(err || body)
      }
      else {
        d.resolve(body.output)
      }
    }
  )

  return d.promise
}

module.exports.hash = hash

},{"./emscrypt":5,"p-promise":77,"request":"hWH+d8"}],11:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, crypto) {

  var NULL = '0000000000000000000000000000000000000000000000000000000000000000'

  function AccountResetToken(keys, details) {
    Token.call(this, keys, details)
  }
  inherits(AccountResetToken, Token)

  AccountResetToken.tokenTypeID = 'accountResetToken'

  AccountResetToken.create = function (details) {
    log.trace({ op: 'AccountResetToken.create', uid: details && details.uid })
    return Token.createNewToken(AccountResetToken, details || {})
  }

  AccountResetToken.fromHex = function (string, details) {
    log.trace({ op: 'AccountResetToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(AccountResetToken, string, details)
  }

  AccountResetToken.prototype.bundleAccountData = function (wrapKb, verifier) {
    log.trace({ op: 'accountResetToken.bundleAccountData', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(wrapKb, 'hex'),
      Buffer(verifier, 'hex')
    ])
    return this.bundle('account/reset', plaintext)
  }

  AccountResetToken.prototype.unbundleAccountData = function (hex) {
    log.trace({ op: 'accountResetToken.unbundleAccountData', id: this.id })
    return this.unbundle('account/reset', hex)
      .then(
        function (plaintext) {
          var wrapKb = plaintext.slice(0, 32).toString('hex')
          var verifier = plaintext.slice(32, 288).toString('hex')
          if (wrapKb === NULL) {
           wrapKb = crypto.randomBytes(32).toString('hex')
          }
          return {
            wrapKb: wrapKb,
            verifier: verifier
          }
        }.bind(this)
      )
  }

  return AccountResetToken
}

},{"__browserify_Buffer":4}],12:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, error) {

  function AuthToken(keys, details) {
    Token.call(this, keys, details)
  }
  inherits(AuthToken, Token)

  AuthToken.tokenTypeID = 'authToken'

  AuthToken.create = function (details) {
    log.trace({ op: 'AuthToken.create', uid: details && details.uid })
    return Token.createNewToken(AuthToken, details || {})
  }

  AuthToken.fromHex = function (string, details) {
    log.trace({ op: 'AuthToken.fromHex' })
    return Token.createTokenFromHexData(AuthToken, string, details || {})
  }

  AuthToken.prototype.bundleSession = function (keyFetchToken, sessionToken) {
    log.trace({ op: 'authToken.bundleSession', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(keyFetchToken, 'hex'),
      Buffer(sessionToken, 'hex')
    ])
    return this.bundle('session/create', plaintext)
  }

  AuthToken.prototype.unbundleSession = function (bundle) {
    log.trace({ op: 'authToken.unbundleSession', id: this.id })
    return this.unbundle('session/create', bundle)
      .then(
        function (plaintext) {
          return {
            keyFetchToken: plaintext.slice(0, 32).toString('hex'),
            sessionToken: plaintext.slice(32, 64).toString('hex')
          }
        }
      )
  }

  AuthToken.prototype.bundleAccountReset = function (keyFetchToken, resetToken) {
    log.trace({ op: 'authToken.bundleAccountReset', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(keyFetchToken, 'hex'),
      Buffer(resetToken, 'hex')
    ])
    return this.bundle('password/change', plaintext)
  }

  AuthToken.prototype.unbundleAccountReset = function (bundle) {
    log.trace({ op: 'authToken.unbundleAccountReset', id: this.id })
    return this.unbundle('password/change', bundle)
      .then(
        function (plaintext) {
          return {
            keyFetchToken: plaintext.slice(0, 32).toString('hex'),
            accountResetToken: plaintext.slice(32, 64).toString('hex')
          }
        }
      )
  }

  return AuthToken
}

},{"__browserify_Buffer":4}],13:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*  Utility functions for working with encrypted data bundles.
 * 
 *  This module provides 'bundle' and 'unbundle' functions that perform the
 *  simple encryption operations required by the picl-idp API.  The encryption
 *  works as follows:
 * 
 *    * Input is some master key material, a string identifying the context
 *      of the data, and a payload to be encrypted.
 *
 *    * HKDF is used to derive a 32-byte HMAC key and an encryption key of
 *      length equal to the payload.  The context string is used to ensure
 *      that these keys are unique to this encryption context.
 *
 *    * The payload is XORed with the encryption key, then HMACed using the
 *      HMAC key.
 *
 *    * Output is the hex-encoded concatenation of the ciphertext and HMAC.
 *      
 */


module.exports = function (crypto, P, hkdf, error) {


  var HASH_ALGORITHM = 'sha256'


  function Bundle() {}


  // Encrypt the given buffer into a hex ciphertext string.
  //
  Bundle.bundle = function (key, keyInfo, payload) {
    return deriveBundleKeys(key, keyInfo, payload.length)
      .then(
        function (keys) {
          var ciphertext = xorBuffers(payload, keys[1])
          var hmac = crypto.createHmac(HASH_ALGORITHM, keys[0])
          hmac.update(ciphertext)
          return Buffer.concat([ciphertext, hmac.digest()]).toString('hex')
        }
      )
  }


  // Decrypt the given hex string into a buffer of plaintext data.
  //
  Bundle.unbundle = function (key, keyInfo, payload) {
    payload = Buffer(payload, 'hex')
    var ciphertext = payload.slice(0, -32)
    var expectedHmac = payload.slice(-32)
    return deriveBundleKeys(key, keyInfo, ciphertext.length)
      .then(
        function (keys) {
          var hmac = crypto.createHmac(HASH_ALGORITHM, keys[0])
          hmac.update(ciphertext)
          if (!buffersAreEqual(hmac.digest(), expectedHmac)) {
            throw error.invalidSignature()
          }
          return xorBuffers(ciphertext, keys[1])
        }
      )
  }


  // Derive the HMAC and XOR keys required to encrypt a given size of payload.
  //
  function deriveBundleKeys(key, keyInfo, payloadSize) {
    return hkdf(key, keyInfo, null, 32 + payloadSize)
      .then(
        function (keyMaterial) {
          var hmacKey = keyMaterial.slice(0, 32)
          var xorKey = keyMaterial.slice(32)
          return [hmacKey, xorKey]
        }
      )
  }


  // Xor the contents of two equal-sized buffers.
  //
  function xorBuffers(buffer1, buffer2) {
    if (buffer1.length !== buffer2.length) {
      throw new Error(
        'XOR buffers must be same length (%d != %d)',
        buffer1.length,
        buffer2.length
      )
    }
    var result = Buffer(buffer1.length)
    for (var i = 0; i < buffer1.length; i++) {
      result[i] = buffer1[i] ^ buffer2[i]
    }
    return result
  }


  //  Time-invariant buffer comparison.
  //  For checking hmacs without timing attacks.
  //
  function buffersAreEqual(buffer1, buffer2) {
    var mismatch = buffer1.length - buffer2.length
    if (mismatch) {
      return false
    }
    for (var i = 0; i < buffer1.length; i++) {
      mismatch |= buffer1[i] ^ buffer2[i]
    }
    return mismatch === 0
  }


  return Bundle
}

},{"__browserify_Buffer":4}],14:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function error(details) {
  var err = new Error(details.message);
  for (var k in details) {
    if (details.hasOwnProperty(k)) {
      err[k] = details[k];
    }
  }
  return err;
}

function accountExists(email) {
  return error({
    errno: 101,
    message: 'Account already exists',
    email: email
  })
}

function unknownAccount(email) {
  return error({
    errno: 102,
    message: 'Unknown account',
    email: email
  })
}

function incorrectPassword() {
  return error({
    errno: 103,
    message: 'Incorrect password'
  })
}

function invalidSignature() {
  return error({
    errno: 109,
    message: 'Invalid signature'
  })
}

function invalidToken() {
  return error({
    errno: 110,
    message: 'Invalid authentication token in request signature'
  })
}

module.exports = {
  error: error,
  accountExists: accountExists,
  unknownAccount: unknownAccount,
  incorrectPassword: incorrectPassword,
  invalidSignature: invalidSignature,
  invalidToken: invalidToken
}

},{}],15:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, now, Token, crypto) {

  var LIFETIME = 1000 * 60 * 15

  function ForgotPasswordToken(keys, details) {
    Token.call(this, keys, details)
    this.email = details.email || null
    this.created = details.created || null
    this.passcode = details.passcode || null
    this.tries = details.tries || null
  }
  inherits(ForgotPasswordToken, Token)

  ForgotPasswordToken.tokenTypeID = 'forgotPasswordToken'

  ForgotPasswordToken.create = function (details) {
    details = details || {}
    log.trace({
      op: 'ForgotPasswordToken.create',
      uid: details.uid,
      email: details.email
    })
    details.passcode = crypto.randomBytes(4).readUInt32BE(0) % 100000000
    details.created = now()
    details.tries = 3
    return Token.createNewToken(ForgotPasswordToken, details)
  }

  ForgotPasswordToken.fromHex = function (string, details) {
    log.trace({ op: 'ForgotPasswordToken.fromHex' })
    details = details || {}
    return Token.createTokenFromHexData(ForgotPasswordToken, string, details)
  }

  ForgotPasswordToken.prototype.ttl = function () {
    var ttl = (LIFETIME - (now() - this.created)) / 1000
    return Math.max(Math.ceil(ttl), 0)
  }

  ForgotPasswordToken.prototype.failAttempt = function () {
    this.tries--
    return this.tries < 1
  }

  return ForgotPasswordToken
}

},{}],16:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var P = require('p-promise')
var srp = require('srp')
var uuid = require('uuid')
var hkdf = require('../hkdf')

var error = require('./error')

module.exports = function (log) {

  var Bundle = require('./bundle')(crypto, P, hkdf, error)
  var Token = require('./token')(log, crypto, P, hkdf, Bundle, error)

  var KeyFetchToken = require('./key_fetch_token')(log, inherits, Token, error)
  var AccountResetToken = require('./account_reset_token')(
    log,
    inherits,
    Token,
    crypto
  )
  var SessionToken = require('./session_token')(log, inherits, Token)
  var AuthToken = require('./auth_token')(log, inherits, Token, error)
  var ForgotPasswordToken = require('./forgot_password_token')(
    log,
    inherits,
    Date.now,
    Token,
    crypto
  )
  var SrpToken = require('./srp_token')(
    log,
    inherits,
    P,
    uuid,
    srp,
    Bundle,
    Token,
    error
  )

  Token.error = error
  Token.Bundle = Bundle
  Token.AccountResetToken = AccountResetToken
  Token.KeyFetchToken = KeyFetchToken
  Token.SessionToken = SessionToken
  Token.AuthToken = AuthToken
  Token.ForgotPasswordToken = ForgotPasswordToken
  Token.SrpToken = SrpToken

  return Token
}

},{"../hkdf":7,"./account_reset_token":11,"./auth_token":12,"./bundle":13,"./error":14,"./forgot_password_token":15,"./key_fetch_token":17,"./session_token":18,"./srp_token":19,"./token":20,"crypto":"l4eWKl","p-promise":77,"srp":83,"util":33,"uuid":87}],17:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token, error) {

  function KeyFetchToken(keys, details) {
    Token.call(this, keys, details)
    this.kA = details.kA || null
    this.wrapKb = details.wrapKb || null
    this.verified = !!details.verified 
  }
  inherits(KeyFetchToken, Token)

  KeyFetchToken.tokenTypeID = 'keyFetchToken'

  KeyFetchToken.create = function (details) {
    log.trace({ op: 'KeyFetchToken.create', uid: details && details.uid })
    return Token.createNewToken(KeyFetchToken, details || {})
  }

  KeyFetchToken.fromHex = function (string, details) {
    log.trace({ op: 'KeyFetchToken.fromHex' })
    return Token.createTokenFromHexData(KeyFetchToken, string, details || {})
  }

  KeyFetchToken.prototype.bundleKeys = function (kA, wrapKb) {
    log.trace({ op: 'keyFetchToken.bundleKeys', id: this.id })
    var plaintext = Buffer.concat([
      Buffer(kA, 'hex'),
      Buffer(wrapKb, 'hex')
    ])
    return this.bundle('account/keys', plaintext)
  }

  KeyFetchToken.prototype.unbundleKeys = function (bundle) {
    log.trace({ op: 'keyFetchToken.unbundleKeys', id: this.id })
    return this.unbundle('account/keys', bundle)
      .then(
        function (plaintext) {
          return {
            kA: plaintext.slice(0, 32).toString('hex'),
            wrapKb: plaintext.slice(32, 64).toString('hex')
          }
        }
      )
  }

  return KeyFetchToken
}

},{"__browserify_Buffer":4}],18:[function(require,module,exports){
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, Token) {

  function SessionToken(keys, details) {
    Token.call(this, keys, details)
    this.email = details.email || null
    this.emailCode = details.emailCode || null
    this.verified = !!details.verified
  }
  inherits(SessionToken, Token)

  SessionToken.tokenTypeID = 'sessionToken'

  SessionToken.create = function (details) {
    log.trace({ op: 'SessionToken.create', uid: details && details.uid })
    return Token.createNewToken(SessionToken, details || {})
  }

  SessionToken.fromHex = function (string, details) {
    log.trace({ op: 'SessionToken.fromHex' })
    return Token.createTokenFromHexData(SessionToken, string, details || {})
  }

  return SessionToken
}

},{}],19:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

module.exports = function (log, inherits, P, uuid, srp, Bundle, Token, error) {

  function SrpToken(keys, details) {
    if (!details.srp) { details.srp = {} }
    Token.call(this, keys, details)
    this.b = Buffer(this.bundleKey, 'hex')
    this.v = details.srp.verifier ? Buffer(details.srp.verifier, 'hex') : null
    this.s = details.srp.salt ? details.srp.salt : null
    this.passwordStretching = details.passwordStretching || null
    this.srpServer = new srp.Server(srp.params[2048], this.v, this.b)
    this.K = null
  }
  inherits(SrpToken, Token)

  SrpToken.tokenTypeID = 'srpToken'

  SrpToken.create = function (details) {
    log.trace({ op: 'SrpToken.create', uid: details && details.uid })
    return Token.createNewToken(SrpToken, details || {})
  }

  SrpToken.fromHex = function (string, details) {
    log.trace({ op: 'SrpToken.create', uid: details && details.uid })
    return Token.createTokenFromHexData(SrpToken, string, details || {})
  }

  // Get the data to be sent back to the client in the first message.
  //
  SrpToken.prototype.clientData = function () {
    return {
      srpToken: this.id,
      passwordStretching: this.passwordStretching,
      srp: {
        type: 'SRP-6a/SHA256/2048/v1',
        salt: this.s,
        B: this.srpServer.computeB().toString('hex')
      }
    }
  }

  // Complete the SRP dance, verifying the correct credentials and
  // deriving the value of the shared secret.
  //
  SrpToken.prototype.finish = function (A, M1) {
    A = Buffer(A, 'hex')
    this.srpServer.setA(A)
    try {
      this.srpServer.checkM1(Buffer(M1, 'hex'))
    }
    catch (e) {
      throw error.incorrectPassword()
    }
    this.K = this.srpServer.computeK()
    return this
  }

  SrpToken.prototype.bundleAuth = function (authToken) {
    log.trace({ op: 'srpToken.bundleAuth', id: this.id })
    if (!this.K) {
      return P.reject('Shared secret missing; SRP handshake was not completed')
    }
    var plaintext = Buffer(authToken, 'hex')
    return Bundle.bundle(this.K, 'auth/finish', plaintext)
  }

  SrpToken.prototype.unbundleAuth = function (bundle) {
    log.trace({ op: 'srpToken.unbundleAuth', id: this.id })
    if (!this.K) {
      return P.reject('Shared secret missing; SRP handshake was not completed')
    }
    return Bundle.unbundle(this.K, 'auth/finish', bundle)
      .then(
        function (plaintext) {
          return {
            authToken: plaintext.toString('hex'),
          }
        }
      )
  }

  return SrpToken
}

},{"__browserify_Buffer":4,"crypto":"l4eWKl"}],20:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer,process=require("__browserify_process");/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*  Base class for handling various types of token.
 * 
 *  This module provides the basic functionality for handling authentication
 *  tokens.  There are different types of token for use in different contexts
 *  but they all operate in essentially the same way:
 *
 *    - Each token is created from an initial data seed of 32 random bytes.
 *
 *    - From the seed data we HKDF-derive three 32-byte values: a tokenid,
 *      an authKey and a bundleKey.
 *
 *    - The tokenid/authKey pair can be used as part of a request-signing
 *      authentication scheme.
 *
 *    - The bundleKey can be used to encrypt data as part of the request.
 *
 *    - The token may have additional metadata details such as uid or email,
 *      which are specific to the type of token.
 *
 */

module.exports = function (log, crypto, P, hkdf, Bundle, error) {

  // Token constructor.
  // 
  // This directly populates the token from its keys and metadata details.
  // You probably want to call a helper rather than use this directly.
  //
  function Token(keys, details) {
    this.data = keys.data
    this.id = keys.id
    this.authKey = keys.authKey
    this.bundleKey = keys.bundleKey
    this.algorithm = 'sha256'
    this.uid = details.uid || null
  }

  // Create a new token of the given type.
  // This uses randomly-generated seed data to derive the keys.
  //
  Token.createNewToken = function(TokenType, details) {
    var d = P.defer()
    // capturing the domain here is a workaround for:
    // https://github.com/joyent/node/issues/3965
    // this will be fixed in node v0.12
    var domain = process.domain
    crypto.randomBytes(
      32,
      function (err, bytes) {
        if (domain) domain.enter()
        if (err) {
          d.reject(err)
        } else {
          Token.deriveTokenKeys(TokenType, bytes)
            .then(
              function (keys) {
                d.resolve(new TokenType(keys, details || {}))
              }
            )
            .fail(
              function (err) {
                d.reject(err)
              }
            )
        }
        if (domain) domain.exit()
      }
    )
    return d.promise
  }


  // Re-create an existing token of the given type.
  // This uses known seed data to derive the keys.
  //
  Token.createTokenFromHexData = function(TokenType, hexData, details) {
    var d = P.defer()
    var data = Buffer(hexData, 'hex')
    Token.deriveTokenKeys(TokenType, data)
      .then(
        function (keys) {
          d.resolve(new TokenType(keys, details || {}))
        }
      )
      .fail(
        function (err) {
          d.reject(err)
        }
      )
    return d.promise
  }


  // Derive tokenid, authKey and bundleKey from token seed data.
  //
  Token.deriveTokenKeys = function (TokenType, data) {
    return hkdf(data, TokenType.tokenTypeID, null, 3 * 32)
      .then(
        function (keyMaterial) {
          return {
            data: data.toString('hex'),
            id: keyMaterial.slice(0, 32).toString('hex'),
            authKey: keyMaterial.slice(32, 64).toString('hex'),
            bundleKey: keyMaterial.slice(64, 96).toString('hex')
          }
        }
      )
  }


  // Convenience method to bundle a payload using token bundleKey.
  //
  Token.prototype.bundle = function(keyInfo, payload) {
    log.trace({ op: 'Token.bundle' })
    return Bundle.bundle(Buffer(this.bundleKey, 'hex'), keyInfo, payload)
  }


  // Convenience method to unbundle a payload using token bundleKey.
  //
  Token.prototype.unbundle = function(keyInfo, payload) {
    log.trace({ op: 'Token.unbundle' })
    return Bundle.unbundle(Buffer(this.bundleKey, 'hex'), keyInfo, payload)
  }


  // `token.key` is used by Hawk, and should be a Buffer.
  // We store the hex-string so a getter is convenient
  Object.defineProperty(
    Token.prototype,
    'key',
    {
      get: function () { return Buffer(this.authKey, 'hex') },
      set: function (x) { this.authKey = x.toString('hex') }
    }
  )

  return Token
}

},{"__browserify_Buffer":4,"__browserify_process":76}],"xttfNN":[function(require,module,exports){
var jsbn = require('jsbn');
var Buffer = require('buffer').Buffer;

var bigint = module.exports = function(int, base) {
  var n = new BigNum(int, base);
  n.constructor = BigNum;
  return n;
};

function BigNum(str, base) {
  this._jsbn = new jsbn(str, base || 10);
}

function fromJsbn(n) {
  var bi = new BigNum(0);
  bi._jsbn = n;
  bi.constructor = BigNum;
  return bi;
}

BigNum.prototype = {
  powm: function(a, b) {
    if (!a._jsbn) a = new BigInt(a);
    if (!b._jsbn) b = new BigInt(b);
    return fromJsbn(this._jsbn.modPow(a._jsbn, b._jsbn));
  },
  eq: function(a) {
    if (!a._jsbn) a = new BigInt(a);
    return this._jsbn.equals(a._jsbn);
  },
  cmp: function(a) {
    if (!a._jsbn) a = new BigInt(a);
    return this._jsbn.compareTo(a._jsbn);
  },
  gt: function(a) {
    return this.cmp(a) > 0;
  },
  ge: function(a) {
    return this.cmp(a) >= 0;
  },
  lt: function(a) {
    return this.cmp(a) < 0;
  },
  le: function(a) {
    return this.cmp(a) <= 0;
  },
  bitLength: function() {
    return this._jsbn.bitLength();
  },
  toBuffer: function() {
    var hex = this._jsbn.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return new Buffer(hex, 'hex');
  },
  toString: function(base) {
    return this._jsbn.toString(base);
  }
};

var binOps = {
  add: 'add',
  sub: 'subtract',
  mul: 'multiply',
  mod: 'mod',
  xor: 'xor'
};

Object.keys(binOps).forEach(function(op) {
  BigNum.prototype[op] = function (a) {
    if (!a._jsbn) a = new BigNum(a);
    return fromJsbn(this._jsbn[binOps[op]](a._jsbn));
  };
});

bigint.fromBuffer = function(buffer) {
  var n = new BigNum(buffer.toString('hex'), 16);
  n.constructor = BigNum;
  return n;
};

Object.keys(BigNum.prototype).forEach(function (name) {
    if (name === 'inspect' || name === 'toString') return;

    bigint[name] = function (num) {
        var args = [].slice.call(arguments, 1);

        if (num._jsbn) {
            return num[name].apply(num, args);
        }
        else {
            var bigi = new BigNum(num);
            return bigi[name].apply(bigi, args);
        }
    };
});

},{"buffer":"IZihkv","jsbn":22}],22:[function(require,module,exports){
(function(){
    
    // Copyright (c) 2005  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Basic JavaScript BN library - subset useful for RSA encryption.

    // Bits per digit
    var dbits;

    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary&0xffffff)==0xefcafe);

    // (public) Constructor
    function BigInteger(a,b,c) {
      if(a != null)
        if("number" == typeof a) this.fromNumber(a,b,c);
        else if(b == null && "string" != typeof a) this.fromString(a,256);
        else this.fromString(a,b);
    }

    // return new, unset BigInteger
    function nbi() { return new BigInteger(null); }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i,x,w,j,c,n) {
      while(--n >= 0) {
        var v = x*this[i++]+w[j]+c;
        c = Math.floor(v/0x4000000);
        w[j++] = v&0x3ffffff;
      }
      return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i,x,w,j,c,n) {
      var xl = x&0x7fff, xh = x>>15;
      while(--n >= 0) {
        var l = this[i]&0x7fff;
        var h = this[i++]>>15;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
        c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
        w[j++] = l&0x3fffffff;
      }
      return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i,x,w,j,c,n) {
      var xl = x&0x3fff, xh = x>>14;
      while(--n >= 0) {
        var l = this[i]&0x3fff;
        var h = this[i++]>>14;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x3fff)<<14)+w[j]+c;
        c = (l>>28)+(m>>14)+xh*h;
        w[j++] = l&0xfffffff;
      }
      return c;
    }
    var inBrowser = typeof navigator !== "undefined";
    if(inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
      BigInteger.prototype.am = am2;
      dbits = 30;
    }
    else if(inBrowser && j_lm && (navigator.appName != "Netscape")) {
      BigInteger.prototype.am = am1;
      dbits = 26;
    }
    else { // Mozilla/Netscape seems to prefer am3
      BigInteger.prototype.am = am3;
      dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1<<dbits)-1);
    BigInteger.prototype.DV = (1<<dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2,BI_FP);
    BigInteger.prototype.F1 = BI_FP-dbits;
    BigInteger.prototype.F2 = 2*dbits-BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr,vv;
    rr = "0".charCodeAt(0);
    for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s,i) {
      var c = BI_RC[s.charCodeAt(i)];
      return (c==null)?-1:c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
      for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
      r.t = this.t;
      r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
      this.t = 1;
      this.s = (x<0)?-1:0;
      if(x > 0) this[0] = x;
      else if(x < -1) this[0] = x+DV;
      else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

    // (protected) set from string and radix
    function bnpFromString(s,b) {
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 256) k = 8; // byte array
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else { this.fromRadix(s,b); return; }
      this.t = 0;
      this.s = 0;
      var i = s.length, mi = false, sh = 0;
      while(--i >= 0) {
        var x = (k==8)?s[i]&0xff:intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-") mi = true;
          continue;
        }
        mi = false;
        if(sh == 0)
          this[this.t++] = x;
        else if(sh+k > this.DB) {
          this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
          this[this.t++] = (x>>(this.DB-sh));
        }
        else
          this[this.t-1] |= x<<sh;
        sh += k;
        if(sh >= this.DB) sh -= this.DB;
      }
      if(k == 8 && (s[0]&0x80) != 0) {
        this.s = -1;
        if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
      }
      this.clamp();
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
      var c = this.s&this.DM;
      while(this.t > 0 && this[this.t-1] == c) --this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
      if(this.s < 0) return "-"+this.negate().toString(b);
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else return this.toRadix(b);
      var km = (1<<k)-1, d, m = false, r = "", i = this.t;
      var p = this.DB-(i*this.DB)%k;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
        while(i >= 0) {
          if(p < k) {
            d = (this[i]&((1<<p)-1))<<(k-p);
            d |= this[--i]>>(p+=this.DB-k);
          }
          else {
            d = (this[i]>>(p-=k))&km;
            if(p <= 0) { p += this.DB; --i; }
          }
          if(d > 0) m = true;
          if(m) r += int2char(d);
        }
      }
      return m?r:"0";
    }

    // (public) -this
    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

    // (public) |this|
    function bnAbs() { return (this.s<0)?this.negate():this; }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
      var r = this.s-a.s;
      if(r != 0) return r;
      var i = this.t;
      r = i-a.t;
      if(r != 0) return (this.s<0)?-r:r;
      while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
      return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
      var r = 1, t;
      if((t=x>>>16) != 0) { x = t; r += 16; }
      if((t=x>>8) != 0) { x = t; r += 8; }
      if((t=x>>4) != 0) { x = t; r += 4; }
      if((t=x>>2) != 0) { x = t; r += 2; }
      if((t=x>>1) != 0) { x = t; r += 1; }
      return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
      if(this.t <= 0) return 0;
      return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n,r) {
      var i;
      for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
      for(i = n-1; i >= 0; --i) r[i] = 0;
      r.t = this.t+n;
      r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n,r) {
      for(var i = n; i < this.t; ++i) r[i-n] = this[i];
      r.t = Math.max(this.t-n,0);
      r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n,r) {
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<cbs)-1;
      var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
      for(i = this.t-1; i >= 0; --i) {
        r[i+ds+1] = (this[i]>>cbs)|c;
        c = (this[i]&bm)<<bs;
      }
      for(i = ds-1; i >= 0; --i) r[i] = 0;
      r[ds] = c;
      r.t = this.t+ds+1;
      r.s = this.s;
      r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n,r) {
      r.s = this.s;
      var ds = Math.floor(n/this.DB);
      if(ds >= this.t) { r.t = 0; return; }
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<bs)-1;
      r[0] = this[ds]>>bs;
      for(var i = ds+1; i < this.t; ++i) {
        r[i-ds-1] |= (this[i]&bm)<<cbs;
        r[i-ds] = this[i]>>bs;
      }
      if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
      r.t = this.t-ds;
      r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]-a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c -= a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c -= a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c -= a.s;
      }
      r.s = (c<0)?-1:0;
      if(c < -1) r[i++] = this.DV+c;
      else if(c > 0) r[i++] = c;
      r.t = i;
      r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a,r) {
      var x = this.abs(), y = a.abs();
      var i = x.t;
      r.t = i+y.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
      r.s = 0;
      r.clamp();
      if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
      var x = this.abs();
      var i = r.t = 2*x.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < x.t-1; ++i) {
        var c = x.am(i,x[i],r,2*i,0,1);
        if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
          r[i+x.t] -= x.DV;
          r[i+x.t+1] = 1;
        }
      }
      if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
      r.s = 0;
      r.clamp();
    }

    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m,q,r) {
      var pm = m.abs();
      if(pm.t <= 0) return;
      var pt = this.abs();
      if(pt.t < pm.t) {
        if(q != null) q.fromInt(0);
        if(r != null) this.copyTo(r);
        return;
      }
      if(r == null) r = nbi();
      var y = nbi(), ts = this.s, ms = m.s;
      var nsh = this.DB-nbits(pm[pm.t-1]);   // normalize modulus
      if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
      else { pm.copyTo(y); pt.copyTo(r); }
      var ys = y.t;
      var y0 = y[ys-1];
      if(y0 == 0) return;
      var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
      var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
      var i = r.t, j = i-ys, t = (q==null)?nbi():q;
      y.dlShiftTo(j,t);
      if(r.compareTo(t) >= 0) {
        r[r.t++] = 1;
        r.subTo(t,r);
      }
      BigInteger.ONE.dlShiftTo(ys,t);
      t.subTo(y,y);  // "negative" y so we can replace sub with am later
      while(y.t < ys) y[y.t++] = 0;
      while(--j >= 0) {
        // Estimate quotient digit
        var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
        if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {   // Try it out
          y.dlShiftTo(j,t);
          r.subTo(t,r);
          while(r[i] < --qd) r.subTo(t,r);
        }
      }
      if(q != null) {
        r.drShiftTo(ys,q);
        if(ts != ms) BigInteger.ZERO.subTo(q,q);
      }
      r.t = ys;
      r.clamp();
      if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
      if(ts < 0) BigInteger.ZERO.subTo(r,r);
    }

    // (public) this mod a
    function bnMod(a) {
      var r = nbi();
      this.abs().divRemTo(a,null,r);
      if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
      return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) { this.m = m; }
    function cConvert(x) {
      if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
      else return x;
    }
    function cRevert(x) { return x; }
    function cReduce(x) { x.divRemTo(this.m,null,x); }
    function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
    function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;

    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
      if(this.t < 1) return 0;
      var x = this[0];
      if((x&1) == 0) return 0;
      var y = x&3;       // y == 1/x mod 2^2
      y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
      y = (y*(2-(x&0xff)*y))&0xff;   // y == 1/x mod 2^8
      y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;    // y == 1/x mod 2^16
      // last step - calculate inverse mod DV directly;
      // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
      y = (y*(2-x*y%this.DV))%this.DV;       // y == 1/x mod 2^dbits
      // we really want the negative inverse, and -DV < y < DV
      return (y>0)?this.DV-y:-y;
    }

    // Montgomery reduction
    function Montgomery(m) {
      this.m = m;
      this.mp = m.invDigit();
      this.mpl = this.mp&0x7fff;
      this.mph = this.mp>>15;
      this.um = (1<<(m.DB-15))-1;
      this.mt2 = 2*m.t;
    }

    // xR mod m
    function montConvert(x) {
      var r = nbi();
      x.abs().dlShiftTo(this.m.t,r);
      r.divRemTo(this.m,null,r);
      if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
      return r;
    }

    // x/R mod m
    function montRevert(x) {
      var r = nbi();
      x.copyTo(r);
      this.reduce(r);
      return r;
    }

    // x = x/R mod m (HAC 14.32)
    function montReduce(x) {
      while(x.t <= this.mt2) // pad x so am has enough room later
        x[x.t++] = 0;
      for(var i = 0; i < this.m.t; ++i) {
        // faster way of calculating u0 = x[i]*mp mod DV
        var j = x[i]&0x7fff;
        var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
        // use am to combine the multiply-shift-add into one call
        j = i+this.m.t;
        x[j] += this.m.am(0,u0,x,i,0,this.m.t);
        // propagate carry
        while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
      }
      x.clamp();
      x.drShiftTo(this.m.t,x);
      if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

    // (protected) true iff this is even
    function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e,z) {
      if(e > 0xffffffff || e < 1) return BigInteger.ONE;
      var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
      g.copyTo(r);
      while(--i >= 0) {
        z.sqrTo(r,r2);
        if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
        else { var t = r; r = r2; r2 = t; }
      }
      return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e,m) {
      var z;
      if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
      return this.exp(e,z);
    }

    // protected
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;

    // public
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;

    // "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);

    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Extended JavaScript BN functions, required for RSA private ops.

    // Version 1.1: new BigInteger("0", 10) returns "proper" zero
    // Version 1.2: square() API, isProbablePrime fix

    // (public)
    function bnClone() { var r = nbi(); this.copyTo(r); return r; }

    // (public) return value as integer
    function bnIntValue() {
      if(this.s < 0) {
        if(this.t == 1) return this[0]-this.DV;
        else if(this.t == 0) return -1;
      }
      else if(this.t == 1) return this[0];
      else if(this.t == 0) return 0;
      // assumes 16 < DB < 32
      return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
    }

    // (public) return value as byte
    function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
      if(this.s < 0) return -1;
      else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
      else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
      if(b == null) b = 10;
      if(this.signum() == 0 || b < 2 || b > 36) return "0";
      var cs = this.chunkSize(b);
      var a = Math.pow(b,cs);
      var d = nbv(a), y = nbi(), z = nbi(), r = "";
      this.divRemTo(d,y,z);
      while(y.signum() > 0) {
        r = (a+z.intValue()).toString(b).substr(1) + r;
        y.divRemTo(d,y,z);
      }
      return z.intValue().toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s,b) {
      this.fromInt(0);
      if(b == null) b = 10;
      var cs = this.chunkSize(b);
      var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
      for(var i = 0; i < s.length; ++i) {
        var x = intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
          continue;
        }
        w = b*w+x;
        if(++j >= cs) {
          this.dMultiply(d);
          this.dAddOffset(w,0);
          j = 0;
          w = 0;
        }
      }
      if(j > 0) {
        this.dMultiply(Math.pow(b,j));
        this.dAddOffset(w,0);
      }
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a,b,c) {
      if("number" == typeof b) {
        // new BigInteger(int,int,RNG)
        if(a < 2) this.fromInt(1);
        else {
          this.fromNumber(a,c);
          if(!this.testBit(a-1))	// force MSB set
            this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
          if(this.isEven()) this.dAddOffset(1,0); // force odd
          while(!this.isProbablePrime(b)) {
            this.dAddOffset(2,0);
            if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
          }
        }
      }
      else {
        // new BigInteger(int,RNG)
        var x = new Array(), t = a&7;
        x.length = (a>>3)+1;
        b.nextBytes(x);
        if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
        this.fromString(x,256);
      }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
      var i = this.t, r = new Array();
      r[0] = this.s;
      var p = this.DB-(i*this.DB)%8, d, k = 0;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
          r[k++] = d|(this.s<<(this.DB-p));
        while(i >= 0) {
          if(p < 8) {
            d = (this[i]&((1<<p)-1))<<(8-p);
            d |= this[--i]>>(p+=this.DB-8);
          }
          else {
            d = (this[i]>>(p-=8))&0xff;
            if(p <= 0) { p += this.DB; --i; }
          }
          if((d&0x80) != 0) d |= -256;
          if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
          if(k > 0 || d != this.s) r[k++] = d;
        }
      }
      return r;
    }

    function bnEquals(a) { return(this.compareTo(a)==0); }
    function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
    function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a,op,r) {
      var i, f, m = Math.min(a.t,this.t);
      for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
      if(a.t < this.t) {
        f = a.s&this.DM;
        for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
        r.t = this.t;
      }
      else {
        f = this.s&this.DM;
        for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
        r.t = a.t;
      }
      r.s = op(this.s,a.s);
      r.clamp();
    }

    // (public) this & a
    function op_and(x,y) { return x&y; }
    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

    // (public) this | a
    function op_or(x,y) { return x|y; }
    function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

    // (public) this ^ a
    function op_xor(x,y) { return x^y; }
    function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

    // (public) this & ~a
    function op_andnot(x,y) { return x&~y; }
    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

    // (public) ~this
    function bnNot() {
      var r = nbi();
      for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
      r.t = this.t;
      r.s = ~this.s;
      return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
      var r = nbi();
      if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
      return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
      var r = nbi();
      if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
      return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
      if(x == 0) return -1;
      var r = 0;
      if((x&0xffff) == 0) { x >>= 16; r += 16; }
      if((x&0xff) == 0) { x >>= 8; r += 8; }
      if((x&0xf) == 0) { x >>= 4; r += 4; }
      if((x&3) == 0) { x >>= 2; r += 2; }
      if((x&1) == 0) ++r;
      return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
      for(var i = 0; i < this.t; ++i)
        if(this[i] != 0) return i*this.DB+lbit(this[i]);
      if(this.s < 0) return this.t*this.DB;
      return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
      var r = 0;
      while(x != 0) { x &= x-1; ++r; }
      return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
      var r = 0, x = this.s&this.DM;
      for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
      return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
      var j = Math.floor(n/this.DB);
      if(j >= this.t) return(this.s!=0);
      return((this[j]&(1<<(n%this.DB)))!=0);
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n,op) {
      var r = BigInteger.ONE.shiftLeft(n);
      this.bitwiseTo(r,op,r);
      return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) { return this.changeBit(n,op_or); }

    // (public) this & ~(1<<n)
    function bnClearBit(n) { return this.changeBit(n,op_andnot); }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) { return this.changeBit(n,op_xor); }

    // (protected) r = this + a
    function bnpAddTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]+a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c += a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c += a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += a.s;
      }
      r.s = (c<0)?-1:0;
      if(c > 0) r[i++] = c;
      else if(c < -1) r[i++] = this.DV+c;
      r.t = i;
      r.clamp();
    }

    // (public) this + a
    function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

    // (public) this - a
    function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

    // (public) this * a
    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

    // (public) this^2
    function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

    // (public) this / a
    function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

    // (public) this % a
    function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
      var q = nbi(), r = nbi();
      this.divRemTo(a,q,r);
      return new Array(q,r);
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
      this[this.t] = this.am(0,n-1,this,0,0,this.t);
      ++this.t;
      this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n,w) {
      if(n == 0) return;
      while(this.t <= w) this[this.t++] = 0;
      this[w] += n;
      while(this[w] >= this.DV) {
        this[w] -= this.DV;
        if(++w >= this.t) this[this.t++] = 0;
        ++this[w];
      }
    }

    // A "null" reducer
    function NullExp() {}
    function nNop(x) { return x; }
    function nMulTo(x,y,r) { x.multiplyTo(y,r); }
    function nSqrTo(x,r) { x.squareTo(r); }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

    // (public) this^e
    function bnPow(e) { return this.exp(e,new NullExp()); }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a,n,r) {
      var i = Math.min(this.t+a.t,n);
      r.s = 0; // assumes a,this >= 0
      r.t = i;
      while(i > 0) r[--i] = 0;
      var j;
      for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
      for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
      r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a,n,r) {
      --n;
      var i = r.t = this.t+a.t-n;
      r.s = 0; // assumes a,this >= 0
      while(--i >= 0) r[i] = 0;
      for(i = Math.max(n-this.t,0); i < a.t; ++i)
        r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
      r.clamp();
      r.drShiftTo(1,r);
    }

    // Barrett modular reduction
    function Barrett(m) {
      // setup Barrett
      this.r2 = nbi();
      this.q3 = nbi();
      BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
      this.mu = this.r2.divide(m);
      this.m = m;
    }

    function barrettConvert(x) {
      if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
      else if(x.compareTo(this.m) < 0) return x;
      else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
    }

    function barrettRevert(x) { return x; }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
      x.drShiftTo(this.m.t-1,this.r2);
      if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
      this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
      this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
      while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
      x.subTo(this.r2,x);
      while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

    // (public) this^e % m (HAC 14.85)
    function bnModPow(e,m) {
      var i = e.bitLength(), k, r = nbv(1), z;
      if(i <= 0) return r;
      else if(i < 18) k = 1;
      else if(i < 48) k = 3;
      else if(i < 144) k = 4;
      else if(i < 768) k = 5;
      else k = 6;
      if(i < 8)
        z = new Classic(m);
      else if(m.isEven())
        z = new Barrett(m);
      else
        z = new Montgomery(m);

      // precomputation
      var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
      g[1] = z.convert(this);
      if(k > 1) {
        var g2 = nbi();
        z.sqrTo(g[1],g2);
        while(n <= km) {
          g[n] = nbi();
          z.mulTo(g2,g[n-2],g[n]);
          n += 2;
        }
      }

      var j = e.t-1, w, is1 = true, r2 = nbi(), t;
      i = nbits(e[j])-1;
      while(j >= 0) {
        if(i >= k1) w = (e[j]>>(i-k1))&km;
        else {
          w = (e[j]&((1<<(i+1))-1))<<(k1-i);
          if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
        }

        n = k;
        while((w&1) == 0) { w >>= 1; --n; }
        if((i -= n) < 0) { i += this.DB; --j; }
        if(is1) {	// ret == 1, don't bother squaring or multiplying it
          g[w].copyTo(r);
          is1 = false;
        }
        else {
          while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
          if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
          z.mulTo(r2,g[w],r);
        }

        while(j >= 0 && (e[j]&(1<<i)) == 0) {
          z.sqrTo(r,r2); t = r; r = r2; r2 = t;
          if(--i < 0) { i = this.DB-1; --j; }
        }
      }
      return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
      var x = (this.s<0)?this.negate():this.clone();
      var y = (a.s<0)?a.negate():a.clone();
      if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
      var i = x.getLowestSetBit(), g = y.getLowestSetBit();
      if(g < 0) return x;
      if(i < g) g = i;
      if(g > 0) {
        x.rShiftTo(g,x);
        y.rShiftTo(g,y);
      }
      while(x.signum() > 0) {
        if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
        if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
        if(x.compareTo(y) >= 0) {
          x.subTo(y,x);
          x.rShiftTo(1,x);
        }
        else {
          y.subTo(x,y);
          y.rShiftTo(1,y);
        }
      }
      if(g > 0) y.lShiftTo(g,y);
      return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
      if(n <= 0) return 0;
      var d = this.DV%n, r = (this.s<0)?n-1:0;
      if(this.t > 0)
        if(d == 0) r = this[0]%n;
        else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
      return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
      var ac = m.isEven();
      if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
      var u = m.clone(), v = this.clone();
      var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
      while(u.signum() != 0) {
        while(u.isEven()) {
          u.rShiftTo(1,u);
          if(ac) {
            if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
            a.rShiftTo(1,a);
          }
          else if(!b.isEven()) b.subTo(m,b);
          b.rShiftTo(1,b);
        }
        while(v.isEven()) {
          v.rShiftTo(1,v);
          if(ac) {
            if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
            c.rShiftTo(1,c);
          }
          else if(!d.isEven()) d.subTo(m,d);
          d.rShiftTo(1,d);
        }
        if(u.compareTo(v) >= 0) {
          u.subTo(v,u);
          if(ac) a.subTo(c,a);
          b.subTo(d,b);
        }
        else {
          v.subTo(u,v);
          if(ac) c.subTo(a,c);
          d.subTo(b,d);
        }
      }
      if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
      if(d.compareTo(m) >= 0) return d.subtract(m);
      if(d.signum() < 0) d.addTo(m,d); else return d;
      if(d.signum() < 0) return d.add(m); else return d;
    }

    var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
    var lplim = (1<<26)/lowprimes[lowprimes.length-1];

    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
      var i, x = this.abs();
      if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
        for(i = 0; i < lowprimes.length; ++i)
          if(x[0] == lowprimes[i]) return true;
        return false;
      }
      if(x.isEven()) return false;
      i = 1;
      while(i < lowprimes.length) {
        var m = lowprimes[i], j = i+1;
        while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
        m = x.modInt(m);
        while(i < j) if(m%lowprimes[i++] == 0) return false;
      }
      return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
      var n1 = this.subtract(BigInteger.ONE);
      var k = n1.getLowestSetBit();
      if(k <= 0) return false;
      var r = n1.shiftRight(k);
      t = (t+1)>>1;
      if(t > lowprimes.length) t = lowprimes.length;
      var a = nbi();
      for(var i = 0; i < t; ++i) {
        //Pick bases at random, instead of starting at 2
        a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
        var y = a.modPow(r,this);
        if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
          var j = 1;
          while(j++ < k && y.compareTo(n1) != 0) {
            y = y.modPowInt(2,this);
            if(y.compareTo(BigInteger.ONE) == 0) return false;
          }
          if(y.compareTo(n1) != 0) return false;
        }
      }
      return true;
    }

    // protected
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;

    // public
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

    // JSBN-specific extension
    BigInteger.prototype.square = bnSquare;

    // BigInteger interfaces not implemented in jsbn:

    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)
    if (typeof exports !== 'undefined') {
        exports = module.exports = BigInteger;
    } else {
        this.BigInteger = BigInteger;
    }
    
}).call(this);
},{}],"hWH+d8":[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')

module.exports = request
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}

},{}],24:[function(require,module,exports){

},{}],25:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"buffer":"IZihkv","util":33}],26:[function(require,module,exports){

},{}],27:[function(require,module,exports){
var process=require("__browserify_process");if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (typeof emitter._events[type] === 'function')
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

},{"__browserify_process":76}],28:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],29:[function(require,module,exports){
var process=require("__browserify_process");function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';

},{"__browserify_process":76}],30:[function(require,module,exports){

/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Array#indexOf shim.
 */

var indexOf = typeof Array.prototype.indexOf === 'function'
  ? function(arr, el) { return arr.indexOf(el); }
  : function(arr, el) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === el) return i;
      }
      return -1;
    };

/**
 * Array.isArray shim.
 */

var isArray = Array.isArray || function(arr) {
  return toString.call(arr) == '[object Array]';
};

/**
 * Object.keys shim.
 */

var objectKeys = Object.keys || function(obj) {
  var ret = [];
  for (var key in obj) ret.push(key);
  return ret;
};

/**
 * Array#forEach shim.
 */

var forEach = typeof Array.prototype.forEach === 'function'
  ? function(arr, fn) { return arr.forEach(fn); }
  : function(arr, fn) {
      for (var i = 0; i < arr.length; i++) fn(arr[i]);
    };

/**
 * Array#reduce shim.
 */

var reduce = function(arr, fn, initial) {
  if (typeof arr.reduce === 'function') return arr.reduce(fn, initial);
  var res = initial;
  for (var i = 0; i < arr.length; i++) res = fn(res, arr[i]);
  return res;
};

/**
 * Cache non-integer test regexp.
 */

var isint = /^[0-9]+$/;

function promote(parent, key) {
  if (parent[key].length == 0) return parent[key] = {};
  var t = {};
  for (var i in parent[key]) t[i] = parent[key][i];
  parent[key] = t;
  return t;
}

function parse(parts, parent, key, val) {
  var part = parts.shift();
  // end
  if (!part) {
    if (isArray(parent[key])) {
      parent[key].push(val);
    } else if ('object' == typeof parent[key]) {
      parent[key] = val;
    } else if ('undefined' == typeof parent[key]) {
      parent[key] = val;
    } else {
      parent[key] = [parent[key], val];
    }
    // array
  } else {
    var obj = parent[key] = parent[key] || [];
    if (']' == part) {
      if (isArray(obj)) {
        if ('' != val) obj.push(val);
      } else if ('object' == typeof obj) {
        obj[objectKeys(obj).length] = val;
      } else {
        obj = parent[key] = [parent[key], val];
      }
      // prop
    } else if (~indexOf(part, ']')) {
      part = part.substr(0, part.length - 1);
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
      // key
    } else {
      if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
      parse(parts, obj, part, val);
    }
  }
}

/**
 * Merge parent key/val pair.
 */

function merge(parent, key, val){
  if (~indexOf(key, ']')) {
    var parts = key.split('[')
      , len = parts.length
      , last = len - 1;
    parse(parts, parent, 'base', val);
    // optimize
  } else {
    if (!isint.test(key) && isArray(parent.base)) {
      var t = {};
      for (var k in parent.base) t[k] = parent.base[k];
      parent.base = t;
    }
    set(parent.base, key, val);
  }

  return parent;
}

/**
 * Parse the given obj.
 */

function parseObject(obj){
  var ret = { base: {} };
  forEach(objectKeys(obj), function(name){
    merge(ret, name, obj[name]);
  });
  return ret.base;
}

/**
 * Parse the given str.
 */

function parseString(str){
  return reduce(String(str).split('&'), function(ret, pair){
    var eql = indexOf(pair, '=')
      , brace = lastBraceInKey(pair)
      , key = pair.substr(0, brace || eql)
      , val = pair.substr(brace || eql, pair.length)
      , val = val.substr(indexOf(val, '=') + 1, val.length);

    // ?foo
    if ('' == key) key = pair, val = '';
    if ('' == key) return ret;

    return merge(ret, decode(key), decode(val));
  }, { base: {} }).base;
}

/**
 * Parse the given query `str` or `obj`, returning an object.
 *
 * @param {String} str | {Object} obj
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str);
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix + '=' + encodeURIComponent(String(obj));
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;

  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if (null == obj[key]) {
      ret.push(encodeURIComponent(key) + '=');
    } else {
      ret.push(stringify(obj[key], prefix
        ? prefix + '[' + encodeURIComponent(key) + ']'
        : encodeURIComponent(key)));
    }
  }

  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

/**
 * Decode `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function decode(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (err) {
    return str;
  }
}

},{}],31:[function(require,module,exports){
var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!dest._isStdio && (!options || options.end !== false)) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":27,"util":33}],32:[function(require,module,exports){
var punycode = { encode : function (s) { return s } };

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

function arrayIndexOf(array, subject) {
    for (var i = 0, j = array.length; i < j; i++) {
        if(array[i] == subject) return i;
    }
    return -1;
}

var objectKeys = Object.keys || function objectKeys(object) {
    if (object !== Object(object)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in object) if (object.hasOwnProperty(key)) keys[keys.length] = key;
    return keys;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]+$/,
    // RFC 2396: characters reserved for delimiting URLs.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '~', '[', ']', '`'].concat(delims),
    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''],
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#']
      .concat(unwise).concat(autoEscape),
    nonAuthChars = ['/', '@', '?', '#'].concat(delims),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
    hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always have a path component.
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var out = {},
      rest = url;

  // cut off any delimiters.
  // This is to support parse stuff like "<http://foo.com>"
  for (var i = 0, l = rest.length; i < l; i++) {
    if (arrayIndexOf(delims, rest.charAt(i)) === -1) break;
  }
  if (i !== 0) rest = rest.substr(i);


  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    out.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.

    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the first @ sign, unless some non-auth character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    var atSign = arrayIndexOf(rest, '@');
    if (atSign !== -1) {
      // there *may be* an auth
      var hasAuth = true;
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        var index = arrayIndexOf(rest, nonAuthChars[i]);
        if (index !== -1 && index < atSign) {
          // not a valid auth.  Something like http://foo.com/bar@baz/
          hasAuth = false;
          break;
        }
      }
      if (hasAuth) {
        // pluck off the auth portion.
        out.auth = rest.substr(0, atSign);
        rest = rest.substr(atSign + 1);
      }
    }

    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = arrayIndexOf(rest, nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }

    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out port.
    var p = parseHost(out.host);
    var keys = objectKeys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    // hostnames are always lower case.
    out.hostname = out.hostname.toLowerCase();

    // IDNA Support: Returns a puny coded representation of "domain".
    // It only converts the part of the domain name that
    // has non ASCII characters. I.e. it dosent matter if
    // you call it with a domain that already is in ASCII.
    var domainArray = out.hostname.split('.');
    var newOut = [];
    for (var i = 0; i < domainArray.length; ++i) {
      var s = domainArray[i];
      newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
          'xn--' + punycode.encode(s) : s);
    }
    out.hostname = newOut.join('.');

    out.host = (out.hostname || '') +
        ((out.port) ? ':' + out.port : '');
    out.href += out.host;
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }

    // Now make sure that delims never appear in a url.
    var chop = rest.length;
    for (var i = 0, l = delims.length; i < l; i++) {
      var c = arrayIndexOf(rest, delims[i]);
      if (c !== -1) {
        chop = Math.min(c, chop);
      }
    }
    rest = rest.substr(0, chop);
  }


  // chop off from the tail first.
  var hash = arrayIndexOf(rest, '#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = arrayIndexOf(rest, '?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  //to support http.request
  if (out.pathname || out.search) {
    out.path = (out.pathname ? out.pathname : '') +
               (out.search ? out.search : '');
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);
  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var auth = obj.auth || '';
  if (auth) {
    auth = auth.split('@').join('%40');
    for (var i = 0, l = nonAuthChars.length; i < l; i++) {
      var nAC = nonAuthChars[i];
      auth = auth.split(nAC).join(encodeURIComponent(nAC));
    }
    auth += '@';
  }

  var protocol = obj.protocol || '',
      host = (obj.host !== undefined) ? auth + obj.host :
          obj.hostname !== undefined ? (
              auth + obj.hostname +
              (obj.port ? ':' + obj.port : '')
          ) :
          false,
      pathname = obj.pathname || '',
      query = obj.query &&
              ((typeof obj.query === 'object' &&
                objectKeys(obj.query).length) ?
                 querystring.stringify(obj.query) :
                 '') || '',
      search = obj.search || (query && ('?' + query)) || '',
      hash = obj.hash || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') {
    source.href = urlFormat(source);
    return source;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[relative.protocol] &&
        relative.hostname && !relative.pathname) {
      relative.path = relative.pathname = '/';
    }
    relative.href = urlFormat(relative);
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      relative.href = urlFormat(relative);
      return relative;
    }
    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    source.auth = relative.auth;
    source.hostname = relative.hostname || relative.host;
    source.port = relative.port;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;
    if (relative.protocol) {
      delete relative.hostname;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : source.hostname;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.hostname = source.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
    source.search = relative.search;
    source.query = relative.query;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.href = urlFormat(source);
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    //to support http.request
    if (!source.search) {
      source.path = '/' + source.search;
    } else {
      delete source.path;
    }
    source.href = urlFormat(source);
    return source;
  }
  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.hostname = source.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                     source.host.split('@') : false;
    if (authInHost) {
      source.auth = authInHost.shift();
      source.host = source.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');
  //to support request.http
  if (source.pathname !== undefined || source.search !== undefined) {
    source.path = (source.pathname ? source.pathname : '') +
                  (source.search ? source.search : '');
  }
  source.auth = relative.auth || source.auth;
  source.slashes = source.slashes || relative.slashes;
  source.href = urlFormat(source);
  return source;
}

function parseHost(host) {
  var out = {};
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    out.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

},{"querystring":30}],33:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\u001b[' + styles[style][0] + 'm' + str +
             '\u001b[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && Object.prototype.toString.call(ar) === '[object Array]');
}


function isRegExp(re) {
  typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]';
}


function isDate(d) {
  return typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]';
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":27}],34:[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');

http.request = function (params, cb) {
    if (!params) params = {};
    if (!params.host) params.host = window.location.host.split(':')[0];
    if (!params.port) params.port = window.location.port;
    if (!params.scheme) params.scheme = window.location.protocol.split(':')[0];
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

},{"./lib/request":35,"events":27}],35:[function(require,module,exports){
var Stream = require('stream');
var Response = require('./response');
var concatStream = require('concat-stream');
var Base64 = require('Base64');
var util = require('util');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = concatStream()
    
    var uri = params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    xhr.open(
        params.method || 'GET',
        (params.scheme || 'http') + '://' + uri,
        true
    );
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            if (isArray(value)) {
                for (var j = 0; j < value.length; j++) {
                    xhr.setRequestHeader(key, value[j]);
                }
            }
            else xhr.setRequestHeader(key, value)
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        res.handle(xhr);
    };
};

util.inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    if (isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            this.xhr.setRequestHeader(key, value[i]);
        }
    }
    else {
        this.xhr.setRequestHeader(key, value);
    }
};

Request.prototype.write = function (s) {
    this.body.write(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.write(s);
    this.body.end()
    this.xhr.send(this.body.getBody());
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

},{"./response":36,"Base64":37,"concat-stream":38,"stream":31,"util":33}],36:[function(require,module,exports){
var Stream = require('stream');
var util = require('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":31,"util":33}],37:[function(require,module,exports){
;(function () {

  var
    object = typeof exports != 'undefined' ? exports : this, // #8: web workers
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    INVALID_CHARACTER_ERR = (function () {
      // fabricate a suitable error object
      try { document.createElement('$'); }
      catch (error) { return error; }}());

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) throw INVALID_CHARACTER_ERR;
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '')
    if (input.length % 4 == 1) throw INVALID_CHARACTER_ERR;
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],38:[function(require,module,exports){
var stream = require('stream')
var bops = require('bops')
var util = require('util')

function ConcatStream(cb) {
  stream.Stream.call(this)
  this.writable = true
  if (cb) this.cb = cb
  this.body = []
  this.on('error', function(err) {
    // no-op
  })
}

util.inherits(ConcatStream, stream.Stream)

ConcatStream.prototype.write = function(chunk) {
  this.body.push(chunk)
}

ConcatStream.prototype.destroy = function() {}

ConcatStream.prototype.arrayConcat = function(arrs) {
  if (arrs.length === 0) return []
  if (arrs.length === 1) return arrs[0]
  return arrs.reduce(function (a, b) { return a.concat(b) })
}

ConcatStream.prototype.isArray = function(arr) {
  return Array.isArray(arr)
}

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0) return
  if (typeof(this.body[0]) === "string") return this.body.join('')
  if (this.isArray(this.body[0])) return this.arrayConcat(this.body)
  if (bops.is(this.body[0])) return bops.join(this.body)
  return this.body
}

ConcatStream.prototype.end = function() {
  if (this.cb) this.cb(this.getBody())
}

module.exports = function(cb) {
  return new ConcatStream(cb)
}

module.exports.ConcatStream = ConcatStream

},{"bops":39,"stream":31,"util":33}],39:[function(require,module,exports){
var proto = {}
module.exports = proto

proto.from = require('./from.js')
proto.to = require('./to.js')
proto.is = require('./is.js')
proto.subarray = require('./subarray.js')
proto.join = require('./join.js')
proto.copy = require('./copy.js')
proto.create = require('./create.js')

mix(require('./read.js'), proto)
mix(require('./write.js'), proto)

function mix(from, into) {
  for(var key in from) {
    into[key] = from[key]
  }
}

},{"./copy.js":42,"./create.js":43,"./from.js":44,"./is.js":45,"./join.js":46,"./read.js":48,"./subarray.js":49,"./to.js":50,"./write.js":51}],40:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],41:[function(require,module,exports){
module.exports = to_utf8

var out = []
  , col = []
  , fcc = String.fromCharCode
  , mask = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01]
  , unmask = [
      0x00
    , 0x01
    , 0x02 | 0x01
    , 0x04 | 0x02 | 0x01
    , 0x08 | 0x04 | 0x02 | 0x01
    , 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
    , 0x40 | 0x20 | 0x10 | 0x08 | 0x04 | 0x02 | 0x01
  ]

function to_utf8(bytes, start, end) {
  start = start === undefined ? 0 : start
  end = end === undefined ? bytes.length : end

  var idx = 0
    , hi = 0x80
    , collecting = 0
    , pos
    , by

  col.length =
  out.length = 0

  while(idx < bytes.length) {
    by = bytes[idx]
    if(!collecting && by & hi) {
      pos = find_pad_position(by)
      collecting += pos
      if(pos < 8) {
        col[col.length] = by & unmask[6 - pos]
      }
    } else if(collecting) {
      col[col.length] = by & unmask[6]
      --collecting
      if(!collecting && col.length) {
        out[out.length] = fcc(reduced(col, pos))
        col.length = 0
      }
    } else { 
      out[out.length] = fcc(by)
    }
    ++idx
  }
  if(col.length && !collecting) {
    out[out.length] = fcc(reduced(col, pos))
    col.length = 0
  }
  return out.join('')
}

function find_pad_position(byt) {
  for(var i = 0; i < 7; ++i) {
    if(!(byt & mask[i])) {
      break
    }
  }
  return i
}

function reduced(list) {
  var out = 0
  for(var i = 0, len = list.length; i < len; ++i) {
    out |= list[i] << ((len - i - 1) * 6)
  }
  return out
}

},{}],42:[function(require,module,exports){
module.exports = copy

var slice = [].slice

function copy(source, target, target_start, source_start, source_end) {
  target_start = arguments.length < 3 ? 0 : target_start
  source_start = arguments.length < 4 ? 0 : source_start
  source_end = arguments.length < 5 ? source.length : source_end

  if(source_end === source_start) {
    return
  }

  if(target.length === 0 || source.length === 0) {
    return
  }

  if(source_end > source.length) {
    source_end = source.length
  }

  if(target.length - target_start < source_end - source_start) {
    source_end = target.length - target_start + start
  }

  if(source.buffer !== target.buffer) {
    return fast_copy(source, target, target_start, source_start, source_end)
  }
  return slow_copy(source, target, target_start, source_start, source_end)
}

function fast_copy(source, target, target_start, source_start, source_end) {
  var len = (source_end - source_start) + target_start

  for(var i = target_start, j = source_start;
      i < len;
      ++i,
      ++j) {
    target[i] = source[j]
  }
}

function slow_copy(from, to, j, i, jend) {
  // the buffers could overlap.
  var iend = jend + i
    , tmp = new Uint8Array(slice.call(from, i, iend))
    , x = 0

  for(; i < iend; ++i, ++x) {
    to[j++] = tmp[x]
  }
}

},{}],43:[function(require,module,exports){
module.exports = function(size) {
  return new Uint8Array(size)
}

},{}],44:[function(require,module,exports){
module.exports = from

var base64 = require('base64-js')

var decoders = {
    hex: from_hex
  , utf8: from_utf
  , base64: from_base64
}

function from(source, encoding) {
  if(Array.isArray(source)) {
    return new Uint8Array(source)
  }

  return decoders[encoding || 'utf8'](source)
}

function from_hex(str) {
  var size = str.length / 2
    , buf = new Uint8Array(size)
    , character = ''

  for(var i = 0, len = str.length; i < len; ++i) {
    character += str.charAt(i)

    if(i > 0 && (i % 2) === 1) {
      buf[i>>>1] = parseInt(character, 16)
      character = '' 
    }
  }

  return buf 
}

function from_utf(str) {
  var bytes = []
    , tmp
    , ch

  for(var i = 0, len = str.length; i < len; ++i) {
    ch = str.charCodeAt(i)
    if(ch & 0x80) {
      tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
      for(var j = 0, jlen = tmp.length; j < jlen; ++j) {
        bytes[bytes.length] = parseInt(tmp[j], 16)
      }
    } else {
      bytes[bytes.length] = ch 
    }
  }

  return new Uint8Array(bytes)
}

function from_base64(str) {
  return new Uint8Array(base64.toByteArray(str)) 
}

},{"base64-js":40}],45:[function(require,module,exports){

module.exports = function(buffer) {
  return buffer instanceof Uint8Array;
}

},{}],46:[function(require,module,exports){
module.exports = join

function join(targets, hint) {
  if(!targets.length) {
    return new Uint8Array(0)
  }

  var len = hint !== undefined ? hint : get_length(targets)
    , out = new Uint8Array(len)
    , cur = targets[0]
    , curlen = cur.length
    , curidx = 0
    , curoff = 0
    , i = 0

  while(i < len) {
    if(curoff === curlen) {
      curoff = 0
      ++curidx
      cur = targets[curidx]
      curlen = cur && cur.length
      continue
    }
    out[i++] = cur[curoff++] 
  }

  return out
}

function get_length(targets) {
  var size = 0
  for(var i = 0, len = targets.length; i < len; ++i) {
    size += targets[i].byteLength
  }
  return size
}

},{}],47:[function(require,module,exports){
var proto
  , map

module.exports = proto = {}

map = typeof WeakMap === 'undefined' ? null : new WeakMap

proto.get = !map ? no_weakmap_get : get

function no_weakmap_get(target) {
  return new DataView(target.buffer, 0)
}

function get(target) {
  var out = map.get(target.buffer)
  if(!out) {
    map.set(target.buffer, out = new DataView(target.buffer, 0))
  }
  return out
}

},{}],48:[function(require,module,exports){
module.exports = {
    readUInt8:      read_uint8
  , readInt8:       read_int8
  , readUInt16LE:   read_uint16_le
  , readUInt32LE:   read_uint32_le
  , readInt16LE:    read_int16_le
  , readInt32LE:    read_int32_le
  , readFloatLE:    read_float_le
  , readDoubleLE:   read_double_le
  , readUInt16BE:   read_uint16_be
  , readUInt32BE:   read_uint32_be
  , readInt16BE:    read_int16_be
  , readInt32BE:    read_int32_be
  , readFloatBE:    read_float_be
  , readDoubleBE:   read_double_be
}

var map = require('./mapped.js')

function read_uint8(target, at) {
  return target[at]
}

function read_int8(target, at) {
  var v = target[at];
  return v < 0x80 ? v : v - 0x100
}

function read_uint16_le(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, true)
}

function read_uint32_le(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, true)
}

function read_int16_le(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, true)
}

function read_int32_le(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, true)
}

function read_float_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, true)
}

function read_double_le(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, true)
}

function read_uint16_be(target, at) {
  var dv = map.get(target);
  return dv.getUint16(at + target.byteOffset, false)
}

function read_uint32_be(target, at) {
  var dv = map.get(target);
  return dv.getUint32(at + target.byteOffset, false)
}

function read_int16_be(target, at) {
  var dv = map.get(target);
  return dv.getInt16(at + target.byteOffset, false)
}

function read_int32_be(target, at) {
  var dv = map.get(target);
  return dv.getInt32(at + target.byteOffset, false)
}

function read_float_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat32(at + target.byteOffset, false)
}

function read_double_be(target, at) {
  var dv = map.get(target);
  return dv.getFloat64(at + target.byteOffset, false)
}

},{"./mapped.js":47}],49:[function(require,module,exports){
module.exports = subarray

function subarray(buf, from, to) {
  return buf.subarray(from || 0, to || buf.length)
}

},{}],50:[function(require,module,exports){
module.exports = to

var base64 = require('base64-js')
  , toutf8 = require('to-utf8')

var encoders = {
    hex: to_hex
  , utf8: to_utf
  , base64: to_base64
}

function to(buf, encoding) {
  return encoders[encoding || 'utf8'](buf)
}

function to_hex(buf) {
  var str = ''
    , byt

  for(var i = 0, len = buf.length; i < len; ++i) {
    byt = buf[i]
    str += ((byt & 0xF0) >>> 4).toString(16)
    str += (byt & 0x0F).toString(16)
  }

  return str
}

function to_utf(buf) {
  return toutf8(buf)
}

function to_base64(buf) {
  return base64.fromByteArray(buf)
}


},{"base64-js":40,"to-utf8":41}],51:[function(require,module,exports){
module.exports = {
    writeUInt8:      write_uint8
  , writeInt8:       write_int8
  , writeUInt16LE:   write_uint16_le
  , writeUInt32LE:   write_uint32_le
  , writeInt16LE:    write_int16_le
  , writeInt32LE:    write_int32_le
  , writeFloatLE:    write_float_le
  , writeDoubleLE:   write_double_le
  , writeUInt16BE:   write_uint16_be
  , writeUInt32BE:   write_uint32_be
  , writeInt16BE:    write_int16_be
  , writeInt32BE:    write_int32_be
  , writeFloatBE:    write_float_be
  , writeDoubleBE:   write_double_be
}

var map = require('./mapped.js')

function write_uint8(target, value, at) {
  return target[at] = value
}

function write_int8(target, value, at) {
  return target[at] = value < 0 ? value + 0x100 : value
}

function write_uint16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, true)
}

function write_uint32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, true)
}

function write_int16_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, true)
}

function write_int32_le(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, true)
}

function write_float_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, true)
}

function write_double_le(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, true)
}

function write_uint16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint16(at + target.byteOffset, value, false)
}

function write_uint32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setUint32(at + target.byteOffset, value, false)
}

function write_int16_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt16(at + target.byteOffset, value, false)
}

function write_int32_be(target, value, at) {
  var dv = map.get(target);
  return dv.setInt32(at + target.byteOffset, value, false)
}

function write_float_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat32(at + target.byteOffset, value, false)
}

function write_double_be(target, value, at) {
  var dv = map.get(target);
  return dv.setFloat64(at + target.byteOffset, value, false)
}

},{"./mapped.js":47}],52:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],"IZihkv":[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.offset = offset;

    for(var i = 0; i < this.length; i++){
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0)
      end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start)
    end = start;

  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":52,"assert":25,"base64-js":54}],54:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],"l4eWKl":[function(require,module,exports){
var Buffer = require('buffer').Buffer
var sha256 = require('./sha256')
var rng = require('./rng')

var algorithms = {
  sha256: {
    hex: sha256.hex,
    base64: sha256.base64,
    binary: sha256.binary,
    buffer: sha256.buffer
  }
}

var algorithmsHmac = {
  sha256: {
    hex: sha256.hmac_hex,
    base64: sha256.hmac_base64,
    binary: sha256.hmac_binary,
    buffer: sha256.hmac_buffer
  }
}


function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) {
  alg = alg || 'sha1'
  if(!algorithms[alg]) {
    error('algorithm:', alg, 'is not yet supported')
  }
  var s = new Buffer(0);
  var _alg = algorithms[alg];
  return {
    update: function (data, enc) {
      if (! Buffer.isBuffer(data)) {
        enc = enc || 'buffer';
        if (enc === 'buffer' && typeof data === 'string') {
          enc = 'binary';
        }
        data = new Buffer(data, enc);
      }
      s = Buffer.concat([s, data]);
      return this;
    },
    digest: function (enc) {
      enc = enc || 'buffer';
      var fn;
      if(!(fn = _alg[enc])) {
        error('encoding:', enc , 'is not yet supported for algorithm', alg);
      }
      var r = fn(s);
      s = null //not meant to use the hash after you've called digest.
      return r
    }
  }
}

exports.createHmac = function (alg, key) {
  if (!algorithmsHmac[alg]) {
    error('algorithm:', alg, 'is not yet supported')
  }
  var s = new Buffer(0);
  var _alg = algorithmsHmac[alg];

  return {
    update: function (data, enc) {
      if (! Buffer.isBuffer(data)) {
        enc = enc || 'buffer';
        if (enc === 'buffer' && typeof data === 'string') {
          enc = 'binary';
        }
        data = new Buffer(data, enc);
      }
      s = Buffer.concat([s, data]);
      return this;
    },
    digest: function (enc) {
      enc = enc || 'buffer';
      var fn;
      if (!(fn = _alg[enc])) {
        error('encoding:', enc, 'is not yet support for algorithm', alg);
      }
      var r = fn(key, s);
      s = null;
      return r;
    }
  }
}

exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)));
    } catch (err) { callback(err); }
  } else {
    return new Buffer(rng(size));
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./rng":56,"./sha256":57,"buffer":"IZihkv"}],56:[function(require,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function(size) {
      var bytes = new Array(size);
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < size; c++) {
        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())

},{}],57:[function(require,module,exports){
var sjcl = require('sjcl');
var bytes = require('sjcl-codec-bytes');
var Buffer = require('buffer').Buffer;

var bits2hex = sjcl.codec.hex.fromBits;
var bits2base64 = sjcl.codec.base64.fromBits;
var bits2bytes = bytes.fromBits;

var str2bits = sjcl.codec.utf8String.toBits;
var hex2bits = sjcl.codec.hex.toBits;
var b642bits = sjcl.codec.base64.toBits;
var bytes2bits = bytes.toBits;

var Hash = sjcl.hash.sha256;

function bits2str (arr) {
  var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
  for (i=0; i<bl/8; i++) {
    if ((i&3) === 0) {
      tmp = arr[i/4];
    }
    out += String.fromCharCode(tmp >>> 24);
    tmp <<= 8;
  }
  return out;
}


function hmac(key, data) {
  data = bytes2bits(data);
  key = typeof key === 'string' ? str2bits(key) : bytes2bits(key);
  var m = new sjcl.misc.hmac(key, Hash);
  return m.mac(data);
}

function hex(data) {
  data = bytes2bits(data);
  return bits2hex(Hash.hash(data));
}

function base64(data) {
  data = bytes2bits(data);
  return bits2base64(Hash.hash(data));
}

function buffer(data) {
  data = bytes2bits(data);
  return new Buffer(bits2bytes(Hash.hash(data)));
}

function hmac_hex(key, data) {
  return bits2hex(hmac(key, data));
}

function hmac_base64(key, data) {
  return bits2base64(hmac(key, data));
}

function hmac_buffer(key, data) {
  return new Buffer(bits2bytes(hmac(key, data)));
}

function hmac_binary(key, data) {
  data = bytes2bits(data);
  return bits2str(hmac(key, data));
}

function binary(data) {
  data = bytes2bits(data);
  return bits2str(Hash.hash(data));
}

exports.hex = hex;
exports.base64 = base64;
exports.buffer = buffer;
exports.binary = binary;

exports.hmac_hex = hmac_hex;
exports.hmac_base64 = hmac_base64;
exports.hmac_buffer = hmac_buffer;
exports.hmac_binary = hmac_binary;

},{"buffer":"IZihkv","sjcl":79,"sjcl-codec-bytes":78}],58:[function(require,module,exports){
module.exports = require('./lib');
},{"./lib":63}],59:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer,process=require("__browserify_process");//
// a straightforward implementation of HKDF
//
// https://tools.ietf.org/html/rfc5869
//

var crypto = require("crypto");

function zeros(length) {
  var buf = new Buffer(length);

  buf.fill(0);

  return buf.toString();
}
// imk is initial keying material
function HKDF(hashAlg, salt, ikm) {
  this.hashAlg = hashAlg;

  // create the hash alg to see if it exists and get its length
  var hash = crypto.createHash(this.hashAlg);
  this.hashLength = hash.digest().length;

  this.salt = salt || zeros(this.hashLength);
  this.ikm = ikm;

  // now we compute the PRK
  var hmac = crypto.createHmac(this.hashAlg, this.salt);
  hmac.update(this.ikm);
  this.prk = hmac.digest();
}

HKDF.prototype = {
  derive: function(info, size, cb) {
    var prev = new Buffer(0);
    var output;
    var buffers = [];
    var num_blocks = Math.ceil(size / this.hashLength);
    info = new Buffer(info);

    for (var i=0; i<num_blocks; i++) {
      var hmac = crypto.createHmac(this.hashAlg, this.prk);
      // XXX is there a more optimal way to build up buffers?
      var input = Buffer.concat([
        prev,
        info,
        new Buffer(String.fromCharCode(i + 1))
      ]);
      hmac.update(input);
      prev = hmac.digest();
      buffers.push(prev);
    }
    output = Buffer.concat(buffers, size);

    process.nextTick(function() {cb(output);});
  }
};

module.exports = HKDF;

},{"__browserify_Buffer":4,"__browserify_process":76,"crypto":"l4eWKl"}],"request":[function(require,module,exports){
module.exports=require('hWH+d8');
},{}],61:[function(require,module,exports){
// Load modules

var Url = require('url');
var Hoek = require('hoek');
var Cryptiles = require('cryptiles');
var Crypto = require('./crypto');
var Utils = require('./utils');


// Declare internals

var internals = {};


// Generate an Authorization header for a given request

/*
    uri: 'http://example.com/resource?a=b' or object from Url.parse()
    method: HTTP verb (e.g. 'GET', 'POST')
    options: {

        // Required

        credentials: {
            id: 'dh37fgj492je',
            key: 'aoijedoaijsdlaksjdl',
            algorithm: 'sha256'                                 // 'sha1', 'sha256'
        },

        // Optional

        ext: 'application-specific',                        // Application specific data sent via the ext attribute
        timestamp: Date.now(),                              // A pre-calculated timestamp
        nonce: '2334f34f',                                  // A pre-generated nonce
        localtimeOffsetMsec: 400,                           // Time offset to sync with server time (ignored if timestamp provided)
        payload: '{"some":"payload"}',                      // UTF-8 encoded string for body hash generation (ignored if hash provided)
        contentType: 'application/json',                    // Payload content-type (ignored if hash provided)
        hash: 'U4MKKSmiVxk37JCCrAVIjV=',                    // Pre-calculated payload hash
        app: '24s23423f34dx',                               // Oz application id
        dlg: '234sz34tww3sd'                                // Oz delegated-by application id
    }
*/

exports.header = function (uri, method, options) {

    var result = {
        field: '',
        artifacts: {}
    };

    // Validate inputs

    if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') ||
        !method || typeof method !== 'string' ||
        !options || typeof options !== 'object') {

        result.err = 'Invalid argument type';
        return result;
    }

    // Application time

    var timestamp = options.timestamp || Math.floor((Utils.now() + (options.localtimeOffsetMsec || 0)) / 1000)

    // Validate credentials

    var credentials = options.credentials;
    if (!credentials ||
        !credentials.id ||
        !credentials.key ||
        !credentials.algorithm) {

        result.err = 'Invalid credential object';
        return result;
    }

    if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        result.err = 'Unknown algorithm';
        return result;
    }

    // Parse URI

    if (typeof uri === 'string') {
        uri = Url.parse(uri);
    }

    // Calculate signature

    var artifacts = {
        ts: timestamp,
        nonce: options.nonce || Cryptiles.randomString(6),
        method: method,
        resource: uri.pathname + (uri.search || ''),                            // Maintain trailing '?'
        host: uri.hostname,
        port: uri.port || (uri.protocol === 'http:' ? 80 : 443),
        hash: options.hash,
        ext: options.ext,
        app: options.app,
        dlg: options.dlg
    };

    result.artifacts = artifacts;

    // Calculate payload hash

    if (!artifacts.hash &&
        options.hasOwnProperty('payload')) {

        artifacts.hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
    }

    var mac = Crypto.calculateMac('header', credentials, artifacts);

    // Construct header

    var hasExt = artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '';       // Other falsey values allowed
    var header = 'Hawk id="' + credentials.id +
                 '", ts="' + artifacts.ts +
                 '", nonce="' + artifacts.nonce +
                 (artifacts.hash ? '", hash="' + artifacts.hash : '') +
                 (hasExt ? '", ext="' + Utils.escapeHeaderAttribute(artifacts.ext) : '') +
                 '", mac="' + mac + '"';

    if (artifacts.app) {
        header += ', app="' + artifacts.app +
                  (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') + '"';
    }

    result.field = header;

    return result;
};


// Validate server response

/*
    res:        node's response object
    artifacts:  object recieved from header().artifacts
    options: {
        payload:    optional payload received
        required:   specifies if a Server-Authorization header is required. Defaults to 'false'
    }
*/

exports.authenticate = function (res, credentials, artifacts, options) {

    artifacts = Hoek.clone(artifacts);
    options = options || {};

    if (res.headers['www-authenticate']) {

        // Parse HTTP WWW-Authenticate header

        var attributes = Utils.parseAuthorizationHeader(res.headers['www-authenticate'], ['ts', 'tsm', 'error']);
        if (attributes instanceof Error) {
            return false;
        }

        // Validate server timestamp (not used to update clock since it is done via the SNPT client)

        if (attributes.ts) {
            var tsm = Crypto.calculateTsMac(attributes.ts, credentials);
            if (tsm !== attributes.tsm) {
                return false;
            }
        }
    }

    // Parse HTTP Server-Authorization header

    if (!res.headers['server-authorization'] &&
        !options.required) {

        return true;
    }

    var attributes = Utils.parseAuthorizationHeader(res.headers['server-authorization'], ['mac', 'ext', 'hash']);
    if (attributes instanceof Error) {
        return false;
    }

    artifacts.ext = attributes.ext;
    artifacts.hash = attributes.hash;

    var mac = Crypto.calculateMac('response', credentials, artifacts);
    if (mac !== attributes.mac) {
        return false;
    }

    if (!options.hasOwnProperty('payload')) {
        return true;
    }

    if (!attributes.hash) {
        return false;
    }

    var calculatedHash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, res.headers['content-type']);
    return (calculatedHash === attributes.hash);
};


// Generate a bewit value for a given URI

/*
 * credentials is an object with the following keys: 'id, 'key', 'algorithm'.
 * options is an object with the following optional keys: 'ext', 'localtimeOffsetMsec'
 */
/*
    uri: 'http://example.com/resource?a=b' or object from Url.parse()
    options: {

        // Required

        credentials: {
            id: 'dh37fgj492je',
            key: 'aoijedoaijsdlaksjdl',
            algorithm: 'sha256'                             // 'sha1', 'sha256'
        },
        ttlSec: 60 * 60,                                    // TTL in seconds

        // Optional

        ext: 'application-specific',                        // Application specific data sent via the ext attribute
        localtimeOffsetMsec: 400                            // Time offset to sync with server time
    };
*/

exports.getBewit = function (uri, options) {

    // Validate inputs

    if (!uri ||
        (typeof uri !== 'string' && typeof uri !== 'object') ||
        !options ||
        typeof options !== 'object' ||
        !options.ttlSec) {

        return '';
    }

    options.ext = (options.ext === null || options.ext === undefined ? '' : options.ext);       // Zero is valid value

    // Application time

    var now = Utils.now() + (options.localtimeOffsetMsec || 0);

    // Validate credentials

    var credentials = options.credentials;
    if (!credentials ||
        !credentials.id ||
        !credentials.key ||
        !credentials.algorithm) {

        return '';
    }

    if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return '';
    }

    // Parse URI

    if (typeof uri === 'string') {
        uri = Url.parse(uri);
    }

    // Calculate signature

    var exp = Math.floor(now / 1000) + options.ttlSec;
    var mac = Crypto.calculateMac('bewit', credentials, {
        ts: exp,
        nonce: '',
        method: 'GET',
        resource: uri.pathname + (uri.search || ''),                            // Maintain trailing '?'
        host: uri.hostname,
        port: uri.port || (uri.protocol === 'http:' ? 80 : 443),
        ext: options.ext
    });

    // Construct bewit: id\exp\mac\ext

    var bewit = credentials.id + '\\' + exp + '\\' + mac + '\\' + options.ext;
    return Utils.base64urlEncode(bewit);
};


// Generate an authorization string for a message

/*
    host: 'example.com',
    port: 8000,
    message: '{"some":"payload"}',                          // UTF-8 encoded string for body hash generation
    options: {

        // Required

        credentials: {
            id: 'dh37fgj492je',
            key: 'aoijedoaijsdlaksjdl',
            algorithm: 'sha256'                             // 'sha1', 'sha256'
        },

        // Optional

        timestamp: Date.now(),                              // A pre-calculated timestamp
        nonce: '2334f34f',                                  // A pre-generated nonce
        localtimeOffsetMsec: 400,                           // Time offset to sync with server time (ignored if timestamp provided)
    }
*/

exports.message = function (host, port, message, options) {

    // Validate inputs

    if (!host || typeof host !== 'string' ||
        !port || typeof port !== 'number' ||
        message === null || message === undefined || typeof message !== 'string' ||
        !options || typeof options !== 'object') {

        return null;
    }

    // Application time

    var timestamp = options.timestamp || Math.floor((Utils.now() + (options.localtimeOffsetMsec || 0)) / 1000)

    // Validate credentials

    var credentials = options.credentials;
    if (!credentials ||
        !credentials.id ||
        !credentials.key ||
        !credentials.algorithm) {

        // Invalid credential object
        return null;
    }

    if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return null;
    }

    // Calculate signature

    var artifacts = {
        ts: timestamp,
        nonce: options.nonce || Cryptiles.randomString(6),
        host: host,
        port: port,
        hash: Crypto.calculatePayloadHash(message, credentials.algorithm)
    };

    // Construct authorization

    var result = {
        id: credentials.id,
        ts: artifacts.ts,
        nonce: artifacts.nonce,
        hash: artifacts.hash,
        mac: Crypto.calculateMac('message', credentials, artifacts)
    };

    return result;
};




},{"./crypto":62,"./utils":65,"cryptiles":68,"hoek":70,"url":32}],62:[function(require,module,exports){
// Load modules

var Crypto = require('crypto');
var Url = require('url');
var Utils = require('./utils');


// Declare internals

var internals = {};


// MAC normalization format version

exports.headerVersion = '1';                        // Prevent comparison of mac values generated with different normalized string formats


// Supported HMAC algorithms

exports.algorithms = ['sha1', 'sha256'];


// Calculate the request MAC

/*
    type: 'header',                                 // 'header', 'bewit', 'response'
    credentials: {
        key: 'aoijedoaijsdlaksjdl',
        algorithm: 'sha256'                         // 'sha1', 'sha256'
    },
    options: {
        method: 'GET',
        resource: '/resource?a=1&b=2',
        host: 'example.com',
        port: 8080,
        ts: 1357718381034,
        nonce: 'd3d345f',
        hash: 'U4MKKSmiVxk37JCCrAVIjV/OhB3y+NdwoCr6RShbVkE=',
        ext: 'app-specific-data',
        app: 'hf48hd83qwkj',                        // Application id (Oz)
        dlg: 'd8djwekds9cj'                         // Delegated by application id (Oz), requires options.app
    }
*/

exports.calculateMac = function (type, credentials, options) {

    var normalized = exports.generateNormalizedString(type, options);

    var hmac = Crypto.createHmac(credentials.algorithm, credentials.key).update(normalized);
    var digest = hmac.digest('base64');
    return digest;
};


exports.generateNormalizedString = function (type, options) {

    var normalized = 'hawk.' + exports.headerVersion + '.' + type + '\n' +
                     options.ts + '\n' +
                     options.nonce + '\n' +
                     (options.method || '').toUpperCase() + '\n' +
                     (options.resource || '') + '\n' +
                     options.host.toLowerCase() + '\n' +
                     options.port + '\n' +
                     (options.hash || '') + '\n';

    if (options.ext) {
        normalized += options.ext.replace('\\', '\\\\').replace('\n', '\\n');
    }

    normalized += '\n';

    if (options.app) {
        normalized += options.app + '\n' +
                      (options.dlg || '') + '\n';
    }

    return normalized;
};


exports.calculatePayloadHash = function (payload, algorithm, contentType) {

    var hash = exports.initializePayloadHash(algorithm, contentType);
    hash.update(payload || '');
    return exports.finalizePayloadHash(hash);
};


exports.initializePayloadHash = function (algorithm, contentType) {

    var hash = Crypto.createHash(algorithm);
    hash.update('hawk.' + exports.headerVersion + '.payload\n');
    hash.update(Utils.parseContentType(contentType) + '\n');
    return hash;
};


exports.finalizePayloadHash = function (hash) {

    hash.update('\n');
    return hash.digest('base64');
};


exports.calculateTsMac = function (ts, credentials) {

    var hmac = Crypto.createHmac(credentials.algorithm, credentials.key);
    hmac.update('hawk.' + exports.headerVersion + '.ts\n' + ts + '\n');
    return hmac.digest('base64');
};


exports.timestampMessage = function (credentials, localtimeOffsetMsec) {

    var now = Math.floor((Utils.now() + (localtimeOffsetMsec || 0)) / 1000);
    var tsm = exports.calculateTsMac(now, credentials);
    return { ts: now, tsm: tsm };
};

},{"./utils":65,"crypto":"l4eWKl","url":32}],63:[function(require,module,exports){
// Export sub-modules

exports.error = exports.Error = require('boom');
exports.sntp = require('sntp');

exports.server = require('./server');
exports.client = require('./client');
exports.crypto = require('./crypto');
exports.utils = require('./utils');

exports.uri = {
    authenticate: exports.server.authenticateBewit,
    getBewit: exports.client.getBewit
};


},{"./client":61,"./crypto":62,"./server":64,"./utils":65,"boom":66,"sntp":73}],64:[function(require,module,exports){
// Load modules

var Boom = require('boom');
var Hoek = require('hoek');
var Cryptiles = require('cryptiles');
var Crypto = require('./crypto');
var Utils = require('./utils');


// Declare internals

var internals = {};


// Hawk authentication

/*
   req:                 node's HTTP request object or an object as follows:
  
                        var request = {
                            method: 'GET',
                            url: '/resource/4?a=1&b=2',
                            host: 'example.com',
                            port: 8080,
                            authorization: 'Hawk id="dh37fgj492je", ts="1353832234", nonce="j4h3g2", ext="some-app-ext-data", mac="6R4rV5iE+NPoym+WwjeHzjAGXUtLNIxmo1vpMofpLAE="'
                        };
  
   credentialsFunc:     required function to lookup the set of Hawk credentials based on the provided credentials id.
                        The credentials include the MAC key, MAC algorithm, and other attributes (such as username)
                        needed by the application. This function is the equivalent of verifying the username and
                        password in Basic authentication.
  
                        var credentialsFunc = function (id, callback) {
    
                            // Lookup credentials in database
                            db.lookup(id, function (err, item) {
    
                                if (err || !item) {
                                    return callback(err);
                                }
    
                                var credentials = {
                                    // Required
                                    key: item.key,
                                    algorithm: item.algorithm,
                                    // Application specific
                                    user: item.user
                                };
    
                                return callback(null, credentials);
                            });
                        };
  
   options: {

        hostHeaderName:        optional header field name, used to override the default 'Host' header when used
                               behind a cache of a proxy. Apache2 changes the value of the 'Host' header while preserving
                               the original (which is what the module must verify) in the 'x-forwarded-host' header field.
                               Only used when passed a node Http.ServerRequest object.
  
        nonceFunc:             optional nonce validation function. The function signature is function(nonce, ts, callback)
                               where 'callback' must be called using the signature function(err).
  
        timestampSkewSec:      optional number of seconds of permitted clock skew for incoming timestamps. Defaults to 60 seconds.
                               Provides a +/- skew which means actual allowed window is double the number of seconds.
  
        localtimeOffsetMsec:   optional local clock time offset express in a number of milliseconds (positive or negative).
                               Defaults to 0.
  
        payload:               optional payload for validation. The client calculates the hash value and includes it via the 'hash'
                               header attribute. The server always ensures the value provided has been included in the request
                               MAC. When this option is provided, it validates the hash value itself. Validation is done by calculating
                               a hash value over the entire payload (assuming it has already be normalized to the same format and
                               encoding used by the client to calculate the hash on request). If the payload is not available at the time
                               of authentication, the authenticatePayload() method can be used by passing it the credentials and
                               attributes.hash returned in the authenticate callback.

        host:                  optional host name override. Only used when passed a node request object.
        port:                  optional port override. Only used when passed a node request object.
    }

    callback: function (err, credentials, artifacts) { }
 */

exports.authenticate = function (req, credentialsFunc, options, callback) {

    callback = Utils.nextTick(callback);
    
    // Default options

    options.nonceFunc = options.nonceFunc || function (nonce, ts, nonceCallback) { return nonceCallback(); };   // No validation
    options.timestampSkewSec = options.timestampSkewSec || 60;                                                  // 60 seconds

    // Application time

    var now = Utils.now() + (options.localtimeOffsetMsec || 0);                 // Measure now before any other processing

    // Convert node Http request object to a request configuration object

    var request = Utils.parseRequest(req, options);
    if (request instanceof Error) {
        return callback(Boom.badRequest(request.message));
    }

    // Parse HTTP Authorization header

    var attributes = Utils.parseAuthorizationHeader(request.authorization);
    if (attributes instanceof Error) {
        return callback(attributes);
    }

    // Construct artifacts container

    var artifacts = {
        method: request.method,
        host: request.host,
        port: request.port,
        resource: request.url,
        ts: attributes.ts,
        nonce: attributes.nonce,
        hash: attributes.hash,
        ext: attributes.ext,
        app: attributes.app,
        dlg: attributes.dlg,
        mac: attributes.mac,
        id: attributes.id
    };

    // Verify required header attributes

    if (!attributes.id ||
        !attributes.ts ||
        !attributes.nonce ||
        !attributes.mac) {

        return callback(Boom.badRequest('Missing attributes'), null, artifacts);
    }

    // Fetch Hawk credentials

    credentialsFunc(attributes.id, function (err, credentials) {

        if (err) {
            return callback(err, credentials || null, artifacts);
        }

        if (!credentials) {
            return callback(Boom.unauthorized('Unknown credentials', 'Hawk'), null, artifacts);
        }

        if (!credentials.key ||
            !credentials.algorithm) {

            return callback(Boom.internal('Invalid credentials'), credentials, artifacts);
        }

        if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            return callback(Boom.internal('Unknown algorithm'), credentials, artifacts);
        }

        // Calculate MAC

        var mac = Crypto.calculateMac('header', credentials, artifacts);
        if (!Cryptiles.fixedTimeComparison(mac, attributes.mac)) {
            return callback(Boom.unauthorized('Bad mac', 'Hawk'), credentials, artifacts);
        }

        // Check payload hash

        if (options.payload !== null &&
            options.payload !== undefined) {       // '' is valid

            if (!attributes.hash) {
                return callback(Boom.unauthorized('Missing required payload hash', 'Hawk'), credentials, artifacts);
            }

            var hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, request.contentType);
            if (!Cryptiles.fixedTimeComparison(hash, attributes.hash)) {
                return callback(Boom.unauthorized('Bad payload hash', 'Hawk'), credentials, artifacts);
            }
        }

        // Check nonce

        options.nonceFunc(attributes.nonce, attributes.ts, function (err) {

            if (err) {
                return callback(Boom.unauthorized('Invalid nonce', 'Hawk'), credentials, artifacts);
            }

            // Check timestamp staleness

            if (Math.abs((attributes.ts * 1000) - now) > (options.timestampSkewSec * 1000)) {
                var tsm = Crypto.timestampMessage(credentials, options.localtimeOffsetMsec);
                return callback(Boom.unauthorized('Stale timestamp', 'Hawk', tsm), credentials, artifacts);
            }

            // Successful authentication

            return callback(null, credentials, artifacts);
        });
    });
};


// Authenticate payload hash - used when payload cannot be provided during authenticate()

/*
    payload:        raw request payload
    credentials:    from authenticate callback
    artifacts:      from authenticate callback
    contentType:    req.headers['content-type']
*/

exports.authenticatePayload = function (payload, credentials, artifacts, contentType) {

    var calculatedHash = Crypto.calculatePayloadHash(payload, credentials.algorithm, contentType);
    return Cryptiles.fixedTimeComparison(calculatedHash, artifacts.hash);
};


// Generate a Server-Authorization header for a given response

/*
    credentials: {},                                        // Object received from authenticate()
    artifacts: {}                                           // Object received from authenticate(); 'mac', 'hash', and 'ext' - ignored
    options: {
        ext: 'application-specific',                        // Application specific data sent via the ext attribute
        payload: '{"some":"payload"}',                      // UTF-8 encoded string for body hash generation (ignored if hash provided)
        contentType: 'application/json',                    // Payload content-type (ignored if hash provided)
        hash: 'U4MKKSmiVxk37JCCrAVIjV='                     // Pre-calculated payload hash
    }
*/

exports.header = function (credentials, artifacts, options) {

    // Prepare inputs

    options = options || {};

    if (!artifacts ||
        typeof artifacts !== 'object' ||
        typeof options !== 'object') {

        return '';
    }

    artifacts = Hoek.clone(artifacts);
    delete artifacts.mac;
    artifacts.hash = options.hash;
    artifacts.ext = options.ext;

    // Validate credentials

    if (!credentials ||
        !credentials.key ||
        !credentials.algorithm) {

        // Invalid credential object
        return '';
    }

    if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return '';
    }

    // Calculate payload hash

    if (!artifacts.hash &&
        options.hasOwnProperty('payload')) {

        artifacts.hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
    }

    var mac = Crypto.calculateMac('response', credentials, artifacts);

    // Construct header

    var header = 'Hawk mac="' + mac + '"' +
                 (artifacts.hash ? ', hash="' + artifacts.hash + '"' : '');

    if (artifacts.ext !== null &&
        artifacts.ext !== undefined &&
        artifacts.ext !== '') {                       // Other falsey values allowed

        header += ', ext="' + Utils.escapeHeaderAttribute(artifacts.ext) + '"';
    }

    return header;
};


/*
 * Arguments and options are the same as authenticate() with the exception that the only supported options are:
 * 'hostHeaderName', 'localtimeOffsetMsec', 'host', 'port'
 */

exports.authenticateBewit = function (req, credentialsFunc, options, callback) {

    callback = Utils.nextTick(callback);

    // Application time

    var now = Utils.now() + (options.localtimeOffsetMsec || 0);

    // Convert node Http request object to a request configuration object

    var request = Utils.parseRequest(req, options);
    if (request instanceof Error) {
        return callback(Boom.badRequest(request.message));
    }

    // Extract bewit

    //                                 1     2             3           4     
    var resource = request.url.match(/^(\/.*)([\?&])bewit\=([^&$]*)(?:&(.+))?$/);
    if (!resource) {
        return callback(Boom.unauthorized(null, 'Hawk'));
    }

    // Bewit not empty

    if (!resource[3]) {
        return callback(Boom.unauthorized('Empty bewit', 'Hawk'));
    }

    // Verify method is GET

    if (request.method !== 'GET' &&
        request.method !== 'HEAD') {

        return callback(Boom.unauthorized('Invalid method', 'Hawk'));
    }

    // No other authentication

    if (request.authorization) {
        return callback(Boom.badRequest('Multiple authentications', 'Hawk'));
    }

    // Parse bewit

    var bewitString = Utils.base64urlDecode(resource[3]);
    if (bewitString instanceof Error) {
        return callback(Boom.badRequest('Invalid bewit encoding'));
    }

    // Bewit format: id\exp\mac\ext ('\' is used because it is a reserved header attribute character)

    var bewitParts = bewitString.split('\\');
    if (!bewitParts ||
        bewitParts.length !== 4) {

        return callback(Boom.badRequest('Invalid bewit structure'));
    }

    var bewit = {
        id: bewitParts[0],
        exp: parseInt(bewitParts[1], 10),
        mac: bewitParts[2],
        ext: bewitParts[3] || ''
    };

    if (!bewit.id ||
        !bewit.exp ||
        !bewit.mac) {

        return callback(Boom.badRequest('Missing bewit attributes'));
    }

    // Construct URL without bewit

    var url = resource[1];
    if (resource[4]) {
        url += resource[2] + resource[4];
    }

    // Check expiration

    if (bewit.exp * 1000 <= now) {
        return callback(Boom.unauthorized('Access expired', 'Hawk'), null, bewit);
    }

    // Fetch Hawk credentials

    credentialsFunc(bewit.id, function (err, credentials) {

        if (err) {
            return callback(err, credentials || null, bewit.ext);
        }

        if (!credentials) {
            return callback(Boom.unauthorized('Unknown credentials', 'Hawk'), null, bewit);
        }

        if (!credentials.key ||
            !credentials.algorithm) {

            return callback(Boom.internal('Invalid credentials'), credentials, bewit);
        }

        if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            return callback(Boom.internal('Unknown algorithm'), credentials, bewit);
        }

        // Calculate MAC

        var mac = Crypto.calculateMac('bewit', credentials, {
            ts: bewit.exp,
            nonce: '',
            method: 'GET',
            resource: url,
            host: request.host,
            port: request.port,
            ext: bewit.ext
        });

        if (!Cryptiles.fixedTimeComparison(mac, bewit.mac)) {
            return callback(Boom.unauthorized('Bad mac', 'Hawk'), credentials, bewit);
        }

        // Successful authentication

        return callback(null, credentials, bewit);
    });
};


/*
 *  options are the same as authenticate() with the exception that the only supported options are:
 * 'nonceFunc', 'timestampSkewSec', 'localtimeOffsetMsec'
 */

exports.authenticateMessage = function (host, port, message, authorization, credentialsFunc, options, callback) {

    callback = Utils.nextTick(callback);
    
    // Default options

    options.nonceFunc = options.nonceFunc || function (nonce, ts, nonceCallback) { return nonceCallback(); };   // No validation
    options.timestampSkewSec = options.timestampSkewSec || 60;                                                  // 60 seconds

    // Application time

    var now = Utils.now() + (options.localtimeOffsetMsec || 0);                 // Measure now before any other processing

    // Validate authorization
    
    if (!authorization.id ||
        !authorization.ts ||
        !authorization.nonce ||
        !authorization.hash ||
        !authorization.mac) {
        
            return callback(Boom.badRequest('Invalid authorization'))
    }

    // Fetch Hawk credentials

    credentialsFunc(authorization.id, function (err, credentials) {

        if (err) {
            return callback(err, credentials || null);
        }

        if (!credentials) {
            return callback(Boom.unauthorized('Unknown credentials', 'Hawk'));
        }

        if (!credentials.key ||
            !credentials.algorithm) {

            return callback(Boom.internal('Invalid credentials'), credentials);
        }

        if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
            return callback(Boom.internal('Unknown algorithm'), credentials);
        }

        // Construct artifacts container

        var artifacts = {
            ts: authorization.ts,
            nonce: authorization.nonce,
            host: host,
            port: port,
            hash: authorization.hash
        };

        // Calculate MAC

        var mac = Crypto.calculateMac('message', credentials, artifacts);
        if (!Cryptiles.fixedTimeComparison(mac, authorization.mac)) {
            return callback(Boom.unauthorized('Bad mac', 'Hawk'), credentials);
        }

        // Check payload hash

        var hash = Crypto.calculatePayloadHash(message, credentials.algorithm);
        if (!Cryptiles.fixedTimeComparison(hash, authorization.hash)) {
            return callback(Boom.unauthorized('Bad message hash', 'Hawk'), credentials);
        }

        // Check nonce

        options.nonceFunc(authorization.nonce, authorization.ts, function (err) {

            if (err) {
                return callback(Boom.unauthorized('Invalid nonce', 'Hawk'), credentials);
            }

            // Check timestamp staleness

            if (Math.abs((authorization.ts * 1000) - now) > (options.timestampSkewSec * 1000)) {
                return callback(Boom.unauthorized('Stale timestamp'), credentials);
            }

            // Successful authentication

            return callback(null, credentials);
        });
    });
};

},{"./crypto":62,"./utils":65,"boom":66,"cryptiles":68,"hoek":70}],65:[function(require,module,exports){
var __dirname="/node_modules/hawk/lib";// Load modules

var Hoek = require('hoek');
var Sntp = require('sntp');
var Boom = require('boom');


// Declare internals

var internals = {};


// Import Hoek Utilities

internals.import = function () {

    for (var i in Hoek) {
        if (Hoek.hasOwnProperty(i)) {
            exports[i] = Hoek[i];
        }
    }
};

internals.import();


// Hawk version

exports.version = function () {

    return exports.loadPackage(__dirname + '/..').version;
};


// Extract host and port from request

exports.parseHost = function (req, hostHeaderName) {

    hostHeaderName = (hostHeaderName ? hostHeaderName.toLowerCase() : 'host');
    var hostHeader = req.headers[hostHeaderName];
    if (!hostHeader) {
        return null;
    }

    var hostHeaderRegex;
    if (hostHeader[0] === '[') {
        hostHeaderRegex = /^(?:(?:\r\n)?\s)*(\[[^\]]+\])(?::(\d+))?(?:(?:\r\n)?\s)*$/;      // IPv6
    }
    else {
        hostHeaderRegex = /^(?:(?:\r\n)?\s)*([^:]+)(?::(\d+))?(?:(?:\r\n)?\s)*$/;           // IPv4, hostname
    }
    
    var hostParts = hostHeader.match(hostHeaderRegex);

    if (!hostParts ||
        hostParts.length !== 3 ||
        !hostParts[1]) {

        return null;
    }

    return {
        name: hostParts[1],
        port: (hostParts[2] ? hostParts[2] : (req.connection && req.connection.encrypted ? 443 : 80))
    };
};


// Parse Content-Type header content

exports.parseContentType = function (header) {

    if (!header) {
        return '';
    }

    return header.split(';')[0].trim().toLowerCase();
};


// Convert node's  to request configuration object

exports.parseRequest = function (req, options) {

    if (!req.headers) {
        return req;
    }
    
    // Obtain host and port information

    if (!options.host || !options.port) {
        var host = exports.parseHost(req, options.hostHeaderName);
        if (!host) {
            return new Error('Invalid Host header');
        }
    }

    var request = {
        method: req.method,
        url: req.url,
        host: options.host || host.name,
        port: options.port || host.port,
        authorization: req.headers.authorization,
        contentType: req.headers['content-type'] || ''
    };

    return request;
};


exports.now = function () {

    return Sntp.now();
};


// Parse Hawk HTTP Authorization header

exports.parseAuthorizationHeader = function (header, keys) {

    keys = keys || ['id', 'ts', 'nonce', 'hash', 'ext', 'mac', 'app', 'dlg'];

    if (!header) {
        return Boom.unauthorized(null, 'Hawk');
    }

    var headerParts = header.match(/^(\w+)(?:\s+(.*))?$/);       // Header: scheme[ something]
    if (!headerParts) {
        return Boom.badRequest('Invalid header syntax');
    }

    var scheme = headerParts[1];
    if (scheme.toLowerCase() !== 'hawk') {
        return Boom.unauthorized(null, 'Hawk');
    }

    var attributesString = headerParts[2];
    if (!attributesString) {
        return Boom.badRequest('Invalid header syntax');
    }

    var attributes = {};
    var errorMessage = '';
    var verify = attributesString.replace(/(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g, function ($0, $1, $2) {

        // Check valid attribute names

        if (keys.indexOf($1) === -1) {
            errorMessage = 'Unknown attribute: ' + $1;
            return;
        }

        // Allowed attribute value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9

        if ($2.match(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~]+$/) === null) {
            errorMessage = 'Bad attribute value: ' + $1;
            return;
        }

        // Check for duplicates

        if (attributes.hasOwnProperty($1)) {
            errorMessage = 'Duplicate attribute: ' + $1;
            return;
        }

        attributes[$1] = $2;
        return '';
    });

    if (verify !== '') {
        return Boom.badRequest(errorMessage || 'Bad header format');
    }

    return attributes;
};


exports.unauthorized = function (message) {

    return Boom.unauthorized(message, 'Hawk');
};


},{"boom":66,"hoek":70,"sntp":73}],66:[function(require,module,exports){
module.exports = require('./lib');
},{"./lib":67}],67:[function(require,module,exports){
// Load modules

var Http = require('http');
var NodeUtil = require('util');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports = module.exports = internals.Boom = function (/* (new Error) or (code, message) */) {

    Hoek.assert(this instanceof internals.Boom, 'Error must be instantiated using new');

    Error.call(this);
    this.isBoom = true;

    this.response = {
        code: 0,
        payload: {},
        headers: {}
        // type: 'content-type'
    };

    if (arguments[0] instanceof Error) {

        // Error

        var error = arguments[0];

        this.data = error;
        this.response.code = error.code || 500;
        if (error.message) {
            this.message = error.message;
        }
    }
    else {
        // code, message

        var code = arguments[0];
        var message = arguments[1];

        Hoek.assert(!isNaN(parseFloat(code)) && isFinite(code) && code >= 400, 'First argument must be a number (400+)');

        this.response.code = code;
        if (message) {
            this.message = message;
        }
    }

    // Response format

    this.reformat();

    return this;
};

NodeUtil.inherits(internals.Boom, Error);


internals.Boom.prototype.reformat = function () {

    this.response.payload.code = this.response.code;
    this.response.payload.error = Http.STATUS_CODES[this.response.code] || 'Unknown';
    if (this.message) {
        this.response.payload.message = Hoek.escapeHtml(this.message);         // Prevent XSS from error message
    }
};


// Return custom keys added to the error root or response.payload

internals.Boom.prototype.decorations = function () {

    var decoration = {};

    var rootKeys = Object.keys(this);
    for (var i = 0, il = rootKeys.length; i < il; ++i) {
        var key = rootKeys[i];
        if (typeof this[key] !== 'function' &&
            key[0] !== '_' &&
            ['isBoom', 'response', 'message'].indexOf(key) === -1) {

            decoration[key] = this[key];
        }
    }

    var responseKeys = Object.keys(this.response.payload);
    for (i = 0, il = responseKeys.length; i < il; ++i) {
        var key = responseKeys[i];
        if (['code', 'error', 'message'].indexOf(key) === -1) {

            decoration.response = decoration.response || {};
            decoration.response[key] = this.response.payload[key];
        }
    }

    return decoration;
};


// 4xx Client Errors

internals.Boom.badRequest = function (message) {

    return new internals.Boom(400, message);
};


internals.Boom.unauthorized = function (message, scheme, attributes) {          // Or function (message, wwwAuthenticate[])

    var err = new internals.Boom(401, message);

    if (!scheme) {
        return err;
    }

    var wwwAuthenticate = '';
    var i = 0;
    var il = 0;

    if (typeof scheme === 'string') {

        // function (message, scheme, attributes)

        wwwAuthenticate = scheme;
        if (attributes) {
            var names = Object.keys(attributes);
            for (i = 0, il = names.length; i < il; ++i) {
                if (i) {
                    wwwAuthenticate += ',';
                }

                var value = attributes[names[i]];
                if (value === null ||
                    value === undefined) {              // Value can be zero

                    value = '';
                }
                wwwAuthenticate += ' ' + names[i] + '="' + Hoek.escapeHeaderAttribute(value.toString()) + '"';
            }
        }

        if (message) {
            if (attributes) {
                wwwAuthenticate += ',';
            }
            wwwAuthenticate += ' error="' + Hoek.escapeHeaderAttribute(message) + '"';
        }
        else {
            err.isMissing = true;
        }
    }
    else {

        // function (message, wwwAuthenticate[])

        var wwwArray = scheme;
        for (i = 0, il = wwwArray.length; i < il; ++i) {
            if (i) {
                wwwAuthenticate += ', ';
            }

            wwwAuthenticate += wwwArray[i];
        }
    }

    err.response.headers['WWW-Authenticate'] = wwwAuthenticate;

    return err;
};


internals.Boom.forbidden = function (message) {

    return new internals.Boom(403, message);
};


internals.Boom.notFound = function (message) {

    return new internals.Boom(404, message);
};


internals.Boom.methodNotAllowed = function (message) {

    return new internals.Boom(405, message);
};


internals.Boom.notAcceptable = function (message) {

    return new internals.Boom(406, message);
};


internals.Boom.proxyAuthRequired = function (message) {

    return new internals.Boom(407, message);
};


internals.Boom.clientTimeout = function (message) {

    return new internals.Boom(408, message);
};


internals.Boom.conflict = function (message) {

    return new internals.Boom(409, message);
};


internals.Boom.resourceGone = function (message) {

    return new internals.Boom(410, message);
};


internals.Boom.lengthRequired = function (message) {

    return new internals.Boom(411, message);
};


internals.Boom.preconditionFailed = function (message) {

    return new internals.Boom(412, message);
};


internals.Boom.entityTooLarge = function (message) {

    return new internals.Boom(413, message);
};


internals.Boom.uriTooLong = function (message) {

    return new internals.Boom(414, message);
};


internals.Boom.unsupportedMediaType = function (message) {

    return new internals.Boom(415, message);
};


internals.Boom.rangeNotSatisfiable = function (message) {

    return new internals.Boom(416, message);
};


internals.Boom.expectationFailed = function (message) {

    return new internals.Boom(417, message);
};


// 5xx Server Errors

internals.Boom.internal = function (message, data) {

    var err = new internals.Boom(500, message);

    if (data && data.stack) {
        err.trace = data.stack.split('\n');
        err.outterTrace = Hoek.displayStack(1);
    }
    else {
        err.trace = Hoek.displayStack(1);
    }

    err.data = data;
    err.response.payload.message = 'An internal server error occurred';                     // Hide actual error from user

    return err;
};


internals.Boom.notImplemented = function (message) {

    return new internals.Boom(501, message);
};


internals.Boom.badGateway = function (message) {

    return new internals.Boom(502, message);
};


internals.Boom.serverTimeout = function (message) {

    return new internals.Boom(503, message);
};


internals.Boom.gatewayTimeout = function (message) {

    return new internals.Boom(504, message);
};


internals.Boom.passThrough = function (code, payload, contentType, headers) {

    var err = new internals.Boom(500, 'Pass-through');                                      // 500 code is only used to initialize

    err.data = {
        code: code,
        payload: payload,
        type: contentType
    };

    err.response.code = code;
    err.response.type = contentType;
    err.response.headers = headers;
    err.response.payload = payload;

    return err;
};



},{"hoek":70,"http":34,"util":33}],68:[function(require,module,exports){
module.exports = require('./lib');
},{"./lib":69}],69:[function(require,module,exports){
// Load modules

var Crypto = require('crypto');
var Boom = require('boom');


// Declare internals

var internals = {};


// Generate a cryptographically strong pseudo-random data

exports.randomString = function (size) {

    var buffer = exports.randomBits((size + 1) * 6);
    if (buffer instanceof Error) {
        return buffer;
    }

    var string = buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    return string.slice(0, size);
};


exports.randomBits = function (bits) {

    if (!bits ||
        bits < 0) {

        return Boom.internal('Invalid random bits count');
    }

    var bytes = Math.ceil(bits / 8);
    try {
        return Crypto.randomBytes(bytes);
    }
    catch (err) {
        return Boom.internal('Failed generating random bits: ' + err.message);
    }
};


// Compare two strings using fixed time algorithm (to prevent time-based analysis of MAC digest match)

exports.fixedTimeComparison = function (a, b) {

    if (typeof a !== 'string' ||
        typeof b !== 'string') {

        return false;
    }

    var mismatch = (a.length === b.length ? 0 : 1);
    if (mismatch) {
        b = a;
    }

    for (var i = 0, il = a.length; i < il; ++i) {
        var ac = a.charCodeAt(i);
        var bc = b.charCodeAt(i);
        mismatch |= (ac ^ bc);
    }

    return (mismatch === 0);
};



},{"boom":66,"crypto":"l4eWKl"}],70:[function(require,module,exports){
module.exports = require('./lib');
},{"./lib":72}],71:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;// Declare internals

var internals = {};


exports.escapeJavaScript = function (input) {

    if (!input) {
        return '';
    }

    var escaped = '';

    for (var i = 0, il = input.length; i < il; ++i) {

        var charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeJavaScriptChar(charCode);
        }
    }

    return escaped;
};


exports.escapeHtml = function (input) {

    if (!input) {
        return '';
    }

    var escaped = '';

    for (var i = 0, il = input.length; i < il; ++i) {

        var charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeHtmlChar(charCode);
        }
    }

    return escaped;
};


internals.escapeJavaScriptChar = function (charCode) {

    if (charCode >= 256) {
        return '\\u' + internals.padLeft('' + charCode, 4);
    }

    var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '\\x' + internals.padLeft(hexValue, 2);
};


internals.escapeHtmlChar = function (charCode) {

    var namedEscape = internals.namedHtml[charCode];
    if (typeof namedEscape !== 'undefined') {
        return namedEscape;
    }

    if (charCode >= 256) {
        return '&#' + charCode + ';';
    }

    var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '&#x' + internals.padLeft(hexValue, 2) + ';';
};


internals.padLeft = function (str, len) {

    while (str.length < len) {
        str = '0' + str;
    }

    return str;
};


internals.isSafe = function (charCode) {

    return (typeof internals.safeCharCodes[charCode] !== 'undefined');
};


internals.namedHtml = {
    '38': '&amp;',
    '60': '&lt;',
    '62': '&gt;',
    '34': '&quot;',
    '160': '&nbsp;',
    '162': '&cent;',
    '163': '&pound;',
    '164': '&curren;',
    '169': '&copy;',
    '174': '&reg;'
};


internals.safeCharCodes = (function () {

    var safe = {};

    for (var i = 32; i < 123; ++i) {

        if ((i >= 97 && i <= 122) ||         // a-z
            (i >= 65 && i <= 90) ||          // A-Z
            (i >= 48 && i <= 57) ||          // 0-9
            i === 32 ||                      // space
            i === 46 ||                      // .
            i === 44 ||                      // ,
            i === 45 ||                      // -
            i === 58 ||                      // :
            i === 95) {                      // _

            safe[i] = null;
        }
    }

    return safe;
}());
},{"__browserify_Buffer":4}],72:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer,process=require("__browserify_process");// Load modules

var Fs = require('fs');
var Path = require('path');
var Escape = require('./escape');


// Declare internals

var internals = {};


// Clone object or array

exports.clone = function (obj, seen) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    seen = seen || { orig: [], copy: [] };

    var lookup = seen.orig.indexOf(obj);
    if (lookup !== -1) {
        return seen.copy[lookup];
    }

    if (obj instanceof Buffer) {
        return new Buffer(obj);
    }
    else if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    else if (obj instanceof RegExp) {
        var flags = '' + (obj.global ? 'g' : '') + (obj.ignoreCase ? 'i' : '') + (obj.multiline ? 'm' : '');
        return new RegExp(obj.source, flags);
    }

    var create = function (obj) {

        var o = {};
        o.__proto__ = Object.getPrototypeOf(obj);
        return o;
    };

    var newObj = (obj instanceof Array ? [] : create(obj));

    seen.orig.push(obj);
    seen.copy.push(newObj);

    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            newObj[i] = exports.clone(obj[i], seen);
        }
    }

    return newObj;
};


// Merge all the properties of source into target, source wins in conflic, and by default null and undefined from source are applied

exports.merge = function (target, source, isNullOverride /* = true */, isMergeArrays /* = true */) {

    exports.assert(target && typeof target == 'object', 'Invalid target value: must be an object');
    exports.assert(source === null || source === undefined || typeof source === 'object', 'Invalid source value: must be null, undefined, or an object');

    if (!source) {
        return target;
    }

    if (source instanceof Array) {
        exports.assert(target instanceof Array, 'Cannot merge array onto an object');
        if (isMergeArrays === false) {                                                  // isMergeArrays defaults to true
            target.length = 0;                                                          // Must not change target assignment
        }

        for (var i = 0, il = source.length; i < il; ++i) {
            target.push(source[i]);
        }

        return target;
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];
        if (value &&
            typeof value === 'object') {

            if (!target[key] ||
                typeof target[key] !== 'object' ||
                value instanceof Date ||
                value instanceof Buffer ||
                value instanceof RegExp) {

                target[key] = exports.clone(value);
            }
            else {
                exports.merge(target[key], source[key], isNullOverride, isMergeArrays);
            }
        }
        else {
            if (value !== null && value !== undefined) {            // Explicit to preserve empty strings
                target[key] = value;
            }
            else if (isNullOverride !== false) {                    // Defaults to true
                target[key] = value;
            }
        }
    }

    return target;
};


// Apply options to a copy of the defaults

exports.applyToDefaults = function (defaults, options) {

    exports.assert(defaults && typeof defaults == 'object', 'Invalid defaults value: must be an object');
    exports.assert(!options || options === true || typeof options === 'object', 'Invalid options value: must be true, falsy or an object');

    if (!options) {                                                 // If no options, return null
        return null;
    }

    var copy = exports.clone(defaults);

    if (options === true) {                                         // If options is set to true, use defaults
        return copy;
    }

    return exports.merge(copy, options, false, false);
};


// Remove duplicate items from array

exports.unique = function (array, key) {

    var index = {};
    var result = [];

    for (var i = 0, il = array.length; i < il; ++i) {
        var id = (key ? array[i][key] : array[i]);
        if (index[id] !== true) {

            result.push(array[i]);
            index[id] = true;
        }
    }

    return result;
};


// Convert array into object

exports.mapToObject = function (array, key) {

    if (!array) {
        return null;
    }

    var obj = {};
    for (var i = 0, il = array.length; i < il; ++i) {
        if (key) {
            if (array[i][key]) {
                obj[array[i][key]] = true;
            }
        }
        else {
            obj[array[i]] = true;
        }
    }

    return obj;
};


// Find the common unique items in two arrays

exports.intersect = function (array1, array2, justFirst) {

    if (!array1 || !array2) {
        return [];
    }

    var common = [];
    var hash = (array1 instanceof Array ? exports.mapToObject(array1) : array1);
    var found = {};
    for (var i = 0, il = array2.length; i < il; ++i) {
        if (hash[array2[i]] && !found[array2[i]]) {
            if (justFirst) {
                return array2[i];
            }

            common.push(array2[i]);
            found[array2[i]] = true;
        }
    }

    return (justFirst ? null : common);
};


// Find which keys are present

exports.matchKeys = function (obj, keys) {

    var matched = [];
    for (var i = 0, il = keys.length; i < il; ++i) {
        if (obj.hasOwnProperty(keys[i])) {
            matched.push(keys[i]);
        }
    }
    return matched;
};


// Flatten array

exports.flatten = function (array, target) {

    var result = target || [];

    for (var i = 0, il = array.length; i < il; ++i) {
        if (Array.isArray(array[i])) {
            exports.flatten(array[i], result);
        }
        else {
            result.push(array[i]);
        }
    }

    return result;
};


// Remove keys

exports.removeKeys = function (object, keys) {

    for (var i = 0, il = keys.length; i < il; i++) {
        delete object[keys[i]];
    }
};


// Convert an object key chain string ('a.b.c') to reference (object[a][b][c])

exports.reach = function (obj, chain, separator) {

    var path = chain.split(separator || '.');
    var ref = obj;
    for (var i = 0, il = path.length; i < il; ++i) {
        if (ref) {
            ref = ref[path[i]];
        }
    }

    return ref;
};


// Inherits a selected set of methods from an object, wrapping functions in asynchronous syntax and catching errors

exports.inheritAsync = function (self, obj, keys) {

    keys = keys || null;

    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (keys instanceof Array &&
                keys.indexOf(i) < 0) {

                continue;
            }

            self.prototype[i] = (function (fn) {

                return function (next) {

                    var result = null;
                    try {
                        result = fn();
                    }
                    catch (err) {
                        return next(err);
                    }

                    return next(null, result);
                };
            })(obj[i]);
        }
    }
};


exports.formatStack = function (stack) {

    var trace = [];
    for (var i = 0, il = stack.length; i < il; ++i) {
        var item = stack[i];
        trace.push([item.getFileName(), item.getLineNumber(), item.getColumnNumber(), item.getFunctionName(), item.isConstructor()]);
    }

    return trace;
};


exports.formatTrace = function (trace) {

    var display = [];

    for (var i = 0, il = trace.length; i < il; ++i) {
        var row = trace[i];
        display.push((row[4] ? 'new ' : '') + row[3] + ' (' + row[0] + ':' + row[1] + ':' + row[2] + ')');
    }

    return display;
};


exports.callStack = function (slice) {

    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

    var v8 = Error.prepareStackTrace;
    Error.prepareStackTrace = function (err, stack) {

        return stack;
    };

    var capture = {};
    Error.captureStackTrace(capture, arguments.callee);
    var stack = capture.stack;

    Error.prepareStackTrace = v8;

    var trace = exports.formatStack(stack);

    if (slice) {
        return trace.slice(slice);
    }

    return trace;
};


exports.displayStack = function (slice) {

    var trace = exports.callStack(slice === undefined ? 1 : slice + 1);

    return exports.formatTrace(trace);
};


exports.abortThrow = false;


exports.abort = function (message, hideStack) {

    if (process.env.NODE_ENV === 'test' || exports.abortThrow === true) {
        throw new Error(message || 'Unknown error');
    }

    var stack = '';
    if (!hideStack) {
        stack = exports.displayStack(1).join('\n\t');
    }
    console.log('ABORT: ' + message + '\n\t' + stack);
    process.exit(1);
};


exports.assert = function (condition /*, msg1, msg2, msg3 */) {

    if (condition) {
        return;
    }

    var msgs = Array.prototype.slice.call(arguments, 1);
    msgs = msgs.map(function (msg) {

        return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message : JSON.stringify(msg);
    });
    throw new Error(msgs.join(' ') || 'Unknown error');
};


exports.loadDirModules = function (path, excludeFiles, target) {      // target(filename, name, capName)

    var exclude = {};
    for (var i = 0, il = excludeFiles.length; i < il; ++i) {
        exclude[excludeFiles[i] + '.js'] = true;
    }

    var files = Fs.readdirSync(path);
    for (i = 0, il = files.length; i < il; ++i) {
        var filename = files[i];
        if (/\.js$/.test(filename) &&
            !exclude[filename]) {

            var name = filename.substr(0, filename.lastIndexOf('.'));
            var capName = name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();

            if (typeof target !== 'function') {
                target[capName] = require(path + '/' + name);
            }
            else {
                target(path + '/' + name, name, capName);
            }
        }
    }
};


exports.rename = function (obj, from, to) {

    obj[to] = obj[from];
    delete obj[from];
};


exports.Timer = function () {

    this.reset();
};


exports.Timer.prototype.reset = function () {

    this.ts = Date.now();
};


exports.Timer.prototype.elapsed = function () {

    return Date.now() - this.ts;
};


// Load and parse package.json process root or given directory

exports.loadPackage = function (dir) {

    var result = {};
    var filepath = Path.normalize((dir || process.env.PWD || process.cwd()) + '/package.json');
    if (Fs.existsSync(filepath)) {
        try {
            result = JSON.parse(Fs.readFileSync(filepath));
        }
        catch (e) { }
    }

    return result;
};


// Escape string for Regex construction

exports.escapeRegex = function (string) {

    // Escape ^$.*+-?=!:|\/()[]{},
    return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&');
};


// Return an error as first argument of a callback

exports.toss = function (condition /*, [message], next */) {

    var message = (arguments.length === 3 ? arguments[1] : '');
    var next = (arguments.length === 3 ? arguments[2] : arguments[1]);

    var err = (message instanceof Error ? message : (message ? new Error(message) : (condition instanceof Error ? condition : new Error())));

    if (condition instanceof Error ||
        !condition) {

        return next(err);
    }
};


// Base64url (RFC 4648) encode

exports.base64urlEncode = function (value, encoding) {

    var buf = (value instanceof Buffer ? value : new Buffer(value, encoding || 'binary'));
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
};


// Base64url (RFC 4648) decode

exports.base64urlDecode = function (value, encoding) {

    if (value &&
        !value.match(/^[\w\-]*$/)) {

        return new Error('Invalid character');
    }

    try {
        var buf = new Buffer(value.replace(/-/g, '+').replace(/:/g, '/'), 'base64');
        return (encoding === 'buffer' ? buf : buf.toString(encoding || 'binary'));
    }
    catch (err) {
        return err;
    }
};


// Escape attribute value for use in HTTP header

exports.escapeHeaderAttribute = function (attribute) {

    // Allowed value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9, \, "

    exports.assert(attribute.match(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/), 'Bad attribute value (' + attribute + ')');

    return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');                             // Escape quotes and slash
};


exports.escapeHtml = function (string) {

    return Escape.escapeHtml(string);
};


exports.escapeJavaScript = function (string) {

    return Escape.escapeJavaScript(string);
};


/*
var event = {
    timestamp: now.getTime(),
    tags: ['tag'],
    data: { some: 'data' }
};
*/

exports.consoleFunc = console.log;

exports.printEvent = function (event) {

    var pad = function (value) {

        return (value < 10 ? '0' : '') + value;
    };

    var now = new Date(event.timestamp);
    var timestring = (now.getYear() - 100).toString() +
        pad(now.getMonth() + 1) +
        pad(now.getDate()) +
        '/' +
        pad(now.getHours()) +
        pad(now.getMinutes()) +
        pad(now.getSeconds()) +
        '.' +
        now.getMilliseconds();

    var data = event.data;
    if (typeof event.data !== 'string') {
        try {
            data = JSON.stringify(event.data);
        }
        catch (e) {
            data = 'JSON Error: ' + e.message;
        }
    }

    var output = timestring + ', ' + event.tags[0] + ', ' + data;
    exports.consoleFunc(output);
};


exports.nextTick = function (callback) {

    return function () {

        var args = arguments;
        process.nextTick(function () {

            callback.apply(null, args);
        });
    };
};


exports.readStream = function (stream, callback) {

    var result = '';

    stream.on('readable', function () {

        var read = stream.read();
        if (read) {
            result += read.toString();
        }
    });

    stream.once('end', function () {

        callback(result);
    });
};

},{"./escape":71,"__browserify_Buffer":4,"__browserify_process":76,"fs":28,"path":29}],73:[function(require,module,exports){
module.exports = require('./lib');
},{"./lib":74}],74:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer,process=require("__browserify_process");// Load modules

var Dgram = require('dgram');
var Dns = require('dns');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.time = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    var settings = Hoek.clone(options);
    settings.host = settings.host || 'pool.ntp.org';
    settings.port = settings.port || 123;
    settings.resolveReference = settings.resolveReference || false;

    // Declare variables used by callback

    var timeoutId = 0;
    var sent = 0;

    // Ensure callback is only called once

    var isFinished = false;
    var finish = function (err, result) {

        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = 0;
        }

        if (!isFinished) {
            isFinished = true;
            socket.removeAllListeners();
            socket.once('error', internals.ignore);
            socket.close();
            return callback(err, result);
        }
    };

    // Create UDP socket

    var socket = Dgram.createSocket('udp4');

    socket.once('error', function (err) {

        return finish(err);
    });

    // Listen to incoming messages

    socket.on('message', function (buffer, rinfo) {

        var received = Date.now();

        var message = new internals.NtpMessage(buffer);
        if (!message.isValid) {
            return finish(new Error('Invalid server response'), message);
        }

        if (message.originateTimestamp !== sent) {
            return finish(new Error('Wrong originate timestamp'), message);
        }

        // Timestamp Name          ID   When Generated
        // ------------------------------------------------------------
        // Originate Timestamp     T1   time request sent by client
        // Receive Timestamp       T2   time request received by server
        // Transmit Timestamp      T3   time reply sent by server
        // Destination Timestamp   T4   time reply received by client
        //
        // The roundtrip delay d and system clock offset t are defined as:
        //
        // d = (T4 - T1) - (T3 - T2)     t = ((T2 - T1) + (T3 - T4)) / 2

        var T1 = message.originateTimestamp;
        var T2 = message.receiveTimestamp;
        var T3 = message.transmitTimestamp;
        var T4 = received;

        message.d = (T4 - T1) - (T3 - T2);
        message.t = ((T2 - T1) + (T3 - T4)) / 2;
        message.receivedLocally = received;

        if (!settings.resolveReference ||
            message.stratum !== 'secondary') {

            return finish(null, message);
        }

        // Resolve reference IP address

        Dns.reverse(message.referenceId, function (err, domains) {

            if (!err) {
                message.referenceHost = domains[0];
            }

            return finish(null, message);
        });
    });

    // Set timeout

    if (settings.timeout) {
        timeoutId = setTimeout(function () {

            timeoutId = 0;
            return finish(new Error('Timeout'));
        }, settings.timeout);
    }

    // Construct NTP message

    var message = new Buffer(48);
    for (var i = 0; i < 48; i++) {                      // Zero message
        message[i] = 0;
    }

    message[0] = (0 << 6) + (4 << 3) + (3 << 0)         // Set version number to 4 and Mode to 3 (client)
    sent = Date.now();
    internals.fromMsecs(sent, message, 40);               // Set transmit timestamp (returns as originate)

    // Send NTP request

    socket.send(message, 0, message.length, settings.port, settings.host, function (err, bytes) {

        if (err ||
            bytes !== 48) {

            return finish(err || new Error('Could not send entire message'));
        }
    });
};


internals.NtpMessage = function (buffer) {

    this.isValid = false;

    // Validate

    if (buffer.length !== 48) {
        return;
    }

    // Leap indicator

    var li = (buffer[0] >> 6);
    switch (li) {
        case 0: this.leapIndicator = 'no-warning'; break;
        case 1: this.leapIndicator = 'last-minute-61'; break;
        case 2: this.leapIndicator = 'last-minute-59'; break;
        case 3: this.leapIndicator = 'alarm'; break;
    }

    // Version

    var vn = ((buffer[0] & 0x38) >> 3);
    this.version = vn;

    // Mode

    var mode = (buffer[0] & 0x7);
    switch (mode) {
        case 1: this.mode = 'symmetric-active'; break;
        case 2: this.mode = 'symmetric-passive'; break;
        case 3: this.mode = 'client'; break;
        case 4: this.mode = 'server'; break;
        case 5: this.mode = 'broadcast'; break;
        case 0:
        case 6:
        case 7: this.mode = 'reserved'; break;
    }

    // Stratum

    var stratum = buffer[1];
    if (stratum === 0) {
        this.stratum = 'death';
    }
    else if (stratum === 1) {
        this.stratum = 'primary';
    }
    else if (stratum <= 15) {
        this.stratum = 'secondary';
    }
    else {
        this.stratum = 'reserved';
    }

    // Poll interval (msec)

    this.pollInterval = Math.round(Math.pow(2, buffer[2])) * 1000;

    // Precision (msecs)

    this.precision = Math.pow(2, buffer[3]) * 1000;

    // Root delay (msecs)

    var rootDelay = 256 * (256 * (256 * buffer[4] + buffer[5]) + buffer[6]) + buffer[7];
    this.rootDelay = 1000 * (rootDelay / 0x10000);

    // Root dispersion (msecs)

    this.rootDispersion = ((buffer[8] << 8) + buffer[9] + ((buffer[10] << 8) + buffer[11]) / Math.pow(2, 16)) * 1000;

    // Reference identifier

    this.referenceId = '';
    switch (this.stratum) {
        case 'death':
        case 'primary':
            this.referenceId = String.fromCharCode(buffer[12]) + String.fromCharCode(buffer[13]) + String.fromCharCode(buffer[14]) + String.fromCharCode(buffer[15]);
            break;
        case 'secondary':
            this.referenceId = '' + buffer[12] + '.' + buffer[13] + '.' + buffer[14] + '.' + buffer[15];
            break;
    }

    // Reference timestamp

    this.referenceTimestamp = internals.toMsecs(buffer, 16);

    // Originate timestamp

    this.originateTimestamp = internals.toMsecs(buffer, 24);

    // Receive timestamp

    this.receiveTimestamp = internals.toMsecs(buffer, 32);

    // Transmit timestamp

    this.transmitTimestamp = internals.toMsecs(buffer, 40);

    // Validate

    if (this.version === 4 &&
        this.stratum !== 'reserved' &&
        this.mode === 'server' &&
        this.originateTimestamp &&
        this.receiveTimestamp &&
        this.transmitTimestamp) {

        this.isValid = true;
    }

    return this;
};


internals.toMsecs = function (buffer, offset) {

    var seconds = 0;
    var fraction = 0;

    for (var i = 0; i < 4; ++i) {
        seconds = (seconds * 256) + buffer[offset + i];
    }

    for (i = 4; i < 8; ++i) {
        fraction = (fraction * 256) + buffer[offset + i];
    }

    return ((seconds - 2208988800 + (fraction / Math.pow(2, 32))) * 1000);
};


internals.fromMsecs = function (ts, buffer, offset) {

    var seconds = Math.floor(ts / 1000) + 2208988800;
    var fraction = Math.round((ts % 1000) / 1000 * Math.pow(2, 32));

    buffer[offset + 0] = (seconds & 0xFF000000) >> 24;
    buffer[offset + 1] = (seconds & 0x00FF0000) >> 16;
    buffer[offset + 2] = (seconds & 0x0000FF00) >> 8;
    buffer[offset + 3] = (seconds & 0x000000FF);

    buffer[offset + 4] = (fraction & 0xFF000000) >> 24;
    buffer[offset + 5] = (fraction & 0x00FF0000) >> 16;
    buffer[offset + 6] = (fraction & 0x0000FF00) >> 8;
    buffer[offset + 7] = (fraction & 0x000000FF);
};


// Offset singleton

internals.last = {
    offset: 0,
    expires: 0,
    host: '',
    port: 0
};


exports.offset = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    var now = Date.now();
    var clockSyncRefresh = options.clockSyncRefresh || 24 * 60 * 60 * 1000;                    // Daily

    if (internals.last.offset &&
        internals.last.host === options.host &&
        internals.last.port === options.port &&
        now < internals.last.expires) {

        process.nextTick(function () {
                
            callback(null, internals.last.offset);
        });

        return;
    }

    exports.time(options, function (err, time) {

        if (err) {
            return callback(err, 0);
        }

        internals.last = {
            offset: Math.round(time.t),
            expires: now + clockSyncRefresh,
            host: options.host,
            port: options.port
        };

        return callback(null, internals.last.offset);
    });
};


// Now singleton

internals.now = {
    intervalId: 0
};


exports.start = function (options, callback) {

    if (arguments.length !== 2) {
        callback = arguments[0];
        options = {};
    }

    if (internals.now.intervalId) {
        process.nextTick(function () {
            
            callback();
        });
        
        return;
    }

    exports.offset(options, function (err, offset) {

        internals.now.intervalId = setInterval(function () {

            exports.offset(options, function () { });
        }, options.clockSyncRefresh || 24 * 60 * 60 * 1000);                                // Daily

        return callback();
    });
};


exports.stop = function () {

    if (!internals.now.intervalId) {
        return;
    }

    clearInterval(internals.now.intervalId);
    internals.now.intervalId = 0;
};


exports.isLive = function () {

    return !!internals.now.intervalId;
};


exports.now = function () {

    var now = Date.now();
    if (!exports.isLive() ||
        now >= internals.last.expires) {

        return now;
    }

    return now + internals.last.offset;
};


internals.ignore = function () {

};

},{"__browserify_Buffer":4,"__browserify_process":76,"dgram":26,"dns":24,"hoek":70}],75:[function(require,module,exports){
module.exports = require("./lib/hkdf");
},{"./lib/hkdf":59}],76:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],77:[function(require,module,exports){
var process=require("__browserify_process");/*!
 * Copyright 2013 Robert Katić
 * Released under the MIT license
 * https://github.com/rkatic/p/blob/master/LICENSE
 */
;(function( factory ){
	// CommonJS
	if ( typeof module !== "undefined" && module && module.exports ) {
		module.exports = factory();

	// RequireJS
	} else if ( typeof define === "function" && define.amd ) {
		define( factory );

	// global
	} else {
		P = factory();
	}
})(function() {
	"use strict";

	var
		head = { f: null, n: null }, tail = head,
		running = false,

		channel, // MessageChannel
		requestTick, // --> requestTick( onTick, 0 )

		// window or worker
		wow = ot(typeof window) && window || ot(typeof worker) && worker,

		call = ot.call,
		apply = ot.apply;

	function onTick() {
		while ( head.n ) {
			head = head.n;
			var f = head.f;
			head.f = null;
			f();
		}
		running = false;
	}

	var runLater = function( f ) {
		tail = tail.n = { f: f, n: null };
		if ( !running ) {
			running = true;
			requestTick( onTick, 0 );
		}
	};

	function ot( type ) {
		return type === "object" || type === "function";
	}

	if ( ot(typeof process) && process && process.nextTick ) {
		requestTick = process.nextTick;

	} else if ( ot(typeof setImmediate) ) {
		requestTick = wow ?
			function( cb ) {
				wow.setImmediate( cb );
			} :
			function( cb ) {
				setImmediate( cb );
			};

	} else if ( ot(typeof MessageChannel) ) {
		channel = new MessageChannel();
		channel.port1.onmessage = onTick;
		requestTick = function() {
			channel.port2.postMessage(0);
		};

	} else {
		requestTick = setTimeout;

		if ( wow && ot(typeof Image) && Image ) {
			(function(){
				var c = 0;

				var requestTickViaImage = function( cb ) {
					var img = new Image();
					img.onerror = cb;
					img.src = 'data:image/png,';
				};

				// Before using it, test if it works properly, with async dispatching.
				try {
					requestTickViaImage(function() {
						if ( --c === 0 ) {
							requestTick = requestTickViaImage;
						}
					});
					++c;
				} catch (e) {}

				// Also use it only if faster then setTimeout.
				c && setTimeout(function() {
					c = 0;
				}, 0);
			})();
		}
	}

	//__________________________________________________________________________


	function forEach( arr, cb ) {
		for ( var i = 0, l = arr.length; i < l; ++i ) {
			if ( i in arr ) {
				cb( arr[i], i );
			}
		}
	}

	function reportError( error ) {
		try {
			if ( P.onerror ) {
				P.onerror( error );
			} else {
				throw error;
			}

		} catch ( e ) {
			setTimeout(function() {
				throw e;
			}, 0);
		}
	}

	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	function P( x ) {
		return x instanceof Promise ?
			x :
			Resolve( new Promise(), x );
	}

	function Settle( p, state, value ) {
		if ( p._state ) {
			return p;
		}

		p._state = state;
		p._value = value;

		if ( p._pending.length > 0 ) {
			forEach( p._pending, runLater );
		}
		p._pending = null;

		return p;
	}

	function OnSettled( p, f ) {
		p._pending.push( f );
		//p._tail = p._tail.n = { f: f, n: null };
	}

	function Resolve( p, x ) {
		if ( p._state ) {
			return p;
		}

		if ( x instanceof Promise ) {
			if ( x === p ) {
				Settle( p, REJECTED, new TypeError("You can't resolve a promise with itself") );

			} else if ( x._state ) {
				Settle( p, x._state, x._value );

			} else {
				OnSettled(x, function() {
					Settle( p, x._state, x._value );
				});
			}

		} else if ( x !== Object(x) ) {
			Settle( p, FULFILLED, x );

		} else {
			runLater(function() {
				var r = resolverFor( p );

				try {
					var then = x.then;

					if ( typeof then === "function" ) {
						call.call( then, x, r.resolve, r.reject );

					} else {
						Settle( p, FULFILLED, x );
					}

				} catch ( e ) {
					r.reject( e );
				}
			});
		}

		return p;
	}

	function resolverFor( promise ) {
		var done = false;

		return {
			promise: promise,

			resolve: function( y ) {
				if ( !done ) {
					done = true;
					Resolve( promise, y );
				}
			},

			reject: function( reason ) {
				if ( !done ) {
					done = true;
					Settle( promise, REJECTED, reason );
				}
			}
		};
	}

	P.defer = defer;
	function defer() {
		return resolverFor( new Promise() );
	}

	P.reject = reject;
	function reject( reason ) {
		return Settle( new Promise(), REJECTED, reason );
	}

	function Promise() {
		this._state = 0;
		this._value = void 0;
		this._pending = [];
	}

	Promise.prototype.then = function( onFulfilled, onRejected ) {
		var cb = typeof onFulfilled === "function" ? onFulfilled : null;
		var eb = typeof onRejected === "function" ? onRejected : null;

		var p = this;
		var p2 = new Promise();

		function onSettled() {
			var x, func = p._state === FULFILLED ? cb : eb;

			if ( func !== null ) {
				try {
					x = func( p._value );

				} catch ( e ) {
					Settle( p2, REJECTED, e );
					return;
				}

				Resolve( p2, x );

			} else {
				Settle( p2, p._state, p._value );
			}
		}

		if ( p._state === PENDING ) {
			OnSettled( p, onSettled );

		} else {
			runLater( onSettled );
		}

		return p2;
	};

	Promise.prototype.done = function( cb, eb ) {
		var p = this;

		if ( cb || eb ) {
			p = p.then( cb, eb );
		}

		p.then( null, reportError );
	};

	Promise.prototype.fail = function( eb ) {
		return this.then( null, eb );
	};

	Promise.prototype.spread = function( cb, eb ) {
		return this.then(cb && function( array ) {
			return all( array, [] ).then(function( values ) {
				return apply.call( cb, void 0, values );
			}, eb);
		}, eb);
	};

	Promise.prototype.timeout = function( ms, msg ) {
		var p = this;
		var p2 = new Promise();

		if ( p._state !== PENDING ) {
			Settle( p2, p._state, p._value );

		} else {
			var timeoutId = setTimeout(function() {
				Settle( p2, REJECTED,
					new Error(msg || "Timed out after " + ms + " ms") );
			}, ms);

			OnSettled(p, function() {
				clearTimeout( timeoutId );
				Settle( p2, p._state, p._value );
			});
		}

		return p2;
	};

	Promise.prototype.delay = function( ms ) {
		var d = defer();

		this.then(function( value ) {
			setTimeout(function() {
				d.resolve( value );
			}, ms);
		}, d.reject);

		return d.promise;
	};

	Promise.prototype.inspect = function() {
		switch ( this._state ) {
			case PENDING:   return { state: "pending" };
			case FULFILLED: return { state: "fulfilled", value: this._value };
			case REJECTED:  return { state: "rejected", reason: this._value };
			default: throw new TypeError("invalid state");
		}
	};

	function valuesHandler( f ) {
		function onFulfilled( values ) {
			return f( values, [] );
		}

		function handleValues( values ) {
			return P( values ).then( onFulfilled );
		}

		handleValues._ = f;
		return handleValues;
	}

	P.allSettled = valuesHandler( allSettled );
	function allSettled( input, output ) {
		var waiting = 0;
		var promise = new Promise();
		forEach( input, function( x, index ) {
			var p = P( x );
			if ( p._state === PENDING ) {
				++waiting;
				OnSettled(p, function() {
					output[ index ] = p.inspect();
					if ( --waiting === 0 ) {
						Settle( promise, FULFILLED, output );
					}
				});
			} else {
				output[ index ] = p.inspect();
			}
		});
		if ( waiting === 0 ) {
			Settle( promise, FULFILLED, output );
		}
		return promise;
	}

	P.all = valuesHandler( all );
	function all( input, output ) {
		var waiting = 0;
		var d = defer();
		forEach( input, function( x, index ) {
			var p = P( x );
			if ( p._state === FULFILLED ) {
				output[ index ] = p._value;

			} else {
				++waiting;
				p.then(function( value ) {
					output[ index ] = value;
					if ( --waiting === 0 ) {
						d.resolve( output );
					}
				}, d.reject);
			}
		});
		if ( waiting === 0 ) {
			d.resolve( output );
		}
		return d.promise;
	}

	P.promised = promised;
	function promised( f ) {
		function onFulfilled( thisAndArgs ) {
			return apply.apply( f, thisAndArgs );
		}

		return function() {
			var allArgs = all( arguments, [] );
			return all( [this, allArgs], [] ).then( onFulfilled );
		};
	}

	P.onerror = null;

	P.nextTick = function( f ) {
		runLater(function() {
			try {
				f();

			} catch ( ex ) {
				setTimeout(function() {
					throw ex;
				}, 0);
			}
		});
	};

	return P;
});

},{"__browserify_process":76}],78:[function(require,module,exports){
/** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

var sjcl = require('sjcl');

/** @namespace Arrays of bytes */
module.exports = {
  /** Convert from a bitArray to an array of bytes. */
  fromBits: function (arr) {
    var out = [], bl = sjcl.bitArray.bitLength(arr), i, tmp;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out.push(tmp >>> 24);
      tmp <<= 8;
    }
    return out;
  },
  /** Convert from an array of bytes to a bitArray. */
  toBits: function (bytes) {
    var out = [], i, tmp=0;
    for (i=0; i<bytes.length; i++) {
      tmp = tmp << 8 | bytes[i];
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(sjcl.bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
};

},{"sjcl":79}],79:[function(require,module,exports){
"use strict";function q(a){throw a;}var t=void 0,u=!1;var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
"undefined"!=typeof module&&module.exports&&(module.exports=sjcl);
sjcl.cipher.aes=function(a){this.j[0][0][0]||this.D();var b,c,d,e,f=this.j[0][4],g=this.j[1];b=a.length;var h=1;4!==b&&(6!==b&&8!==b)&&q(new sjcl.exception.invalid("invalid aes key size"));this.a=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return y(this,a,0)},decrypt:function(a){return y(this,a,1)},j:[[[],[],[],[],[]],[[],[],[],[],[]]],D:function(){var a=this.j[0],b=this.j[1],c=a[4],d=b[4],e,f,g,h=[],l=[],k,n,m,p;for(e=0;0x100>e;e++)l[(h[e]=e<<1^283*(e>>7))^e]=e;for(f=g=0;!c[f];f^=k||1,g=l[g]||1){m=g^g<<1^g<<2^g<<3^g<<4;m=m>>8^m&255^99;c[f]=m;d[m]=f;n=h[e=h[k=h[f]]];p=0x1010101*n^0x10001*e^0x101*k^0x1010100*f;n=0x101*h[m]^0x1010100*m;for(e=0;4>e;e++)a[e][f]=n=n<<24^n>>>8,b[e][m]=p=p<<24^p>>>8}for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function y(a,b,c){4!==b.length&&q(new sjcl.exception.invalid("invalid aes block size"));var d=a.a[c],e=b[0]^d[0],f=b[c?3:1]^d[1],g=b[2]^d[2];b=b[c?1:3]^d[3];var h,l,k,n=d.length/4-2,m,p=4,s=[0,0,0,0];h=a.j[c];a=h[0];var r=h[1],v=h[2],w=h[3],x=h[4];for(m=0;m<n;m++)h=a[e>>>24]^r[f>>16&255]^v[g>>8&255]^w[b&255]^d[p],l=a[f>>>24]^r[g>>16&255]^v[b>>8&255]^w[e&255]^d[p+1],k=a[g>>>24]^r[b>>16&255]^v[e>>8&255]^w[f&255]^d[p+2],b=a[b>>>24]^r[e>>16&255]^v[f>>8&255]^w[g&255]^d[p+3],p+=4,e=h,f=l,g=k;for(m=0;4>
m;m++)s[c?3&-m:m]=x[e>>>24]<<24^x[f>>16&255]<<16^x[g>>8&255]<<8^x[b&255]^d[p++],h=e,e=f,f=g,g=b,b=h;return s}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.O(a.slice(b/32),32-(b&31)).slice(1);return c===t?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.O(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b&=31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return u;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},O:function(a,b,c,d){var e;e=0;for(d===t&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},k:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>24),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a+="00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,4*d)}};
sjcl.codec.base64={I:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.I,g=0,h=sjcl.bitArray.bitLength(a);c&&(f=f.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=f.charAt((g^a[c]>>>e)>>>26),6>e?(g=a[c]<<6-e,e+=26,c++):(g<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,f=sjcl.codec.base64.I,g=0,h;b&&(f=f.substr(0,62)+"-_");for(d=0;d<a.length;d++)h=f.indexOf(a.charAt(d)),
0>h&&q(new sjcl.exception.invalid("this isn't base64!")),26<e?(e-=26,c.push(g^h>>>e),g=h<<32-e):(e+=6,g^=h<<32-e);e&56&&c.push(sjcl.bitArray.partial(e&56,g,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.a[0]||this.D();a?(this.q=a.q.slice(0),this.m=a.m.slice(0),this.g=a.g):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.q=this.M.slice(0);this.m=[];this.g=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.m=sjcl.bitArray.concat(this.m,a);b=this.g;a=this.g=b+sjcl.bitArray.bitLength(a);for(b=512+b&-512;b<=a;b+=512)z(this,c.splice(0,16));return this},finalize:function(){var a,b=this.m,c=this.q,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.g/
4294967296));for(b.push(this.g|0);b.length;)z(this,b.splice(0,16));this.reset();return c},M:[],a:[],D:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}var b=0,c=2,d;a:for(;64>b;c++){for(d=2;d*d<=c;d++)if(0===c%d)continue a;8>b&&(this.M[b]=a(Math.pow(c,0.5)));this.a[b]=a(Math.pow(c,1/3));b++}}};
function z(a,b){var c,d,e,f=b.slice(0),g=a.q,h=a.a,l=g[0],k=g[1],n=g[2],m=g[3],p=g[4],s=g[5],r=g[6],v=g[7];for(c=0;64>c;c++)16>c?d=f[c]:(d=f[c+1&15],e=f[c+14&15],d=f[c&15]=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+f[c&15]+f[c+9&15]|0),d=d+v+(p>>>6^p>>>11^p>>>25^p<<26^p<<21^p<<7)+(r^p&(s^r))+h[c],v=r,r=s,s=p,p=m+d|0,m=n,n=k,k=l,l=d+(k&n^m&(k^n))+(k>>>2^k>>>13^k>>>22^k<<30^k<<19^k<<10)|0;g[0]=g[0]+l|0;g[1]=g[1]+k|0;g[2]=g[2]+n|0;g[3]=g[3]+m|0;g[4]=g[4]+p|0;g[5]=g[5]+s|0;g[6]=
g[6]+r|0;g[7]=g[7]+v|0}
sjcl.mode.ccm={name:"ccm",encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,l=h.bitLength(c)/8,k=h.bitLength(g)/8;e=e||64;d=d||[];7>l&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(f=2;4>f&&k>>>8*f;f++);f<15-l&&(f=15-l);c=h.clamp(c,8*(15-f));b=sjcl.mode.ccm.K(a,b,c,d,e,f);g=sjcl.mode.ccm.n(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),l=f.clamp(b,h-e),k=f.bitSlice(b,
h-e),h=(h-e)/8;7>g&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(b=2;4>b&&h>>>8*b;b++);b<15-g&&(b=15-g);c=f.clamp(c,8*(15-b));l=sjcl.mode.ccm.n(a,l,c,k,e,b);a=sjcl.mode.ccm.K(a,l.data,c,d,e,b);f.equal(l.tag,a)||q(new sjcl.exception.corrupt("ccm: tag doesn't match"));return l.data},K:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,l=h.k;e/=8;(e%2||4>e||16<e)&&q(new sjcl.exception.invalid("ccm: invalid tag length"));(0xffffffff<d.length||0xffffffff<b.length)&&q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data"));
f=[h.partial(8,(d.length?64:0)|e-2<<2|f-1)];f=h.concat(f,c);f[3]|=h.bitLength(b)/8;f=a.encrypt(f);if(d.length){c=h.bitLength(d)/8;65279>=c?g=[h.partial(16,c)]:0xffffffff>=c&&(g=h.concat([h.partial(16,65534)],[c]));g=h.concat(g,d);for(d=0;d<g.length;d+=4)f=a.encrypt(l(f,g.slice(d,d+4).concat([0,0,0])))}for(d=0;d<b.length;d+=4)f=a.encrypt(l(f,b.slice(d,d+4).concat([0,0,0])));return h.clamp(f,8*e)},n:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.k;var l=b.length,k=h.bitLength(b);c=h.concat([h.partial(8,
f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!l)return{tag:d,data:[]};for(g=0;g<l;g+=4)c[3]++,e=a.encrypt(c),b[g]^=e[0],b[g+1]^=e[1],b[g+2]^=e[2],b[g+3]^=e[3];return{tag:d,data:h.clamp(b,k)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));var g,h=sjcl.mode.ocb2.G,l=sjcl.bitArray,k=l.k,n=[0,0,0,0];c=h(a.encrypt(c));var m,p=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4)m=b.slice(g,g+4),n=k(n,m),p=p.concat(k(c,a.encrypt(k(c,m)))),c=h(c);m=b.slice(g);b=l.bitLength(m);g=a.encrypt(k(c,[0,0,0,b]));m=l.clamp(k(m.concat([0,0,0]),g),b);n=k(n,k(m.concat([0,0,0]),g));n=a.encrypt(k(n,k(c,h(c))));d.length&&
(n=k(n,f?d:sjcl.mode.ocb2.pmac(a,d)));return p.concat(l.concat(m,l.clamp(n,e)))},decrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));e=e||64;var g=sjcl.mode.ocb2.G,h=sjcl.bitArray,l=h.k,k=[0,0,0,0],n=g(a.encrypt(c)),m,p,s=sjcl.bitArray.bitLength(b)-e,r=[];d=d||[];for(c=0;c+4<s/32;c+=4)m=l(n,a.decrypt(l(n,b.slice(c,c+4)))),k=l(k,m),r=r.concat(m),n=g(n);p=s-32*c;m=a.encrypt(l(n,[0,0,0,p]));m=l(m,h.clamp(b.slice(c),p).concat([0,0,0]));
k=l(k,m);k=a.encrypt(l(k,l(n,g(n))));d.length&&(k=l(k,f?d:sjcl.mode.ocb2.pmac(a,d)));h.equal(h.clamp(k,e),h.bitSlice(b,s))||q(new sjcl.exception.corrupt("ocb: tag doesn't match"));return r.concat(h.clamp(m,p))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.G,e=sjcl.bitArray,f=e.k,g=[0,0,0,0],h=a.encrypt([0,0,0,0]),h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4)h=d(h),g=f(g,a.encrypt(f(h,b.slice(c,c+4))));c=b.slice(c);128>e.bitLength(c)&&(h=f(h,d(h)),c=e.concat(c,[-2147483648,0,0,0]));g=f(g,c);return a.encrypt(f(d(f(h,
d(h))),g))},G:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^135*(a[0]>>>31)]}};
sjcl.mode.gcm={name:"gcm",encrypt:function(a,b,c,d,e){var f=b.slice(0);b=sjcl.bitArray;d=d||[];a=sjcl.mode.gcm.n(!0,a,f,d,c,e||128);return b.concat(a.data,a.tag)},decrypt:function(a,b,c,d,e){var f=b.slice(0),g=sjcl.bitArray,h=g.bitLength(f);e=e||128;d=d||[];e<=h?(b=g.bitSlice(f,h-e),f=g.bitSlice(f,0,h-e)):(b=f,f=[]);a=sjcl.mode.gcm.n(u,a,f,d,c,e);g.equal(a.tag,b)||q(new sjcl.exception.corrupt("gcm: tag doesn't match"));return a.data},U:function(a,b){var c,d,e,f,g,h=sjcl.bitArray.k;e=[0,0,0,0];f=b.slice(0);
for(c=0;128>c;c++){(d=0!==(a[Math.floor(c/32)]&1<<31-c%32))&&(e=h(e,f));g=0!==(f[3]&1);for(d=3;0<d;d--)f[d]=f[d]>>>1|(f[d-1]&1)<<31;f[0]>>>=1;g&&(f[0]^=-0x1f000000)}return e},f:function(a,b,c){var d,e=c.length;b=b.slice(0);for(d=0;d<e;d+=4)b[0]^=0xffffffff&c[d],b[1]^=0xffffffff&c[d+1],b[2]^=0xffffffff&c[d+2],b[3]^=0xffffffff&c[d+3],b=sjcl.mode.gcm.U(b,a);return b},n:function(a,b,c,d,e,f){var g,h,l,k,n,m,p,s,r=sjcl.bitArray;m=c.length;p=r.bitLength(c);s=r.bitLength(d);h=r.bitLength(e);g=b.encrypt([0,
0,0,0]);96===h?(e=e.slice(0),e=r.concat(e,[1])):(e=sjcl.mode.gcm.f(g,[0,0,0,0],e),e=sjcl.mode.gcm.f(g,e,[0,0,Math.floor(h/0x100000000),h&0xffffffff]));h=sjcl.mode.gcm.f(g,[0,0,0,0],d);n=e.slice(0);d=h.slice(0);a||(d=sjcl.mode.gcm.f(g,h,c));for(k=0;k<m;k+=4)n[3]++,l=b.encrypt(n),c[k]^=l[0],c[k+1]^=l[1],c[k+2]^=l[2],c[k+3]^=l[3];c=r.clamp(c,p);a&&(d=sjcl.mode.gcm.f(g,h,c));a=[Math.floor(s/0x100000000),s&0xffffffff,Math.floor(p/0x100000000),p&0xffffffff];d=sjcl.mode.gcm.f(g,d,a);l=b.encrypt(e);d[0]^=l[0];
d[1]^=l[1];d[2]^=l[2];d[3]^=l[3];return{tag:r.bitSlice(d,0,f),data:c}}};sjcl.misc.hmac=function(a,b){this.L=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.o=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.o[0].update(c[0]);this.o[1].update(c[1])};sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){a=(new this.L(this.o[0])).update(a).finalize();return(new this.L(this.o[1])).update(a).finalize()};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E3;(0>d||0>c)&&q(sjcl.exception.invalid("invalid params to pbkdf2"));"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,l,k=[],n=sjcl.bitArray;for(l=1;32*k.length<(d||1);l++){e=f=a.encrypt(n.concat(b,[l]));for(g=1;g<c;g++){f=a.encrypt(f);for(h=0;h<f.length;h++)e[h]^=f[h]}k=k.concat(e)}d&&(k=n.clamp(k,d));return k};
sjcl.prng=function(a){this.b=[new sjcl.hash.sha256];this.h=[0];this.F=0;this.t={};this.C=0;this.J={};this.N=this.c=this.i=this.T=0;this.a=[0,0,0,0,0,0,0,0];this.e=[0,0,0,0];this.A=t;this.B=a;this.p=u;this.z={progress:{},seeded:{}};this.l=this.S=0;this.u=1;this.w=2;this.Q=0x10000;this.H=[0,48,64,96,128,192,0x100,384,512,768,1024];this.R=3E4;this.P=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;d===this.l&&q(new sjcl.exception.notReady("generator isn't seeded"));if(d&this.w){d=!(d&this.u);e=[];var f=0,g;this.N=e[0]=(new Date).valueOf()+this.R;for(g=0;16>g;g++)e.push(0x100000000*Math.random()|0);for(g=0;g<this.b.length&&!(e=e.concat(this.b[g].finalize()),f+=this.h[g],this.h[g]=0,!d&&this.F&1<<g);g++);this.F>=1<<this.b.length&&(this.b.push(new sjcl.hash.sha256),this.h.push(0));this.c-=f;f>this.i&&(this.i=f);this.F++;
this.a=sjcl.hash.sha256.hash(this.a.concat(e));this.A=new sjcl.cipher.aes(this.a);for(d=0;4>d&&!(this.e[d]=this.e[d]+1|0,this.e[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.Q&&A(this),e=B(this),c.push(e[0],e[1],e[2],e[3]);A(this);return c.slice(0,a)},setDefaultParanoia:function(a){this.B=a},addEntropy:function(a,b,c){c=c||"user";var d,e,f=(new Date).valueOf(),g=this.t[c],h=this.isReady(),l=0;d=this.J[c];d===t&&(d=this.J[c]=this.T++);g===t&&(g=this.t[c]=0);this.t[c]=(this.t[c]+1)%this.b.length;switch(typeof a){case "number":b===
t&&(b=1);this.b[g].update([d,this.C++,1,b,f,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else{"[object Array]"!==c&&(l=1);for(c=0;c<a.length&&!l;c++)"number"!=typeof a[c]&&(l=1)}if(!l){if(b===t)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,e>>>=1;this.b[g].update([d,this.C++,2,b,f,a.length].concat(a))}break;case "string":b===t&&(b=a.length);this.b[g].update([d,this.C++,3,b,f,a.length]);this.b[g].update(a);
break;default:l=1}l&&q(new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string"));this.h[g]+=b;this.c+=b;h===this.l&&(this.isReady()!==this.l&&C("seeded",Math.max(this.i,this.c)),C("progress",this.getProgress()))},isReady:function(a){a=this.H[a!==t?a:this.B];return this.i&&this.i>=a?this.h[0]>this.P&&(new Date).valueOf()>this.N?this.w|this.u:this.u:this.c>=a?this.w|this.l:this.l},getProgress:function(a){a=this.H[a?a:this.B];return this.i>=a?1:this.c>a?1:this.c/
a},startCollectors:function(){this.p||(window.addEventListener?(window.addEventListener("load",this.r,u),window.addEventListener("mousemove",this.s,u)):document.attachEvent?(document.attachEvent("onload",this.r),document.attachEvent("onmousemove",this.s)):q(new sjcl.exception.bug("can't attach event")),this.p=!0)},stopCollectors:function(){this.p&&(window.removeEventListener?(window.removeEventListener("load",this.r,u),window.removeEventListener("mousemove",this.s,u)):window.detachEvent&&(window.detachEvent("onload",
this.r),window.detachEvent("onmousemove",this.s)),this.p=u)},addEventListener:function(a,b){this.z[a][this.S++]=b},removeEventListener:function(a,b){var c,d,e=this.z[a],f=[];for(d in e)e.hasOwnProperty(d)&&e[d]===b&&f.push(d);for(c=0;c<f.length;c++)d=f[c],delete e[d]},s:function(a){sjcl.random.addEntropy([a.x||a.clientX||a.offsetX||0,a.y||a.clientY||a.offsetY||0],2,"mouse")},r:function(){sjcl.random.addEntropy((new Date).valueOf(),2,"loadtime")}};
function C(a,b){var c,d=sjcl.random.z[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}function A(a){a.a=B(a).concat(B(a));a.A=new sjcl.cipher.aes(a.a)}function B(a){for(var b=0;4>b&&!(a.e[b]=a.e[b]+1|0,a.e[b]);b++);return a.A.encrypt(a.e)}sjcl.random=new sjcl.prng(6);
try{if("undefined"!==typeof module&&module.exports){var D=require("crypto").randomBytes(128);sjcl.random.addEntropy(D,1024,"crypto['randomBytes']")}else if(window&&window.crypto&&window.crypto.getRandomValues){var E=new Uint32Array(32);window.crypto.getRandomValues(E);sjcl.random.addEntropy(E,1024,"crypto['getRandomValues']")}}catch(F){}
sjcl.json={defaults:{v:1,iter:1E3,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},encrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.d({iv:sjcl.random.randomWords(4,0)},e.defaults),g;e.d(f,c);c=f.adata;"string"===typeof f.salt&&(f.salt=sjcl.codec.base64.toBits(f.salt));"string"===typeof f.iv&&(f.iv=sjcl.codec.base64.toBits(f.iv));(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||"string"===typeof a&&100>=f.iter||64!==f.ts&&96!==f.ts&&128!==f.ts||128!==f.ks&&192!==f.ks&&0x100!==f.ks||2>f.iv.length||
4<f.iv.length)&&q(new sjcl.exception.invalid("json encrypt: invalid parameters"));"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,f),a=g.key.slice(0,f.ks/32),f.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.publicKey&&(g=a.kem(),f.kemtag=g.tag,a=g.key.slice(0,f.ks/32));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));g=new sjcl.cipher[f.cipher](a);e.d(d,f);d.key=a;f.ct=sjcl.mode[f.mode].encrypt(g,b,f.iv,c,f.ts);return e.encode(f)},
decrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.d(e.d(e.d({},e.defaults),e.decode(b)),c,!0);var f;c=b.adata;"string"===typeof b.salt&&(b.salt=sjcl.codec.base64.toBits(b.salt));"string"===typeof b.iv&&(b.iv=sjcl.codec.base64.toBits(b.iv));(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||"string"===typeof a&&100>=b.iter||64!==b.ts&&96!==b.ts&&128!==b.ts||128!==b.ks&&192!==b.ks&&0x100!==b.ks||!b.iv||2>b.iv.length||4<b.iv.length)&&q(new sjcl.exception.invalid("json decrypt: invalid parameters"));
"string"===typeof a?(f=sjcl.misc.cachedPbkdf2(a,b),a=f.key.slice(0,b.ks/32),b.salt=f.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.secretKey&&(a=a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0,b.ks/32));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));f=new sjcl.cipher[b.cipher](a);c=sjcl.mode[b.mode].decrypt(f,b.ct,b.iv,c,b.ts);e.d(d,b);d.key=a;return sjcl.codec.utf8String.fromBits(c)},encode:function(a){var b,c="{",d="";for(b in a)if(a.hasOwnProperty(b))switch(b.match(/^[a-z0-9]+$/i)||
q(new sjcl.exception.invalid("json encode: invalid property name")),c+=d+'"'+b+'":',d=",",typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],0)+'"';break;default:q(new sjcl.exception.bug("json encode: unsupported type"))}return c+"}"},decode:function(a){a=a.replace(/\s/g,"");a.match(/^\{.*\}$/)||q(new sjcl.exception.invalid("json decode: this isn't json!"));a=a.replace(/^\{|\}$/g,"").split(/,/);var b=
{},c,d;for(c=0;c<a.length;c++)(d=a[c].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))||q(new sjcl.exception.invalid("json decode: this isn't json!")),b[d[2]]=d[3]?parseInt(d[3],10):d[2].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(d[4]):unescape(d[4]);return b},d:function(a,b,c){a===t&&(a={});if(b===t)return a;for(var d in b)b.hasOwnProperty(d)&&(c&&(a[d]!==t&&a[d]!==b[d])&&q(new sjcl.exception.invalid("required parameter overridden")),a[d]=b[d]);return a},X:function(a,
b){var c={},d;for(d in a)a.hasOwnProperty(d)&&a[d]!==b[d]&&(c[d]=a[d]);return c},W:function(a,b){var c={},d;for(d=0;d<b.length;d++)a[b[d]]!==t&&(c[b[d]]=a[b[d]]);return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.V={};
sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.V,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=b.salt===t?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};

},{"crypto":"l4eWKl"}],"crypto":[function(require,module,exports){
module.exports=require('l4eWKl');
},{}],"bignum":[function(require,module,exports){
module.exports=require('xttfNN');
},{}],"buffer":[function(require,module,exports){
module.exports=require('IZihkv');
},{}],83:[function(require,module,exports){
module.exports = require('./lib/srp');

module.exports.params = require('./lib/params');

},{"./lib/params":84,"./lib/srp":85}],84:[function(require,module,exports){
/*
 * SRP Group Parameters
 * http://tools.ietf.org/html/rfc5054#appendix-A
 *
 * The 1024-, 1536-, and 2048-bit groups are taken from software
 * developed by Tom Wu and Eugene Jhong for the Stanford SRP
 * distribution, and subsequently proven to be prime.  The larger primes
 * are taken from [MODP], but generators have been calculated that are
 * primitive roots of N, unlike the generators in [MODP].
 *
 * The 1024-bit and 1536-bit groups MUST be supported.
 */

// since these are meant to be used internally, all values are numbers. If
// you want to add parameter sets, you'll need to convert them to bignums.

const bignum = require('bignum');

function hex(s) {
    return bignum(s.split(/\s/).join(''), 16);
}

module.exports = {

  1024: {
    N_length_bits: 1024,
    N: hex(' EEAF0AB9 ADB38DD6 9C33F80A FA8FC5E8 60726187 75FF3C0B 9EA2314C'
           +'9C256576 D674DF74 96EA81D3 383B4813 D692C6E0 E0D5D8E2 50B98BE4'
           +'8E495C1D 6089DAD1 5DC7D7B4 6154D6B6 CE8EF4AD 69B15D49 82559B29'
           +'7BCF1885 C529F566 660E57EC 68EDBC3C 05726CC0 2FD4CBF4 976EAA9A'
           +'FD5138FE 8376435B 9FC61D2F C0EB06E3'),
    g: hex('02'),
    hash: 'sha1'},

  1536: {
    N_length_bits: 1536,
    N: hex(' 9DEF3CAF B939277A B1F12A86 17A47BBB DBA51DF4 99AC4C80 BEEEA961'
           +'4B19CC4D 5F4F5F55 6E27CBDE 51C6A94B E4607A29 1558903B A0D0F843'
           +'80B655BB 9A22E8DC DF028A7C EC67F0D0 8134B1C8 B9798914 9B609E0B'
           +'E3BAB63D 47548381 DBC5B1FC 764E3F4B 53DD9DA1 158BFD3E 2B9C8CF5'
           +'6EDF0195 39349627 DB2FD53D 24B7C486 65772E43 7D6C7F8C E442734A'
           +'F7CCB7AE 837C264A E3A9BEB8 7F8A2FE9 B8B5292E 5A021FFF 5E91479E'
           +'8CE7A28C 2442C6F3 15180F93 499A234D CF76E3FE D135F9BB'),
    g: hex('02'),
    hash: 'sha1'},

  2048: {
    N_length_bits: 2048,
    N: hex(' AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294'
           +'3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D'
           +'CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB'
           +'D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74'
           +'7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A'
           +'436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D'
           +'5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73'
           +'03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6'
           +'94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F'
           +'9E4AFF73'),
    g: hex('02'),
    hash: 'sha256'},

  3072: {
    N_length_bits: 3072,
    N: hex(' FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
           +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
           +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
           +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
           +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
           +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
           +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
           +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
           +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
           +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
           +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
           +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
           +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
           +'E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF'),
    g: hex('05'),
    hash: 'sha256'},

  4096: {
    N_length_bits: 4096,
    N: hex(' FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
           +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
           +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
           +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
           +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
           +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
           +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
           +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
           +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
           +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
           +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
           +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
           +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
           +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
           +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
           +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
           +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
           +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34063199'
           +'FFFFFFFF FFFFFFFF'),
    g: hex('05'),
    hash: 'sha256'},

  6244: {
    N_length_bits: 6244,
    N: hex(' FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
           +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
           +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
           +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
           +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
           +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
           +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
           +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
           +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
           +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
           +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
           +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
           +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
           +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
           +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
           +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
           +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
           +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34028492'
           +'36C3FAB4 D27C7026 C1D4DCB2 602646DE C9751E76 3DBA37BD F8FF9406'
           +'AD9E530E E5DB382F 413001AE B06A53ED 9027D831 179727B0 865A8918'
           +'DA3EDBEB CF9B14ED 44CE6CBA CED4BB1B DB7F1447 E6CC254B 33205151'
           +'2BD7AF42 6FB8F401 378CD2BF 5983CA01 C64B92EC F032EA15 D1721D03'
           +'F482D7CE 6E74FEF6 D55E702F 46980C82 B5A84031 900B1C9E 59E7C97F'
           +'BEC7E8F3 23A97A7E 36CC88BE 0F1D45B7 FF585AC5 4BD407B2 2B4154AA'
           +'CC8F6D7E BF48E1D8 14CC5ED2 0F8037E0 A79715EE F29BE328 06A1D58B'
           +'B7C5DA76 F550AA3D 8A1FBFF0 EB19CCB1 A313D55C DA56C9EC 2EF29632'
           +'387FE8D7 6E3C0468 043E8F66 3F4860EE 12BF2D5B 0B7474D6 E694F91E'
           +'6DCC4024 FFFFFFFF FFFFFFFF'),
    g: hex('05'),
    hash: 'sha256'},

  8192: {
    N_length_bits: 8192,
    N: hex(' FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08'
           +'8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B'
           +'302B0A6D F25F1437 4FE1356D 6D51C245 E485B576 625E7EC6 F44C42E9'
           +'A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5 AE9F2411 7C4B1FE6'
           +'49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8'
           +'FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D'
           +'670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C'
           +'180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9 DE2BCBF6 95581718'
           +'3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D AD33170D'
           +'04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D'
           +'B3970F85 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226'
           +'1AD2EE6B F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C'
           +'BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31 43DB5BFC'
           +'E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26'
           +'99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB'
           +'04DE8EF9 2E8EFC14 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2'
           +'233BA186 515BE7ED 1F612970 CEE2D7AF B81BDD76 2170481C D0069127'
           +'D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9 34028492'
           +'36C3FAB4 D27C7026 C1D4DCB2 602646DE C9751E76 3DBA37BD F8FF9406'
           +'AD9E530E E5DB382F 413001AE B06A53ED 9027D831 179727B0 865A8918'
           +'DA3EDBEB CF9B14ED 44CE6CBA CED4BB1B DB7F1447 E6CC254B 33205151'
           +'2BD7AF42 6FB8F401 378CD2BF 5983CA01 C64B92EC F032EA15 D1721D03'
           +'F482D7CE 6E74FEF6 D55E702F 46980C82 B5A84031 900B1C9E 59E7C97F'
           +'BEC7E8F3 23A97A7E 36CC88BE 0F1D45B7 FF585AC5 4BD407B2 2B4154AA'
           +'CC8F6D7E BF48E1D8 14CC5ED2 0F8037E0 A79715EE F29BE328 06A1D58B'
           +'B7C5DA76 F550AA3D 8A1FBFF0 EB19CCB1 A313D55C DA56C9EC 2EF29632'
           +'387FE8D7 6E3C0468 043E8F66 3F4860EE 12BF2D5B 0B7474D6 E694F91E'
           +'6DBE1159 74A3926F 12FEE5E4 38777CB6 A932DF8C D8BEC4D0 73B931BA'
           +'3BC832B6 8D9DD300 741FA7BF 8AFC47ED 2576F693 6BA42466 3AAB639C'
           +'5AE4F568 3423B474 2BF1C978 238F16CB E39D652D E3FDB8BE FC848AD9'
           +'22222E04 A4037C07 13EB57A8 1A23F0C7 3473FC64 6CEA306B 4BCBC886'
           +'2F8385DD FA9D4B7F A2C087E8 79683303 ED5BDD3A 062B3CF5 B3A278A6'
           +'6D2A13F8 3F44F82D DF310EE0 74AB6A36 4597E899 A0255DC1 64F31CC5'
           +'0846851D F9AB4819 5DED7EA1 B1D510BD 7EE74D73 FAF36BC3 1ECFA268'
           +'359046F4 EB879F92 4009438B 481C6CD7 889A002E D5EE382B C9190DA6'
           +'FC026E47 9558E447 5677E9AA 9E3050E2 765694DF C81F56E8 80B96E71'
           +'60C980DD 98EDD3DF FFFFFFFF FFFFFFFF'),
    g: hex('13'),
    hash: 'sha256'}
};

},{"bignum":"xttfNN"}],85:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;const crypto = require('crypto'),
      bignum = require('bignum'),
      assert = require('assert');

const zero = bignum(0);

function assert_(val, msg) {
  if (!val)
    throw new Error(msg||"assertion");
}

/*
 * If a conversion is explicitly specified with the operator PAD(),
 * the integer will first be implicitly converted, then the resultant
 * byte-string will be left-padded with zeros (if necessary) until its
 * length equals the implicitly-converted length of N.
 *
 * params:
 *         n (buffer)       Number to pad
 *         len (int)        length of the resulting Buffer
 *
 * returns: buffer
 */
function padTo(n, len) {
  assertIsBuffer(n, "n");
  var padding = len - n.length;
  assert_(padding > -1, "Negative padding.  Very uncomfortable.");
  var result = new Buffer(len);
  result.fill(0, 0, padding);
  n.copy(result, padding);
  assert.equal(result.length, len);
  return result;
};

function padToN(number, params) {
  assertIsBignum(number);
  return padTo(number.toBuffer(), params.N_length_bits/8);
}

function padToH(number, params) {
  assertIsBignum(number);
  var hashlen_bits;
  if (params.hash === "sha1")
    hashlen_bits = 160;
  else if (params.hash === "sha256")
    hashlen_bits = 256;
  else if (params.hash === "sha512")
    hashlen_bits = 512;
  else
    throw Error("cannot determine length of hash '"+params.hash+"'");

  return padTo(number.toBuffer(), hashlen_bits/8);
}

function assertIsBuffer(arg, argname) {
  argname = argname || "arg";
  assert_(Buffer.isBuffer(arg), "Type error: "+argname+" must be a buffer");
}

function assertIsNBuffer(arg, params, argname) {
  argname = argname || "arg";
  assert_(Buffer.isBuffer(arg), "Type error: "+argname+" must be a buffer");
  if (arg.length != params.N_length_bits/8)
    assert_(false, argname+" was "+arg.length+", expected "+(params.N_length_bits/8));
}

function assertIsBignum(arg) {
  assert.equal(arg.constructor.name, "BigNum");
}

/*
 * compute the intermediate value x as a hash of three buffers:
 * salt, identity, and password.  And a colon.  FOUR buffers.
 *
 *      x = H(s | H(I | ":" | P))
 *
 * params:
 *         salt (buffer)    salt
 *         I (buffer)       user identity
 *         P (buffer)       user password
 *
 * returns: x (bignum)      user secret
 */
function getx(params, salt, I, P) {
  assertIsBuffer(salt, "salt (salt)");
  assertIsBuffer(I, "identity (I)");
  assertIsBuffer(P, "password (P)");
  var hashIP = crypto.createHash(params.hash)
    .update(Buffer.concat([I, new Buffer(':'), P]))
    .digest();
  var hashX = crypto.createHash(params.hash)
    .update(salt)
    .update(hashIP)
    .digest();
  return bignum.fromBuffer(hashX);
};

/*
 * The verifier is calculated as described in Section 3 of [SRP-RFC].
 * We give the algorithm here for convenience.
 *
 * The verifier (v) is computed based on the salt (s), user name (I),
 * password (P), and group parameters (N, g).
 *
 *         x = H(s | H(I | ":" | P))
 *         v = g^x % N
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         salt (buffer)    salt
 *         I (buffer)       user identity
 *         P (buffer)       user password
 *
 * returns: buffer
 */
function computeVerifier(params, salt, I, P) {
  assertIsBuffer(salt, "salt (salt)");
  assertIsBuffer(I, "identity (I)");
  assertIsBuffer(P, "password (P)");
  var v_num = params.g.powm(getx(params, salt, I, P), params.N);
  return padToN(v_num, params);
};

/*
 * calculate the SRP-6 multiplier
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *
 * returns: bignum
 */
function getk(params) {
  var k_buf = crypto
    .createHash(params.hash)
    .update(padToN(params.N, params))
    .update(padToN(params.g, params))
    .digest();
  return bignum.fromBuffer(k_buf);
};

/*
 * Generate a random key
 *
 * params:
 *         bytes (int)      length of key (default=32)
 *         callback (func)  function to call with err,key
 *
 * returns: nothing, but runs callback with a Buffer
 */
function genKey(bytes, callback) {
  // bytes is optional
  if (arguments.length < 2) {
    callback = bytes;
    bytes = 32;
  }
  if (typeof callback !== 'function') {
    throw("Callback required");
  }
  crypto.randomBytes(bytes, function(err, buf) {
    if (err) return callback (err);
    return callback(null, buf);
  });
};

/*
 * The server key exchange message also contains the server's public
 * value (B).  The server calculates this value as B = k*v + g^b % N,
 * where b is a random number that SHOULD be at least 256 bits in length
 * and k = H(N | PAD(g)).
 *
 * Note: as the tests imply, the entire expression is mod N.
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         v (bignum)       verifier (stored)
 *         b (bignum)       server secret exponent
 *
 * returns: B (buffer)      the server public message
 */
function getB(params, k, v, b) {
  assertIsBignum(v);
  assertIsBignum(k);
  assertIsBignum(b);
  var N = params.N;
  var r = k.mul(v).add(params.g.powm(b, N)).mod(N);
  return padToN(r, params);
};

/*
 * The client key exchange message carries the client's public value
 * (A).  The client calculates this value as A = g^a % N, where a is a
 * random number that SHOULD be at least 256 bits in length.
 *
 * Note: for this implementation, we take that to mean 256/8 bytes.
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         a (bignum)       client secret exponent
 *
 * returns A (bignum)       the client public message
 */
function getA(params, a_num) {
  assertIsBignum(a_num);
  if (Math.ceil(a_num.bitLength() / 8) < 256/8) {
    console.warn("getA: client key length", a_num.bitLength(), "is less than the recommended 256");
  }
  return padToN(params.g.powm(a_num, params.N), params);
};

/*
 * getu() hashes the two public messages together, to obtain a scrambling
 * parameter "u" which cannot be predicted by either party ahead of time.
 * This makes it safe to use the message ordering defined in the SRP-6a
 * paper, in which the server reveals their "B" value before the client
 * commits to their "A" value.
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         A (Buffer)       client ephemeral public key
 *         B (Buffer)       server ephemeral public key
 *
 * returns: u (bignum)      shared scrambling parameter
 */
function getu(params, A, B) {
  assertIsNBuffer(A, params, "A");
  assertIsNBuffer(B, params, "B");
  var u_buf = crypto.createHash(params.hash)
    .update(A).update(B)
    .digest();
  return bignum.fromBuffer(u_buf);
};

/*
 * The TLS premaster secret as calculated by the client
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         salt (buffer)    salt (read from server)
 *         I (buffer)       user identity (read from user)
 *         P (buffer)       user password (read from user)
 *         a (bignum)       ephemeral private key (generated for session)
 *         B (bignum)       server ephemeral public key (read from server)
 *
 * returns: buffer
 */

function client_getS(params, k_num, x_num, a_num, B_num, u_num) {
  assertIsBignum(k_num);
  assertIsBignum(x_num);
  assertIsBignum(a_num);
  assertIsBignum(B_num);
  assertIsBignum(u_num);
  var g = params.g;
  var N = params.N;
  if (zero.ge(B_num) || N.le(B_num))
    throw new Error("invalid server-supplied 'B', must be 1..N-1");
  var S_num = B_num.sub(k_num.mul(g.powm(x_num, N))).powm(a_num.add(u_num.mul(x_num)), N).mod(N);
  return padToN(S_num, params);
};

/*
 * The TLS premastersecret as calculated by the server
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         v (bignum)       verifier (stored on server)
 *         A (bignum)       ephemeral client public key (read from client)
 *         b (bignum)       server ephemeral private key (generated for session)
 *
 * returns: bignum
 */

function server_getS(params, v_num, A_num, b_num, u_num) {
  assertIsBignum(v_num);
  assertIsBignum(A_num);
  assertIsBignum(b_num);
  assertIsBignum(u_num);
  var N = params.N;
  if (zero.ge(A_num) || N.le(A_num))
    throw new Error("invalid client-supplied 'A', must be 1..N-1");
  var S_num = A_num.mul(v_num.powm(u_num, N)).powm(b_num, N).mod(N);
  return padToN(S_num, params);
};

/*
 * Compute the shared session key K from S
 *
 * params:
 *         params (obj)     group parameters, with .N, .g, .hash
 *         S (buffer)       Session key
 *
 * returns: buffer
 */
function getK(params, S_buf) {
  assertIsNBuffer(S_buf, params, "S");
  return crypto.createHash(params.hash)
      .update(S_buf)
      .digest();
};

function getM1(params, A_buf, B_buf, S_buf) {
  assertIsNBuffer(A_buf, params, "A");
  assertIsNBuffer(B_buf, params, "B");
  assertIsNBuffer(S_buf, params, "S");
  return crypto.createHash(params.hash)
    .update(A_buf).update(B_buf).update(S_buf)
    .digest();
}

function equal(buf1, buf2) {
  // TODO: constant-time comparison. A drop in the ocean compared to our
  // non-constant-time modexp operations, but still good practice.
  return buf1.toString('hex') === buf2.toString('hex');
}

function Client(params, salt_buf, identity_buf, password_buf, secret1_buf) {
  if (!(this instanceof Client)) {
    return new Client(params, salt_buf, identity_buf, password_buf, secret1_buf);
  }
  assertIsBuffer(salt_buf, "salt (salt)");
  assertIsBuffer(identity_buf, "identity (I)");
  assertIsBuffer(password_buf, "password (P)");
  assertIsBuffer(secret1_buf, "secret1");
  this._private = { params: params,
                    k_num: getk(params),
                    x_num: getx(params, salt_buf, identity_buf, password_buf),
                    a_num: bignum.fromBuffer(secret1_buf) };
  this._private.A_buf = getA(params, this._private.a_num);
}

Client.prototype = {
  computeA: function computeA() {
    return this._private.A_buf;
  },
  setB: function setB(B_buf) {
    var p = this._private;
    var B_num = bignum.fromBuffer(B_buf);
    var u_num = getu(p.params, p.A_buf, B_buf);
    var S_buf = client_getS(p.params, p.k_num, p.x_num, p.a_num, B_num, u_num);
    p.K_buf = getK(p.params, S_buf);
    p.M1_buf = getM1(p.params, p.A_buf, B_buf, S_buf);
    p.u_num = u_num; // only for tests
    p.S_buf = S_buf; // only for tests
  },
  computeM1: function computeM1() {
    if (this._private.M1_buf === undefined)
      throw new Error("incomplete protocol");
    return this._private.M1_buf;
  },
  /*checkM2: function checkM2(M2) {
    CHECK();
  },*/
  computeK: function computeK() {
    if (this._private.K_buf === undefined)
      throw new Error("incomplete protocol");
    return this._private.K_buf;
  }
};

function Server(params, verifier_buf, secret2_buf) {
  if (!(this instanceof Server))  {
    return new Server(params, verifier_buf, secret2_buf);
  }
  assertIsBuffer(verifier_buf, "verifier");
  assertIsBuffer(secret2_buf, "secret2");
  this._private = { params: params,
                    k_num: getk(params),
                    b_num: bignum.fromBuffer(secret2_buf),
                    v_num: bignum.fromBuffer(verifier_buf) };
  this._private.B_buf = getB(params, this._private.k_num,
                             this._private.v_num, this._private.b_num);
}

Server.prototype = {
  computeB: function computeB() {
    return this._private.B_buf;
  },
  setA: function setA(A_buf) {
    var p = this._private;
    var A_num = bignum.fromBuffer(A_buf);
    var u_num = getu(p.params, A_buf, p.B_buf);
    var S_buf = server_getS(p.params, p.v_num, A_num, p.b_num, u_num);
    p.K_buf = getK(p.params, S_buf);
    p.M1_buf = getM1(p.params, A_buf, p.B_buf, S_buf);
    //p.M2_buf = XXX;
    p.u_num = u_num; // only for tests
    p.S_buf = S_buf; // only for tests
  },
  checkM1: function checkM1(clientM1_buf) {
    if (this._private.M1_buf === undefined)
      throw new Error("incomplete protocol");
    if (!equal(this._private.M1_buf, clientM1_buf))
      throw new Error("client did not use the same password");
    //return this._private.M2;
  },
  computeK: function computeK() {
    if (this._private.K_buf === undefined)
      throw new Error("incomplete protocol");
    return this._private.K_buf;
  }
};

module.exports = {
  params: require('./params'),
  genKey: genKey,
  computeVerifier: computeVerifier,
  Client: Client,
  Server: Server
};

},{"./params":84,"__browserify_Buffer":4,"assert":25,"bignum":"xttfNN","crypto":"l4eWKl"}],86:[function(require,module,exports){
var global=self;
var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


},{}],87:[function(require,module,exports){
var Buffer=require("__browserify_Buffer").Buffer;//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Buffer class to use
var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new BufferClass(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;
uuid.BufferClass = BufferClass;

module.exports = uuid;

},{"./rng":86,"__browserify_Buffer":4}]},{},[1])
;
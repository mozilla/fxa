/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var ClientApi = require('./api')
var butil = require('../crypto/butil')
var pbkdf2 = require('../crypto/pbkdf2')
var hkdf = require('../crypto/hkdf')
var tokens = require('../tokens')({ trace: function () {}})

function Client(origin) {
  this.uid = null
  this.api = new ClientApi(origin)
  this.email = null
  this.verified = false
  this.authToken = null
  this.sessionToken = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.passwordForgotToken = null
  this.kA = null
  this.wrapKb = null
  this._devices = null
  this.lang = null
  this.service = null
}

Client.Api = ClientApi

Client.prototype.setupCredentials = function (email, password) {
  this.email = email
  return pbkdf2.derive(Buffer(password), hkdf.KWE('quickStretch', email), 1000, 32)
    .then(
      function (stretch) {
        return hkdf(stretch, 'authPW', null, 32)
          .then(
            function (authPW) {
              this.authPW = authPW
              return hkdf(stretch, 'unwrapBKey', null, 32)
            }.bind(this)
          )
      }.bind(this)
    )
    .then(
      function (unwrapBKey) {
        this.unwrapBKey = unwrapBKey
        return this
      }.bind(this)
    )
}

Client.create = function (origin, email, password, options) {
  var c = new Client(origin)
  options = options || {}
  c.preVerified = options.preVerified || false
  if (options.lang) {
    c.lang = options.lang
  }
  if (options.service) {
    c.service = options.service
  }

  return c.setupCredentials(email, password)
    .then(
      function() {
        return c.create()
      }
    )
}

Client.login = function (origin, email, password) {
  var c = new Client(origin)


  return c.setupCredentials(email, password)
    .then(
      function (c) {
        return c.auth()
      }
    )
}

Client.changePassword = function (origin, email, oldPassword, newPassword) {
  var c = new Client(origin)

  return c.setupCredentials(email, oldPassword)
    .then(
      function () {
        return c.changePassword(newPassword)
        .then(
          function () {
            return c
          }
        )
      }
    )
}

Client.prototype.create = function () {
  return this.api.accountCreate(
    this.email,
    this.authPW,
    {
      preVerified: this.preVerified,
      lang: this.lang,
      service: this.service
    }
  )
  .then(
    function (a) {
      this.uid = a.uid
      return this
    }.bind(this)
  )
}

Client.prototype._clear = function () {
  this.authToken = null
  this.sessionToken = null
  this.srpSession = null
  this.accountResetToken = null
  this.keyFetchToken = null
  this.passwordForgotToken = null
  this.kA = null
  this.wrapKb = null
  this._devices = null
}

Client.prototype.stringify = function () {
  return JSON.stringify(this)
}

Client.prototype.auth = function () {
  return this.api.accountLoginAndGetKeys(this.email, this.authPW)
    .then(
      function (data) {
        this.uid = data.uid
        this.sessionToken = data.sessionToken
        this.keyFetchToken = data.keyFetchToken
        this.verified = data.verified
        return this
      }.bind(this)
    )
}

Client.prototype.login = function () {
  return this.auth()
}

Client.prototype.destroySession = function () {
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
  return p
}

Client.prototype.verifyEmail = function (code) {
  return this.api.recoveryEmailVerifyCode(this.uid, code)
}

Client.prototype.emailStatus = function () {
  var o = this.sessionToken ? P(null) : this.login()
  return o.then(
      function () {
        return this.api.recoveryEmailStatus(this.sessionToken)
      }.bind(this)
    )
}

Client.prototype.requestVerifyEmail = function () {
  var o = this.sessionToken ? P(null) : this.login()
  return o.then(
    function () {
      return this.api.recoveryEmailResendCode(this.sessionToken, this.service)
    }.bind(this)
  )
}

Client.prototype.sign = function (publicKey, duration) {
  var o = this.sessionToken ? P(null) : this.login()
  return o.then(
      function () {
        return this.api.certificateSign(this.sessionToken, publicKey, duration)
      }.bind(this)
    )
    .then(
    function (x) {
      return x.cert
    }
  )
}

Client.prototype.changePassword = function (newPassword) {
  return this.api.passwordChangeStart(this.email, this.authPW)
    .then(
      function (json) {
        this.keyFetchToken = json.keyFetchToken
        this.passwordChangeToken = json.passwordChangeToken
        return this.keys()
      }.bind(this)
    )
    .then(
      function (keys) {
        return this.setupCredentials(this.email, newPassword)
      }.bind(this)
    )
    .then(
      function () {
        this.wrapKb = butil.xorBuffers(this.kB, this.unwrapBKey)
        return this.api.passwordChangeFinish(this.passwordChangeToken, this.authPW, this.wrapKb)
      }.bind(this)
    )
    .then(
      function () {
        this._clear()
      }.bind(this)
    )
}

Client.prototype.keys = function () {
  var o = this.keyFetchToken ? P(null) : this.login()
  return o.then(
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
        this.kB = keys.kB = butil.xorBuffers(this.wrapKb, this.unwrapBKey)
        return keys
      }.bind(this),
      function (err) {
        if (err && err.errno !== 104) { this.keyFetchToken = null }
        throw err
      }.bind(this)
    )
}

Client.prototype.devices = function () {
  var o = this.sessionToken ? P(null) : this.login()
  return o.then(
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
}

Client.prototype.destroyAccount = function () {
  return this.api.accountDestroy(this.email, this.authPW)
    .then(this._clear.bind(this))
}

Client.prototype.forgotPassword = function () {
  this._clear()
  return this.api.passwordForgotSendCode(this.email)
    .then(
      function (x) {
        this.passwordForgotToken = x.passwordForgotToken
      }.bind(this)
    )
}

Client.prototype.reforgotPassword = function () {
  return this.api.passwordForgotResendCode(this.passwordForgotToken, this.email)
}

Client.prototype.verifyPasswordResetCode = function (code) {
  return this.api.passwordForgotVerifyCode(this.passwordForgotToken, code)
    .then(
      function (result) {
        this.accountResetToken = result.accountResetToken
      }.bind(this)
    )
}

Client.prototype.resetPassword = function (newPassword) {
  if (!this.accountResetToken) {
    throw new Error("call verifyPasswordResetCode before calling resetPassword");
  }
  // this will generate a new wrapKb on the server
  return this.setupCredentials(this.email, newPassword)
    .then(
      function (bundle) {
        return this.api.accountReset(
          this.accountResetToken,
          this.authPW
        )
      }.bind(this)
    )
}

//TODO recovery methods, session status/destroy

module.exports = Client

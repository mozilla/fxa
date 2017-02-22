/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = config => {
  var P = require('../../lib/promise')
  const ClientApi = require('./api')(config)
  var butil = require('../../lib/crypto/butil')
  var pbkdf2 = require('../../lib/crypto/pbkdf2')
  var hkdf = require('../../lib/crypto/hkdf')
  const tokens = require('../../lib/tokens')({ trace: function () {}}, config)

  function Client(origin) {
    this.uid = null
    this.authAt = 0
    this.api = new ClientApi(origin)
    this.email = null
    this.emailVerified = false
    this.authToken = null
    this.sessionToken = null
    this.accountResetToken = null
    this.keyFetchToken = null
    this.passwordForgotToken = null
    this.kA = null
    this.wrapKb = null
    this.options = {}
  }

  Client.Api = ClientApi

  Client.prototype.setupCredentials = function (email, password) {
    return P.resolve().then(() => {
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
    })
  }

  Client.create = function (origin, email, password, options) {
    var c = new Client(origin)
    c.options = options || {}

    return c.setupCredentials(email, password)
      .then(
        function() {
          return c.create()
        }
      )
  }

  Client.login = function (origin, email, password, opts) {
    var c = new Client(origin)

    return c.setupCredentials(email, password)
      .then(
        function (c) {
          return c.auth(opts)
        }
      )
  }

  Client.changePassword = function (origin, email, oldPassword, newPassword, headers) {
    var c = new Client(origin)

    return c.setupCredentials(email, oldPassword)
      .then(
        function () {
          return c.changePassword(newPassword, headers)
          .then(
            function () {
              return c
            }
          )
        }
      )
  }

  Client.createAndVerify = function (origin, email, password, mailbox, options) {
    return Client.create(origin, email, password, options)
      .then(
        function (client) {
          return mailbox.waitForCode(email)
            .then(
              function (code) {
                return client.verifyEmail(code, options)
              }
            )
            .then(
              function () {
                // clear the post verified email, if one was sent
                if (options && options.service === 'sync') {
                  return mailbox.waitForEmail(email)
                }
              }
            )
            .then(
              function () {
                return client
              }
            )
        }
      )
  }

  Client.loginAndVerify = function (origin, email, password, mailbox, options) {
    if (! options ) {
      options = {}
    }

    options.keys = options.keys || true

    return Client.login(origin, email, password, options)
      .then(
        function (client) {
          return mailbox.waitForCode(email)
            .then(
              function (code) {
                return client.verifyEmail(code, options)
              }
            )
            .then(
              function () {
                return client
              }
            )
        }
      )
  }

  Client.prototype.create = function () {
    return this.api.accountCreate(
      this.email,
      this.authPW,
      this.options
    )
    .then(
      function (a) {
        this.uid = a.uid
        this.authAt = a.authAt
        this.sessionToken = a.sessionToken
        this.keyFetchToken = a.keyFetchToken
        this.device = a.device
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
  }

  Client.prototype.stringify = function () {
    return JSON.stringify(this)
  }

  Client.prototype.auth = function (opts) {
    return this.api.accountLogin(this.email, this.authPW, opts)
      .then(
        function (data) {
          this.uid = data.uid
          this.sessionToken = data.sessionToken
          this.keyFetchToken = data.keyFetchToken || null
          this.emailVerified = data.verified
          this.authAt = data.authAt
          this.device = data.device
          this.verificationReason = data.verificationReason
          this.verificationMethod = data.verificationMethod
          this.verified = data.verified
          return this
        }.bind(this)
      )
  }

  Client.prototype.login = function (opts) {
    return this.auth(opts)
  }

  Client.prototype.destroySession = function () {
    var p = P.resolve(null)
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

  Client.prototype.verifyEmail = function (code, options) {
    return this.api.recoveryEmailVerifyCode(this.uid, code, options)
  }

  Client.prototype.emailStatus = function () {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.recoveryEmailStatus(this.sessionToken)
      }.bind(this)
    )
  }

  Client.prototype.requestVerifyEmail = function () {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.recoveryEmailResendCode(this.sessionToken, this.options)
      }.bind(this)
    )
  }

  Client.prototype.sign = function (publicKey, duration, locale, options) {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.certificateSign(this.sessionToken, publicKey, duration, locale, options)
      }.bind(this)
    )
    .then(
      function (x) {
        return x.cert
      }
    )
  }

  Client.prototype.changePassword = function (newPassword, headers, sessionToken) {
    return this.api.passwordChangeStart(this.email, this.authPW, headers)
      .then(
        function (json) {
          this.keyFetchToken = json.keyFetchToken
          this.passwordChangeToken = json.passwordChangeToken
          return this.keys()
        }.bind(this)
      )
      .then(
        function (/* keys */) {
          return this.setupCredentials(this.email, newPassword)
        }.bind(this)
      )
      .then(
        function () {
          this.wrapKb = butil.xorBuffers(this.kB, this.unwrapBKey)
          return this.api.passwordChangeFinish(this.passwordChangeToken, this.authPW, this.wrapKb, headers, sessionToken)
        }.bind(this)
      )
      .then(
        function (res) {
          this._clear()

          // Update to new tokens if needed
          this.sessionToken = res.sessionToken ? res.sessionToken : this.sessionToken
          this.authAt = res.authAt ? res.authAt : this.authAt
          this.keyFetchToken = res.keyFetchToken ? res.keyFetchToken : this.keyFetchToken

          return res
        }.bind(this)
      )
  }

  Client.prototype.keys = function () {
    var o = this.keyFetchToken ? P.resolve(null) : this.login()
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
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.accountDevices(this.sessionToken)
      }.bind(this)
    )
  }

  Client.prototype.updateDevice = function (info) {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.accountDevice(this.sessionToken, info)
      }.bind(this)
    )
    .then(
      function (device) {
        if (! this.device || this.device.id === device.id) {
          this.device = device
        }
        return device
      }.bind(this)
    )
  }

  Client.prototype.destroyDevice = function (id) {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.deviceDestroy(this.sessionToken, id)
      }.bind(this)
    )
    .then(
      function () {
        delete this.sessionToken
      }.bind(this)
    )
  }

  Client.prototype.sessionStatus = function () {
    var o = this.sessionToken ? P.resolve(null) : this.login()
    return o.then(
      function () {
        return this.api.sessionStatus(this.sessionToken)
      }.bind(this)
    )
  }

  Client.prototype.accountProfile = function (oauthToken) {
    if (oauthToken) {
      return this.api.accountProfile(null, { Authorization: 'Bearer ' + oauthToken })
    } else {
      var o = this.sessionToken ? P.resolve(null) : this.login()
      return o.then(
        function () {
          return this.api.accountProfile(this.sessionToken)
        }.bind(this)
      )
    }
  }

  Client.prototype.destroyAccount = function () {
    return this.api.accountDestroy(this.email, this.authPW)
      .then(this._clear.bind(this))
  }

  Client.prototype.forgotPassword = function (lang) {

    return this.api.passwordForgotSendCode(this.email, this.options, lang)
      .then(
        function (x) {
          this.passwordForgotToken = x.passwordForgotToken
        }.bind(this)
      )
  }

  Client.prototype.reforgotPassword = function () {
    return this.api.passwordForgotResendCode(this.passwordForgotToken, this.email)
  }

  Client.prototype.verifyPasswordResetCode = function (code, headers, options) {
    return this.api.passwordForgotVerifyCode(this.passwordForgotToken, code, headers, options)
      .then(
        function (result) {
          this.accountResetToken = result.accountResetToken
        }.bind(this)
      )
  }

  Client.prototype.lockAccount = function () {
    return this.api.accountLock(this.email, this.authPW)
  }

  Client.prototype.resendAccountUnlockCode = function (lang) {
    return this.api.accountUnlockResendCode(this.email, this.options, lang)
  }

  Client.prototype.verifyAccountUnlockCode = function (uid, code) {
    return this.api.accountUnlockVerifyCode(uid, code)
  }

  Client.prototype.resetPassword = function (newPassword, headers, options) {
    if (! this.accountResetToken) {
      throw new Error('call verifyPasswordResetCode before calling resetPassword')
    }
    // this will generate a new wrapKb on the server
    return this.setupCredentials(this.email, newPassword)
      .then(
        function (/* bundle */) {
          return this.api.accountReset(
            this.accountResetToken,
            this.authPW,
            headers,
            options
          )
            .then(function (response) {
              // Update to the new verified tokens
              this.sessionToken = response.sessionToken
              this.keyFetchToken = response.keyFetchToken

              return response
            })

        }.bind(this)
      )
  }

  return Client
}

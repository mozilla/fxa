/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')

var hawk = require('hawk')
var P = require('p-promise')
var request = require('request')

var tokens = require('../tokens')({ trace: function() {}})

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

ClientApi.prototype.rawPasswordAccountReset = function (email, oldPassword, newPassword, resetWrapKb) {
  return this.doRequest(
    'POST',
    this.baseURL + '/raw_password/account/reset',
    null,
    {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword,
      resetWrapKb: resetWrapKb
    }
  )
}

ClientApi.heartbeat = function (origin) {
  return (new ClientApi(origin)).doRequest('GET', origin + '/__heartbeat__')
}

module.exports = ClientApi

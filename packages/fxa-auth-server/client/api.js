var hawk = require('hawk')
var P = require('p-promise')
var request = require('request')

var models = require('../models')({}, {}, {})
var tokens = models.tokens

function ClientApi(origin) {
  this.origin = origin
}

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

function doRequest(method, url, token, payload) {
  var d = P.defer()
  var headers = {}
  if (token) {
    headers.Authorization = hawkHeader(token, method, url, payload)
  }
  request(
    {
      url: url,
      method: method,
      headers: headers,
      json: payload || true
    },
    function (err, res, body) {
      if (err || body.error) {
        d.reject(err || body)
      }
      else {
        d.resolve(body)
      }
    }
  )
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
ClientApi.prototype.accountCreate = function (email, verifier, salt, params) {
  return doRequest(
    'POST',
    this.origin + '/account/create',
    null,
    {
      email: email,
      verifier: verifier,
      salt: salt,
      params: params
    }
  )
}

ClientApi.prototype.accountDevices = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'GET',
          this.origin + '/account/devices',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountKeys = function (keyFetchTokenHex) {
  return tokens.KeyFetchToken.fromHex(keyFetchTokenHex)
    .then(
      function (token) {
        return doRequest(
          'GET',
          this.origin + '/account/keys',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountRecoveryMethods = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'GET',
          this.origin + '/account/recovery_methods',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountRecoveryMethodsSendCode = function (sessionTokenHex, email) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'POST',
          this.origin + '/account/recovery_methods/send_code',
          token,
          {
            email: email
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountRecoveryMethodsVerifyCode = function (email, code) {
  return doRequest(
    'POST',
    this.origin + '/account/recovery_methods/verify_code',
    null,
    {
      email: email,
      code: code
    }
  )
}

ClientApi.prototype.accountReset = function (accountResetTokenHex, bundle, params) {
  return tokens.AccountResetToken.fromHex(accountResetTokenHex)
    .then(
      function (token) {
        return doRequest(
          'GET',
          this.origin + '/account/reset',
          token,
          {
            bundle: bundle,
            params: params
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.certificateSign = function (sessionTokenHex, publicKey, duration) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'POST',
          this.origin + '/certificate/sign',
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
  return doRequest(
    'POST',
    this.origin + '/get_random_bytes'
  )
}

ClientApi.prototype.passwordChangeAuthStart = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'POST',
          this.origin + '/password/change/auth/start',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.passwordChangeAuthFinish = function (srpToken, A, M) {
  return doRequest(
    'POST',
    this.origin + '/password/change/auth/finish',
    null,
    {
      srpToken: srpToken,
      A: A,
      M: M
    }
  )
}

ClientApi.prototype.passwordForgotSendCode = function (email) {
  return doRequest(
    'POST',
    this.origin + '/password/forgot/send_code',
    null,
    {
      email: email
    }
  )
}

ClientApi.prototype.passwordForgotVerifyCode = function (forgotPasswordToken, code) {
  return doRequest(
    'POST',
    this.origin + '/password/forgot/verify_code',
    null,
    {
      code: code,
      forgotPasswordToken: forgotPasswordToken
    }
  )
}

ClientApi.prototype.sessionAuthStart = function (email) {
  return doRequest(
    'POST',
    this.origin + '/session/auth/start',
    null,
    {
      email: email
    }
  )
}

ClientApi.prototype.sessionAuthFinish = function (srpToken, A, M) {
  return doRequest(
    'POST',
    this.origin + '/session/auth/finish',
    null,
    {
      srpToken: srpToken,
      A: A,
      M: M
    }
  )
}

ClientApi.prototype.sessionStatus = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'GET',
          this.origin + '/session/status',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.sessionDestroy = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return doRequest(
          'POST',
          this.origin + '/session/destroy',
          token
        )
      }.bind(this)
    )
}

module.exports = ClientApi

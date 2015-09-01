/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')

var hawk = require('hawk')
var P = require('../../lib/promise')
var request = require('request')

var tokens = require('../../lib/tokens')({ trace: function() {}})

util.inherits(ClientApi, EventEmitter)
function ClientApi(origin) {
  EventEmitter.call(this)
  this.origin = origin
  this.baseURL = origin + '/v1'
  this.timeOffset = 0
}

ClientApi.prototype.Token = tokens

function hawkHeader(token, method, url, payload, offset) {
  var verify = {
    credentials: token
  }
  if (payload) {
    verify.contentType = 'application/json'
    verify.payload = JSON.stringify(payload)
  }
  if (offset) {
    verify.localtimeOffsetMsec = offset
  }
  return hawk.client.header(url, method, verify).field
}

ClientApi.prototype.doRequest = function (method, url, token, payload, headers) {
  var d = P.defer()
  if (typeof headers === 'undefined') {
    headers = {}
  }
  // We do a shallow clone to avoid tainting the caller's copy of `headers`.
  headers = JSON.parse(JSON.stringify(headers))
  if (token && !headers.Authorization) {
    headers.Authorization = hawkHeader(token, method, url, payload, this.timeOffset)
  }
  var options = {
    url: url,
    method: method,
    headers: headers,
    json: payload || true
  }
  if (headers['accept-language'] === undefined) { delete headers['accept-language']}
  this.emit('startRequest', options)
  request(options, function (err, res, body) {
    if (res && res.headers.timestamp) {
      // Record time skew
      this.timeOffset = Date.now() - parseInt(res.headers.timestamp, 10) * 1000
    }

    this.emit('endRequest', options, err, res)
    if (err || body.error || res.statusCode !== 200) {
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
ClientApi.prototype.accountCreate = function (email, authPW, options) {
  options = options || {}
  var url = this.baseURL + '/account/create' + getQueryString(options)
  return this.doRequest(
    'POST',
    url,
    null,
    {
      email: email,
      authPW: authPW.toString('hex'),
      preVerified: options.preVerified || undefined,
      service: options.service || undefined,
      redirectTo: options.redirectTo || undefined,
      resume: options.resume || undefined,
      preVerifyToken: options.preVerifyToken || undefined
    },
    {
      'accept-language': options.lang
    }
  )
}

ClientApi.prototype.accountLogin = function (email, authPW, opts) {
  if (!opts) {
    opts = { keys: true }
  }
  return this.doRequest(
    'POST',
    this.baseURL + '/account/login' + getQueryString(opts),
    null,
    {
      email: email,
      authPW: authPW.toString('hex'),
      service: opts.service || undefined,
      reason: opts.reason || undefined
    },
    {
      'accept-language': opts.lang
    }
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

ClientApi.prototype.accountStatus = function (uid, sessionTokenHex) {
  if (sessionTokenHex) {
    return tokens.SessionToken.fromHex(sessionTokenHex)
      .then(
        function (token) {
          return this.doRequest(
            'GET',
            this.baseURL + '/account/status',
            token
          )
        }.bind(this)
      )
  }
  else if (uid) {
    return this.doRequest(
      'GET',
      this.baseURL + '/account/status?uid=' + uid
    )
  }
  else {
    // for testing the error response only
    return this.doRequest('GET', this.baseURL + '/account/status')
  }
}

ClientApi.prototype.accountReset = function (accountResetTokenHex, authPW, headers) {
  return tokens.AccountResetToken.fromHex(accountResetTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/account/reset',
          token,
          {
            authPW: authPW.toString('hex')
          },
          headers
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountDestroy = function (email, authPW) {
  return this.doRequest(
    'POST',
    this.baseURL + '/account/destroy',
    null,
    {
      email: email,
      authPW: authPW.toString('hex')
    }
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

ClientApi.prototype.recoveryEmailResendCode = function (sessionTokenHex, options) {
  options = options || {}
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/recovery_email/resend_code',
          token,
          {
            service: options.service || undefined,
            redirectTo: options.redirectTo || undefined,
            resume: options.resume || undefined
          }
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

ClientApi.prototype.certificateSign = function (sessionTokenHex, publicKey, duration, locale) {
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
          },
          {
            'accept-language': locale
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

ClientApi.prototype.passwordChangeStart = function (email, oldAuthPW, headers) {
  return this.doRequest(
    'POST',
    this.baseURL + '/password/change/start',
    null,
    {
      email: email,
      oldAuthPW: oldAuthPW.toString('hex')
    },
    headers
  )
}

ClientApi.prototype.passwordChangeFinish = function (passwordChangeTokenHex, authPW, wrapKb, headers) {
  return tokens.PasswordChangeToken.fromHex(passwordChangeTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/change/finish',
          token,
          {
            authPW: authPW.toString('hex'),
            wrapKb: wrapKb.toString('hex')
          },
          headers
        )
      }.bind(this)
    )
}


ClientApi.prototype.passwordForgotSendCode = function (email, options, lang) {
  options = options || {}
  var headers = {}
  if (lang) {
    headers = {
      'accept-language': lang
    }
  }
  return this.doRequest(
    'POST',
    this.baseURL + '/password/forgot/send_code' + getQueryString(options),
    null,
    {
      email: email,
      service: options.service || undefined,
      redirectTo: options.redirectTo || undefined,
      resume: options.resume || undefined
    },
    headers
  )
}

ClientApi.prototype.passwordForgotResendCode = function (passwordForgotTokenHex, email, options) {
  options = options || {}
  return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/forgot/resend_code' + getQueryString(options),
          token,
          {
            email: email,
            service: options.service || undefined,
            redirectTo: options.redirectTo || undefined,
            resume: options.resume || undefined
          }
        )
      }.bind(this)
    )
}

ClientApi.prototype.passwordForgotVerifyCode = function (passwordForgotTokenHex, code, headers) {
  return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'POST',
          this.baseURL + '/password/forgot/verify_code',
          token,
          {
            code: code
          },
          headers
        )
      }.bind(this)
    )
}

ClientApi.prototype.passwordForgotStatus = function (passwordForgotTokenHex) {
  return tokens.PasswordForgotToken.fromHex(passwordForgotTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'GET',
          this.baseURL + '/password/forgot/status',
          token
        )
      }.bind(this)
    )
}

ClientApi.prototype.accountLock = function (email, authPW) {
  return this.doRequest(
    'POST',
    this.baseURL + '/account/lock',
    null,
    {
      email: email,
      authPW: authPW.toString('hex')
    }
  )
}

ClientApi.prototype.accountUnlockResendCode = function (email, options, lang) {
  options = options || {}
  var headers = {}
  if (lang) {
    headers = {
      'accept-language': lang
    }
  }
  return this.doRequest(
    'POST',
    this.baseURL + '/account/unlock/resend_code',
    null,
    {
      email: email,
      service: options.service || undefined,
      redirectTo: options.redirectTo || undefined,
      resume: options.resume || undefined
    },
    headers
  )
}

ClientApi.prototype.accountUnlockVerifyCode = function (uid, code) {
  return this.doRequest(
    'POST',
    this.baseURL + '/account/unlock/verify_code',
    null,
    {
      uid: uid,
      code: code
    }
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

ClientApi.prototype.sessionStatus = function (sessionTokenHex) {
  return tokens.SessionToken.fromHex(sessionTokenHex)
    .then(
      function (token) {
        return this.doRequest(
          'GET',
          this.baseURL + '/session/status',
          token
        )
      }.bind(this)
    )
}

ClientApi.heartbeat = function (origin) {
  return (new ClientApi(origin)).doRequest('GET', origin + '/__heartbeat__')
}

function getQueryString (options) {
  var qs = '?'

  if (options.keys) {
    qs += 'keys=true&'
  }

  if (options.serviceQuery) {
    qs += 'service=' + options.serviceQuery
  }

  return qs
}

module.exports = ClientApi

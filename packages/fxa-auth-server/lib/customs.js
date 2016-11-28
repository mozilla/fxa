/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('./promise')
var Pool = require('./pool')
var config = require('../config')
var localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
  supportedLanguages: config.get('i18n').supportedLanguages,
  defaultLanguage: config.get('i18n').defaultLanguage
})

module.exports = function (log, error) {

  // Perform a deep clone of payload and remove user password.
  function sanitizePayload(payload) {
    // Once we move to Node4, use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    var clonePayload = JSON.parse(JSON.stringify(payload))

    if (clonePayload.authPW) {
      delete clonePayload.authPW
    }
    if (clonePayload.oldAuthPW) {
      delete clonePayload.oldAuthPW
    }

    return clonePayload
  }

  function Customs(url) {
    if (url === 'none') {
      this.pool = {
        post: function () { return P.resolve({ block: false })},
        close: function () {}
      }
    }
    else {
      this.pool = new Pool(url, { timeout: 1000 })
    }
  }

  Customs.prototype.check = function (request, email, action) {
    log.trace({ op: 'customs.check', email: email, action: action })
    return this.pool.post(
      '/check',
      {
        ip: request.app.clientAddress,
        email: email,
        action: action,
        headers: request.headers,
        query: request.query,
        payload: sanitizePayload(request.payload)
      }
    )
    .then(
      function (result) {
        if (result.block) {
          // log a flow event that user got blocked.
          request.emitMetricsEvent('customs.blocked')

          var unblock = !!result.unblock
          if (result.retryAfter) {
            // create a localized retryAfterLocalized value from retryAfter, for example '713' becomes '12 minutes'.
            var retryAfterLocalized = localizeTimestamp.format(Date.now() + (result.retryAfter * 1000),
                request.headers['accept-language'])

            throw error.tooManyRequests(result.retryAfter, retryAfterLocalized, unblock)
          } else {
            throw error.requestBlocked(unblock)
          }
        }
        if (result.suspect) {
          request.app.isSuspiciousRequest = true
        }
      },
      function (err) {
        log.error({ op: 'customs.check.1', email: email, action: action, err: err })
        // If this happens, either:
        // - (1) the url in config doesn't point to a real customs server
        // - (2) the customs server returned an internal server error
        // Either way, allow the request through so we fail open.
      }
    )
  }

  Customs.prototype.checkAuthenticated = function (action, ip, uid) {
    log.trace({ op: 'customs.checkAuthenticated', action: action,  uid: uid })

    return this.pool.post(
      '/checkAuthenticated',
      {
        action: action,
        ip: ip,
        uid: uid
      }
    )
    .then(
      function (result) {
        if (result.block) {
          if (result.retryAfter) {
            throw error.tooManyRequests(result.retryAfter)
          }
          throw error.requestBlocked()
        }
      },
      function (err) {
        log.error({ op: 'customs.checkAuthenticated', uid: uid, action: action, err: err })
        // If this happens, either:
        // - (1) the url in config doesn't point to a real customs server
        // - (2) the customs server returned an internal server error
        // Either way, allow the request through so we fail open.
      }
    )
  }

  Customs.prototype.flag = function (ip, info) {
    var email = info.email
    var errno = info.errno || error.ERRNO.UNEXPECTED_ERROR
    log.trace({ op: 'customs.flag', ip: ip, email: email, errno: errno })
    return this.pool.post(
      '/failedLoginAttempt',
      {
        ip: ip,
        email: email,
        errno: errno
      }
    )
    .then(
      // There's no useful information in the HTTP response, discard it.
      function () {},
      function (err) {
        log.error({ op: 'customs.flag.1', email: email, err: err })
        // If this happens, either:
        // - (1) the url in config doesn't point to a real customs server
        // - (2) the customs server returned an internal server error
        // Either way, allow the request through so we fail open.
      }
    )
  }

  Customs.prototype.reset = function (email) {
    log.trace({ op: 'customs.reset', email: email })
    return this.pool.post(
      '/passwordReset',
      {
        email: email
      }
    )
    .then(
      // There's no useful information in the HTTP response, discard it.
      function () {},
      function (err) {
        log.error({ op: 'customs.reset.1', email: email, err: err })
        // If this happens, either:
        // - (1) the url in config doesn't point to a real customs server
        // - (2) the customs server returned an internal server error
        // Either way, allow the request through so we fail open.
      }
    )
  }

  Customs.prototype.close = function () {
    return this.pool.close()
  }

  return Customs
}

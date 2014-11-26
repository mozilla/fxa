/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var P = require('./promise')
 var Pool = require('./pool')

 module.exports = function (log, error) {

  function Customs(url, db) {
    this.db = db
    if (url === 'none') {
      this.pool = {
        post: function () { return P({ block: false })},
        close: function () {}
      }
    }
    else {
      this.pool = new Pool(url, { timeout: 1000 })
    }
  }

  Customs.prototype.check = function (ip, email, action) {
    log.trace({ op: 'customs.check', email: email, action: action })
    return this.pool.post(
      '/check',
      {
        ip: ip,
        email: email,
        action: action,
      }
    )
    .then(
      function (result) {
        if (result.block) {
          throw error.tooManyRequests(result.retryAfter)
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

  Customs.prototype.flag = function (ip, account) {
    var email = account.email
    log.trace({ op: 'customs.flag', ip: ip, email: email })
    return this.pool.post(
      '/failedLoginAttempt',
      {
        ip: ip,
        email: email
      }
    )
    .then(
      (function (result) {
        if (result.lockout) {
          return this.db.lockAccount(account)
        }
      }).bind(this)
    )
    .then(
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

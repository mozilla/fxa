/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions')

// Keep track of events related to just IP addresses
module.exports = function (limits, now) {

  now = now || Date.now

  var ERRNO_THROTTLED = 114

  function IpRecord() {
    this.lf = []
    this.as = []
  }

  IpRecord.parse = function (object) {
    var rec = new IpRecord()
    object = object || {}
    rec.bk = object.bk // timestamp when the account was blocked
    rec.lf = object.lf || []  // timestamps and errnos when failed login attempts occurred
    rec.as = object.as || []  // timestamps when account status check occurred
    rec.rl = object.rl  // timestamp when the account was rate-limited
    return rec
  }

  IpRecord.prototype.getMinLifetimeMS = function () {
    return Math.max(
      limits.blockIntervalMs,
      limits.ipRateLimitIntervalMs,
      limits.ipRateLimitBanDurationMs
    )
  }

  IpRecord.prototype.isOverBadLogins = function () {
    this.trimBadLogins(now())
    return this.lf.reduce(function (prev, curr) {
      return prev + (limits.badLoginErrnoWeights[curr.e] || 1)
    }, 0) > limits.maxBadLoginsPerIp
  }

  IpRecord.prototype.addBadLogin = function (info) {
    info = info || {}
    var t = now()
    var errno = info.errno || 999
    this.trimBadLogins(t)
    this.lf.push({ t: t, e: Number(errno) })
  }

  IpRecord.prototype.isOverAccountStatusCheck = function () {
    this.trimAccountStatus(now())
    return this.as.length > limits.maxAccountStatusCheck
  }

  IpRecord.prototype.trimBadLogins = function (now) {
    if (this.lf.length === 0) { return }
    // lf is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxBadLoginsPerIp + 1
    var i = this.lf.length - 1
    var n = 0
    var login = this.lf[i]
    while (login.t > (now - limits.ipRateLimitIntervalMs) && n <= limits.maxBadLoginsPerIp) {
      login = this.lf[--i]
      n++
      if (i === -1) {
        break
      }
    }
    this.lf = this.lf.slice(i + 1)
  }

  IpRecord.prototype.trimAccountStatus = function (now) {
    if (this.as.length === 0) { return }
    // "as" is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxAccountStatusCheck + 1

    var i = this.as.length - 1
    var n = 0
    var hit = this.as[i]
    while (hit > (now - limits.ipRateLimitIntervalMs) && n <= limits.maxAccountStatusCheck) {
      hit = this.as[--i]
      n++
    }
    this.as = this.as.slice(i + 1)
  }

  IpRecord.prototype.addAccountStatusCheck = function () {
    this.trimAccountStatus(now())
    this.as.push(now())
  }

  IpRecord.prototype.shouldBlock = function () {
    return this.isBlocked() || this.isRateLimited()
  }

  IpRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < limits.blockIntervalMs))
  }

  IpRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < limits.ipRateLimitBanDurationMs))
  }

  IpRecord.prototype.block = function () {
    this.bk = now()
  }

  IpRecord.prototype.rateLimit = function () {
    this.rl = now()
    this.as = []
  }

  IpRecord.prototype.retryAfter = function () {
    var rateLimitAfter = Math.floor(((this.rl || 0) + limits.ipRateLimitBanDurationMs - now()) / 1000)
    var banAfter = Math.floor(((this.bk || 0) + limits.blockIntervalMs - now()) / 1000)
    return Math.max(0, rateLimitAfter, banAfter)
  }

  IpRecord.prototype.update = function (action) {
    // Don't block email-sending on IP address alone.
    if (actions.isEmailSendingAction(action)) {
      return 0
    }

    // Increment account-status-check count and throttle if needed
    if (actions.isAccountStatusAction(action)) {
      this.addAccountStatusCheck()
      if (this.isOverAccountStatusCheck()){
        // If you do more checks while rate-limited, this can extend the ban.
        this.rateLimit()
      }
    }

    // Increment password-check count and throttle if needed
    if (actions.isPasswordCheckingAction(action)) {
      if (this.isRateLimited() || this.isOverBadLogins()) {
        // If we block an attempt, it still counts as a bad login.
        this.addBadLogin({ errno: ERRNO_THROTTLED })
      }
      if (this.isOverBadLogins()) {
        // If you attempt more logins while rate-limited, this can extend the ban.
        this.rateLimit()
      }
    }

    return this.retryAfter()
  }

  return IpRecord
}

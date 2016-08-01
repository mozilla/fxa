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
    // IPs are limited based on the number of unique email
    // addresses they access.  Take the highest-weighted
    // bad-login event for each email address.
    var total = 0
    var seen = {}
    this.lf.forEach(function(info) {
      var incr = limits.badLoginErrnoWeights[info.e] || 1
      if (info.u in seen && seen[info.u] < incr) {
        total -= seen[info.u]
        seen[info.u] = incr
      }
      total += incr
    })
    return total > limits.maxBadLoginsPerIp
  }

  IpRecord.prototype.addBadLogin = function (info) {
    info = info || {}
    var t = now()
    var email = info.email || ''
    var errno = info.errno || 999
    this.trimBadLogins(t)
    this.lf.push({ t: t, e: Number(errno), u: email })
  }

  IpRecord.prototype.trimBadLogins = function (now) {
    this.lf = this._trim(now, this.lf, limits.maxBadLoginsPerIp)
  }

  IpRecord.prototype.isOverAccountStatusCheck = function () {
    this.trimAccountStatus(now())
    // Limit based on number of unique emails checked by this IP.
    var count = 0
    var seen = {}
    this.as.forEach(function(info) {
      if (!(info.u in seen)) {
        count += 1
        seen[info.u] = true
      }
    })
    return count > limits.maxAccountStatusCheck
  }

  IpRecord.prototype.addAccountStatusCheck = function (info) {
    info = info || {}
    var t = now()
    var email = info.email || ''
    this.trimAccountStatus(t)
    this.as.push({ t: t, u: email })
  }

  IpRecord.prototype.trimAccountStatus = function (now) {
    this.as = this._trim(now, this.as, limits.maxAccountStatusCheck)
  }

  IpRecord.prototype._trim = function (now, items, maxUnique) {
    if (items.length === 0) { return items }
    // the list is naturally ordered from oldest to newest,
    // and we only need to keep data for up to maxUnique + 1 unique emails.
    var i = items.length - 1
    var n = 0
    var seen = {}
    var item = items[i]
    while (item.t > (now - limits.ipRateLimitIntervalMs) && n <= maxUnique) {
      if (!(item.u in seen)) {
        seen[item.u] = true
        n++
      }
      item = items[--i]
      if (i === -1) {
        break
      }
    }
    return items.slice(i + 1)
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

  IpRecord.prototype.update = function (action, email) {
    // ip block is explicit, no escape hatches
    if (this.isBlocked()) {
      return this.retryAfter()
    }

    // ip might be rate-limited

    // Don't block email-sending on IP address alone.
    if (actions.isEmailSendingAction(action)) {
      return 0
    }

    // Increment account-status-check count and throttle if needed
    if (actions.isAccountStatusAction(action)) {
      this.addAccountStatusCheck({ email: email })
      if (this.isOverAccountStatusCheck()){
        // If you do more checks while rate-limited, this can extend the ban.
        this.rateLimit()
      }
    }

    // Increment password-check count and throttle if needed
    if (actions.isPasswordCheckingAction(action)) {
      if (this.isRateLimited() || this.isOverBadLogins()) {
        // If we block an attempt, it still counts as a bad login.
        this.addBadLogin({ email: email, errno: ERRNO_THROTTLED })
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

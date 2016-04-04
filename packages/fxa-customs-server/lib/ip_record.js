/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions')

// Keep track of events related to just IP addresses
module.exports = function (BLOCK_INTERVAL_MS, IP_RATE_LIMIT_INTERVAL_MS, IP_RATE_LIMIT_BAN_DURATION_MS, MAX_BAD_LOGINS_PER_IP, MAX_ACCOUNT_STATUS_CHECK, now) {

  now = now || Date.now

  function IpRecord() {
    this.lf = []
    this.as = []
  }

  IpRecord.parse = function (object) {
    var rec = new IpRecord()
    object = object || {}
    rec.bk = object.bk // timestamp when the account was blocked
    rec.lf = object.lf || []  // timestamps when failed login attempts occurred
    rec.as = object.as || []  // timestamps when account status check occurred
    rec.rl = object.rl  // timestamp when the account was rate-limited
    return rec
  }

  IpRecord.prototype.isOverBadLogins = function () {
    this.trimBadLogins(now())
    return this.lf.length > MAX_BAD_LOGINS_PER_IP
  }

  IpRecord.prototype.isOverAccountStatusCheck = function () {
    this.trimAccountStatus(now())
    return this.as.length > MAX_ACCOUNT_STATUS_CHECK
  }

  IpRecord.prototype.trimBadLogins = function (now) {
    if (this.lf.length === 0) { return }
    // lf is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_BAD_LOGINS_PER_IP + 1
    var i = this.lf.length - 1
    var n = 0
    var login = this.lf[i]
    while (login > (now - IP_RATE_LIMIT_INTERVAL_MS) && n <= MAX_BAD_LOGINS_PER_IP) {
      login = this.lf[--i]
      n++
    }
    this.lf = this.lf.slice(i + 1)
  }

  IpRecord.prototype.trimAccountStatus = function (now) {
    if (this.as.length === 0) { return }
    // "as" is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_ACCOUNT_STATUS_CHECK + 1

    var i = this.as.length - 1
    var n = 0
    var hit = this.as[i]
    while (hit > (now - IP_RATE_LIMIT_INTERVAL_MS) && n <= MAX_ACCOUNT_STATUS_CHECK) {
      hit = this.as[--i]
      n++
    }
    this.as = this.as.slice(i + 1)
  }

  IpRecord.prototype.addBadLogin = function () {
    this.trimBadLogins(now())
    this.lf.push(now())
  }

  IpRecord.prototype.addAccountStatusCheck = function () {
    this.trimAccountStatus(now())
    this.as.push(now())
  }

  IpRecord.prototype.shouldBlock = function () {
    return this.isBlocked() || this.isRateLimited()
  }

  IpRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  IpRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < IP_RATE_LIMIT_BAN_DURATION_MS))
  }

  IpRecord.prototype.block = function () {
    this.bk = now()
  }

  IpRecord.prototype.rateLimit = function () {
    this.rl = now()
    this.as = []
  }

  IpRecord.prototype.retryAfter = function () {
    var rateLimitAfter = Math.floor(((this.rl || 0) + IP_RATE_LIMIT_BAN_DURATION_MS - now()) / 1000)
    var banAfter = Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000)
    return Math.max(0, rateLimitAfter, banAfter)
  }

  IpRecord.prototype.update = function (action) {
    // Increment account status check and throttle if needed
    if (actions.isAccountStatusAction(action)) {
      this.addAccountStatusCheck()
      if (this.isOverAccountStatusCheck() && !this.isRateLimited()){
        this.rateLimit()
      }
    }

    // Throttle password-checking attempts if too many failed logins.
    // Rate-limited login attempts still count towards your quota.
    if (actions.isPasswordCheckingAction(action)) {
      if (this.isRateLimited() || this.isOverBadLogins()) {
        // attempt a password-checking action leads to a bad attempt
        this.addBadLogin()
        // we also re-rate-limit this attempt.
        // this extends the duration of the ban.
        this.rateLimit()
      }
    }

    return this.retryAfter()
  }

  return IpRecord
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events tied to just email addresses
module.exports = function (RATE_LIMIT_INTERVAL_MS, BLOCK_INTERVAL_MS, MAX_EMAILS, BAD_LOGIN_LOCKOUT, now) {

  now = now || Date.now

  var EMAIL_ACTION = {
    accountCreate            : true,
    recoveryEmailResendCode  : true,
    passwordForgotSendCode   : true,
    passwordForgotResendCode : true,
  }

  function isEmailSendingAction(action) {
    return EMAIL_ACTION[action]
  }

  function EmailRecord() {
    this.xs = []
    this.lf = []
  }

  EmailRecord.parse = function (object) {
    var rec = new EmailRecord()
    object = object || {}
    rec.bk = object.bk       // timestamp when the account was banned
    rec.rl = object.rl       // timestamp when the account was rate-limited
    rec.xs = object.xs || [] // timestamps when emails were sent
    rec.lf = object.lf || [] // timestamps when a login failure occurred
    rec.pr = object.pr       // timestamp of the last password reset
    return rec
  }

  EmailRecord.prototype.isOverEmailLimit = function () {
    this.trimHits(now())
    return this.xs.length > MAX_EMAILS
  }

  EmailRecord.prototype.isWayOverBadLogins = function () {
    this.trimBadLogins(now())
    return this.lf.length > BAD_LOGIN_LOCKOUT
  }

  EmailRecord.prototype.trimHits = function (now) {
    if (this.xs.length === 0) { return }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_EMAILS + 1

    var i = this.xs.length - 1
    var n = 0
    var hit = this.xs[i]
    while (hit > (now - RATE_LIMIT_INTERVAL_MS) && n <= MAX_EMAILS) {
      hit = this.xs[--i]
      n++
    }
    this.xs = this.xs.slice(i + 1)
  }

  EmailRecord.prototype.trimBadLogins = function (now) {
    if (this.lf.length === 0) { return }
    // lf is naturally ordered from oldest to newest
    // and we only need to keep up to BAD_LOGIN_LOCKOUT + 1

    var i = this.lf.length - 1
    var n = 0
    var login = this.lf[i]
    while (login > (now - RATE_LIMIT_INTERVAL_MS) && n <= BAD_LOGIN_LOCKOUT) {
      login = this.lf[--i]
      n++
    }
    this.lf = this.lf.slice(i + 1)
  }

  EmailRecord.prototype.addHit = function () {
    this.xs.push(now())
  }

  EmailRecord.prototype.addBadLogin = function () {
    this.trimBadLogins(now())
    this.lf.push(now())
  }

  EmailRecord.prototype.shouldBlock = function () {
    return this.isRateLimited() || this.isBlocked()
  }

  EmailRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < RATE_LIMIT_INTERVAL_MS))
  }

  EmailRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  EmailRecord.prototype.block = function () {
    this.bk = now()
  }

  EmailRecord.prototype.rateLimit = function () {
    this.rl = now()
    this.xs = []
  }

  EmailRecord.prototype.passwordReset = function () {
    this.pr = now()
  }

  EmailRecord.prototype.retryAfter = function () {
    var rateLimitAfter = Math.floor(((this.rl || 0) + RATE_LIMIT_INTERVAL_MS - now()) / 1000)
    var banAfter = Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000)
    return Math.max(0, rateLimitAfter, banAfter)
  }

  EmailRecord.prototype.update = function (action) {
    // Reject immediately if they've been explicitly blocked.
    if (this.isBlocked()) {
      return this.retryAfter()
    }

    // For email-sending actions, we may need to rate-limit.
    if (isEmailSendingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter()
      }
      this.addHit()
      if (this.isOverEmailLimit()) {
        // They're not over the limit, rate-limit and tell them to retry.
        this.rateLimit()
        return this.retryAfter()
      }
    }

    // Everything else is allowed through.
    return 0
  }

  return EmailRecord
}

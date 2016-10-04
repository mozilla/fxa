/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var actions = require('./actions')

// Keep track of events tied to just email addresses
module.exports = function (limits, now) {

  now = now || Date.now

  function EmailRecord() {
    this.vc = []
    this.xs = []
  }

  EmailRecord.parse = function (object) {
    var rec = new EmailRecord()
    object = object || {}
    rec.bk = object.bk       // timestamp when the account was banned
    rec.rl = object.rl       // timestamp when the account was rate-limited
    rec.vc = object.vc || [] // timestamps when code verifications happened
    rec.xs = object.xs || [] // timestamps when emails were sent
    rec.pr = object.pr       // timestamp of the last password reset
    return rec
  }

  EmailRecord.prototype.getMinLifetimeMS = function () {
    return Math.max(
      limits.rateLimitIntervalMs,
      limits.blockIntervalMs
    )
  }

  EmailRecord.prototype.isOverEmailLimit = function () {
    this.trimHits(now())
    return this.xs.length > limits.maxEmails
  }

  EmailRecord.prototype.trimHits = function (now) {
    if (this.xs.length === 0) { return }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxEmails + 1

    var i = this.xs.length - 1
    var n = 0
    var hit = this.xs[i]
    while (hit > (now - limits.rateLimitIntervalMs) && n <= limits.maxEmails) {
      hit = this.xs[--i]
      n++
    }
    this.xs = this.xs.slice(i + 1)
  }

  EmailRecord.prototype.addHit = function () {
    this.xs.push(now())
  }

  EmailRecord.prototype.isOverVerifyCodes = function () {
    this.trimVerifyCodes(now())
    return this.vc.length > limits.maxVerifyCodes
  }

  EmailRecord.prototype.trimVerifyCodes = function (now) {
    if (this.vc.length === 0) { return }
    // vc is naturally ordered from oldest to newest
    // and we only need to keep up to limits.maxVerifyCodes + 1

    var i = this.vc.length - 1
    var n = 0
    var hit = this.vc[i]
    while (hit > (now - limits.rateLimitIntervalMs) && n <= limits.maxVerifyCodes) {
      hit = this.vc[--i]
      n++
    }
    this.vc = this.vc.slice(i + 1)
  }

  EmailRecord.prototype.addVerifyCode = function () {
    this.vc.push(now())
  }

  EmailRecord.prototype.shouldBlock = function () {
    return this.isRateLimited() || this.isBlocked()
  }

  EmailRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < limits.rateLimitIntervalMs))
  }

  EmailRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < limits.blockIntervalMs))
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
    var rateLimitAfter = Math.floor(((this.rl || 0) + limits.rateLimitIntervalMs - now()) / 1000)
    var banAfter = Math.floor(((this.bk || 0) + limits.blockIntervalMs - now()) / 1000)
    return Math.max(0, rateLimitAfter, banAfter)
  }

  EmailRecord.prototype.update = function (action) {
    // Reject immediately if they've been explicitly blocked.
    if (this.isBlocked()) {
      return this.retryAfter()
    }

    // For code-checking actions, we may need to rate-limit.
    if (actions.isCodeVerifyingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter()
      }
      this.addVerifyCode()
      if (this.isOverVerifyCodes()) {
        // They're now over the limit, rate-limit and tell them to retry.
        this.rateLimit()
        return this.retryAfter()
      }
    }

    // For email-sending actions, we may need to rate-limit.
    if (actions.isEmailSendingAction(action)) {
      // If they're already being blocked then don't count any more hits,
      // and tell them to retry.
      if (this.shouldBlock()) {
        return this.retryAfter()
      }
      this.addHit()
      if (this.isOverEmailLimit()) {
        // They're now over the limit, rate-limit and tell them to retry.
        this.rateLimit()
        return this.retryAfter()
      }
    }

    // Everything else is allowed through.
    return 0
  }

  return EmailRecord
}

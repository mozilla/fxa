/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events tied to just email addresses
module.exports = function (RATE_LIMIT_INTERVAL_MS, BLOCK_INTERVAL_MS, MAX_EMAILS, now) {

  now = now || Date.now

  var EMAIL_ACTIONS = [
    'accountCreate',
    'recoveryEmailResendCode',
    'passwordForgotSendCode',
    'passwordForgotResendCode'
  ]

  function EmailRecord() {
    this.xs = []
  }

  EmailRecord.parse = function (object) {
    var rec = new EmailRecord()
    object = object || {}
    rec.bk = object.bk       // timestamp when the account was banned
    rec.rl = object.rl       // timestamp when the account was rate-limited
    rec.xs = object.xs || [] // timestamps when emails were sent
    rec.pr = object.pr       // timestamp of the last password reset
    return rec
  }

  EmailRecord.prototype.isOverEmailLimit = function () {
    this.trimHits(now())
    return this.xs.length > MAX_EMAILS
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

  EmailRecord.prototype.addHit = function () {
    this.xs.push(now())
  }

  EmailRecord.prototype.isBlocked = function () {
    var rateLimited = !!(this.rl && (now() - this.rl < RATE_LIMIT_INTERVAL_MS))
    var banned = !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
    return rateLimited || banned
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
    if (EMAIL_ACTIONS.indexOf(action) === -1) {
      return 0
    }

    if (!this.isBlocked()) {
      // only count hits while aren't already suspended
      this.addHit()

      if (this.isOverEmailLimit()) {
        this.rateLimit()
      }
      else {
        return 0
      }
    }
    return this.retryAfter()
  }
  return EmailRecord
}

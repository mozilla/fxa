/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (BLOCK_INTERVAL_MS, MAX_EMAILS, now) {

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
    rec.bk = object.bk
    rec.xs = object.xs || []
    rec.pr = object.pr
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
    while (hit > (now - BLOCK_INTERVAL_MS) && n <= MAX_EMAILS) {
      hit = this.xs[--i]
      n++
    }
    this.xs = this.xs.slice(i + 1)
  }

  EmailRecord.prototype.addHit = function () {
    this.xs.push(now())
  }

  EmailRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  EmailRecord.prototype.block = function () {
    this.bk = now()
    this.xs = []
  }

  EmailRecord.prototype.passwordReset = function () {
    this.pr = Date.now()
  }

  EmailRecord.prototype.retryAfter = function () {
    return Math.max(0, Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000))
  }

  EmailRecord.prototype.update = function (action) {
    if (EMAIL_ACTIONS.indexOf(action) === -1) { return 0 }

    if (!this.isBlocked()) {
      // only count hits while we aren't already blocking
      this.addHit()

      if (this.isOverEmailLimit()) {
        this.block()
      }
      else {
        return 0
      }
    }
    return this.retryAfter()
  }
  return EmailRecord
}

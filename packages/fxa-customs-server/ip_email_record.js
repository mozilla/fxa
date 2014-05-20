/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events tied to both email and IP addresses
module.exports = function (BLOCK_INTERVAL_MS, MAX_BAD_LOGINS, now) {

  now = now || Date.now

  var IP_EMAIL_ACTIONS = [
    'accountLogin',
    'accountDestroy',
    'passwordChange'
  ]

  function IpEmailRecord() {
    this.xs = []
  }

  IpEmailRecord.parse = function (object) {
    var rec = new IpEmailRecord()
    object = object || {}
    rec.bk = object.bk       // timestamp when the account was blocked
    rec.xs = object.xs || [] // timestamps when emails were sent
    return rec
  }

  IpEmailRecord.prototype.isOverBadLogins = function () {
    this.trimBadLogins(now())
    return this.xs.length > MAX_BAD_LOGINS
  }

  IpEmailRecord.prototype.addBadLogin = function () {
    this.trimBadLogins(now())
    this.xs.push(now())
  }

  IpEmailRecord.prototype.trimBadLogins = function (now) {
    if (this.xs.length === 0) { return }
    // xs is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_BAD_LOGINS + 1

    // start at the end and go backwards until login is old
    // or we have
    var i = this.xs.length - 1
    var n = 0
    var login = this.xs[i]
    while (login > (now - BLOCK_INTERVAL_MS) && n <= MAX_BAD_LOGINS) {
      login = this.xs[--i]
      n++
    }
    this.xs = this.xs.slice(i + 1)
  }

  IpEmailRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  IpEmailRecord.prototype.block = function () {
    this.bk = now()
    this.xs = []
  }

  IpEmailRecord.prototype.unblockIfReset = function (resetAt) {
    if (resetAt > this.bk) {
      this.xs = []
      delete this.bk
    }
  }

  IpEmailRecord.prototype.retryAfter = function () {
    return Math.max(0, Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000))
  }

  IpEmailRecord.prototype.update = function (action) {
    if (IP_EMAIL_ACTIONS.indexOf(action) === -1) {
      return 0
    }

    if (!this.isBlocked()) {
      if (this.isOverBadLogins()) {
        this.block()
      }
      else {
        return 0
      }
    }
    return this.retryAfter()
  }

  return IpEmailRecord
}

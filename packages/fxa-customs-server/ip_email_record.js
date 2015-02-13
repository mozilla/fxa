/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events tied to both email and IP addresses
module.exports = function (RATE_LIMIT_INTERVAL_MS, MAX_BAD_LOGINS, now) {

  now = now || Date.now

  var IP_EMAIL_ACTION = {
    accountLogin   : true,
    accountDestroy : true,
    passwordChange : true,
  }

  function isIpEmailAction(action) {
    return IP_EMAIL_ACTION[action]
  }

  function IpEmailRecord() {
    this.lf = []
  }

  IpEmailRecord.parse = function (object) {
    var rec = new IpEmailRecord()
    object = object || {}
    rec.rl = object.rl       // timestamp when the account was rate-limited
    rec.lf = object.lf || [] // timestamps when a login failure occurred
    return rec
  }

  IpEmailRecord.prototype.isOverBadLogins = function () {
    this.trimBadLogins(now())
    return this.lf.length > MAX_BAD_LOGINS
  }

  IpEmailRecord.prototype.addBadLogin = function () {
    this.trimBadLogins(now())
    this.lf.push(now())
  }

  IpEmailRecord.prototype.trimBadLogins = function (now) {
    if (this.lf.length === 0) { return }
    // lf is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_BAD_LOGINS + 1

    var i = this.lf.length - 1
    var n = 0
    var login = this.lf[i]
    while (login > (now - RATE_LIMIT_INTERVAL_MS) && n <= MAX_BAD_LOGINS) {
      login = this.lf[--i]
      n++
    }
    this.lf = this.lf.slice(i + 1)
  }

  IpEmailRecord.prototype.shouldBlock = function () {
    return this.isRateLimited()
  }

  IpEmailRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < RATE_LIMIT_INTERVAL_MS))
  }

  IpEmailRecord.prototype.rateLimit = function () {
    this.rl = now()
    this.lf = []
  }

  IpEmailRecord.prototype.unblockIfReset = function (resetAt) {
    if (resetAt > this.rl) {
      this.lf = []
      delete this.rl
      return true
    }
    return false
  }

  IpEmailRecord.prototype.retryAfter = function () {
    return Math.max(0, Math.floor(((this.rl || 0) + RATE_LIMIT_INTERVAL_MS - now()) / 1000))
  }

  IpEmailRecord.prototype.update = function (action) {
    // if this is not an Ip/Email Action, then all ok (no block)
    if ( !isIpEmailAction(action) ) {
      return 0
    }

    if ( this.shouldBlock() ) {
      // if already blocked, then return a block
      return this.retryAfter()
    }

    // if over the bad logins, rate limit them and return the block
    if (this.isOverBadLogins()) {
      this.rateLimit()
      return this.retryAfter()
    }

    // no block, not yet over limit
    return 0
  }

  return IpEmailRecord
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events related to just IP addresses
module.exports = function (BLOCK_INTERVAL_MS, RATE_LIMIT_INTERVAL_MS, MAX_ACCOUNT_STATUS_CHECK, now) {

  now = now || Date.now

  var ACCOUNT_STATUS_ACTION = {
    accountStatusCheck       : true
  }

  function IpRecord() {}

  function isAccountStatusAction(action) {
    return ACCOUNT_STATUS_ACTION[action]
  }

  IpRecord.parse = function (object) {
    var rec = new IpRecord()
    object = object || {}
    rec.bk = object.bk // timestamp when the account was blocked
    rec.as = object.as || []  // timestamps when account status check occurred
    rec.rl = object.rl  // timestamp when the account was rate-limited
    return rec
  }

  IpRecord.prototype.isOverAccountStatusCheck = function () {
    return this.as.length > MAX_ACCOUNT_STATUS_CHECK
  }

  IpRecord.prototype.trimAccountStatus = function (now) {
    if (this.as.length === 0) { return }
    // "as" is naturally ordered from oldest to newest
    // and we only need to keep up to MAX_ACCOUNT_STATUS_CHECK + 1

    var i = this.as.length - 1
    var n = 0
    var hit = this.as[i]
    while (hit > (now - RATE_LIMIT_INTERVAL_MS) && n <= MAX_ACCOUNT_STATUS_CHECK) {
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
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  IpRecord.prototype.isRateLimited = function () {
    return !!(this.rl && (now() - this.rl < RATE_LIMIT_INTERVAL_MS))
  }

  IpRecord.prototype.block = function () {
    this.bk = now()
  }

  IpRecord.prototype.rateLimit = function () {
    this.rl = now()
    this.as = []
  }

  IpRecord.prototype.retryAfter = function () {
    var rateLimitAfter = Math.floor(((this.rl || 0) + RATE_LIMIT_INTERVAL_MS - now()) / 1000)
    var banAfter = Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000)
    return Math.max(0, rateLimitAfter, banAfter)
  }

  IpRecord.prototype.update = function (action) {
    // Increment account status check and throttle if needed
    if (isAccountStatusAction(action)) {
      this.addAccountStatusCheck()
      if (this.isOverAccountStatusCheck() && !this.isRateLimited()){
        this.rateLimit()
      }
    }

    return this.retryAfter()
  }

  return IpRecord
}

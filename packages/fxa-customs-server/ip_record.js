/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Keep track of events related to just IP addresses
module.exports = function (BLOCK_INTERVAL_MS, now) {

  now = now || Date.now

  function IpRecord() {}

  IpRecord.parse = function (object) {
    var rec = new IpRecord()
    object = object || {}
    rec.bk = object.bk // timestamp when the account was blocked
    return rec
  }

  IpRecord.prototype.isBlocked = function () {
    return !!(this.bk && (now() - this.bk < BLOCK_INTERVAL_MS))
  }

  IpRecord.prototype.block = function () {
    this.bk = now()
  }

  IpRecord.prototype.retryAfter = function () {
    return Math.max(0, Math.floor(((this.bk || 0) + BLOCK_INTERVAL_MS - now()) / 1000))
  }

  IpRecord.prototype.update = function () {
    return this.retryAfter()
  }

  return IpRecord
}

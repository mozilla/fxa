/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (BLOCK_INTERVAL_MS, INVALID_AGENT_INTERVAL_MS) {

  function IpRecord() {}

  IpRecord.parse = function (object) {
    var rec = new IpRecord()
    object = object || {}
    rec.ba = object.ba
    rec.bk = object.bk
    return rec
  }

  function isBadAgent(agent) {
    return false // TODO
  }

  IpRecord.prototype.isBlocked = function () {
    return !!(this.bk && (Date.now() - this.bk < BLOCK_INTERVAL_MS))
  }

  IpRecord.prototype.block = function () {
    this.bk = Date.now()
  }

  IpRecord.prototype.retryAfter = function () {
    if (!this.isBlocked()) { return 0 }
    return Math.floor((this.bk + BLOCK_INTERVAL_MS - Date.now()) / 1000)
  }

  IpRecord.prototype.update = function (agent) {
    if (isBadAgent(agent)) {
      if (Date.now() - this.ba < INVALID_AGENT_INTERVAL_MS) {
        this.block()
      }
      this.ba = Date.now()
    }
    return this.retryAfter()
  }

  return IpRecord
}

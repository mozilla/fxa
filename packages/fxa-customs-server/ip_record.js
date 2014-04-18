/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (INVALID_AGENT_INTERVAL_MS) {

  INVALID_AGENT_INTERVAL_MS = 1000 * 60

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
    return !!(this.bk && (Date.now() - this.bk < INVALID_AGENT_INTERVAL_MS))
  }

  IpRecord.prototype.block = function () {
    this.bk = Date.now()
  }

  IpRecord.prototype.update = function (agent) {
    if (isBadAgent(agent)) {
      if (Date.now() - this.ba < INVALID_AGENT_INTERVAL_MS) {
        this.block()
      }
      this.ba = Date.now()
    }

  }

  return IpRecord
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


module.exports = function (log) {
  function LogStats() {
    this.log = log
  }

  LogStats.prototype.mem = function (usage) {
    this.log.info(usage)
  }

  LogStats.prototype.request = function (event) {
    this.log.info(
      {
        code: event.statusCode,
        path: event.path,
        ms: event.responseTime
      }
    )
  }

  return LogStats
}

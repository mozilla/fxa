/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (os) {

  function Stats(backend) {
    this.hostname = os.hostname()
    this.pid = process.pid
    this.backend = backend
  }

  Stats.prototype.mem = function (usage) {
    this.backend.mem(this.hostname, this.pid, usage)
  }

  Stats.prototype.request = function (event) {
    this.backend.request(this.hostname, this.pid, event)
  }

  return Stats
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var os = require('os')

var Stats = require('./stats')(os)

Stats.getBackend = function (type, log) {
  var Backend = null
  if (type === 'heka') {
    Backend = require('./heka')(require('heka'))
  }
  else if (type === 'statsd') {
    Backend = require('./statsd')(require('node-statsd').StatsD)
  }
  else if (type === 'log') {
    Backend = require('./log')(log)
  }
  else {
    Backend = require('./null')()
  }
  return Backend
}

module.exports = Stats

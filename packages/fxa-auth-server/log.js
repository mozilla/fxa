/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var bunyan = require('bunyan')

module.exports = function (config) {
  var logStreams = [
    {
      type: 'rotating-file',
      level: config.log.level,
      path: config.log.path,
      period: config.log.period,
      count: config.log.count
    },
    {
      type: 'raw',
      level: 'trace',
      stream: new bunyan.RingBuffer({ limit: 100 })
    }
  ]

  if (config.env !== 'production') {
    logStreams.push({ stream: process.stdout, level: 'trace' })
  }

  var log = bunyan.createLogger(
    {
      name: 'picl-idp',
      streams: logStreams
    }
  )

  log.info(config, "starting config")

  return log
}

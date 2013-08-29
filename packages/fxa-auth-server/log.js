/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Domain = require('domain')
var inherits = require('util').inherits
var Logger = require('bunyan')

function Overdrive(options) {
  Logger.call(this, options)
}
inherits(Overdrive, Logger)

Overdrive.prototype.begin = function (op, request) {
  var domain = Domain.active
  if (domain) {
    domain.add(request)
    request.app.traced = []
  }
  this.trace({ op: op })
}

Overdrive.prototype.trace = function () {
  if (this._level <= Logger.TRACE && Domain.active) {
    var arg0 = arguments[0]
    if (typeof(arg0) === 'object') {
      var request = Domain.active.members[0]
      arg0.rid = arg0.rid || (request && request.id)
      if (request) {
        request.app.traced.push(arg0)
      }
    }
  }
  return Logger.prototype.trace.apply(this, arguments)
}

module.exports = function (config) {
  var logStreams = [
    {
      name: 'file',
      type: 'rotating-file',
      level: config.log.level,
      path: config.log.path,
      period: config.log.period,
      count: config.log.count
    }
  ]

  if (config.env !== 'production') {
    logStreams.push({ name:'console', stream: process.stdout, level: 'trace' })
  }

  var log = new Overdrive(
    {
      name: 'picl-idp',
      streams: logStreams
    }
  )

  log.info(config, "starting config")

  return log
}

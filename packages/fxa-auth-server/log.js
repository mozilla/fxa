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

function unbuffer(object) {
  var keys = Object.keys(object)
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    if (Buffer.isBuffer(x)) {
      object[keys[i]] = x.toString('hex')
    }
  }
}

Overdrive.prototype.trace = function () {
  if (this._level <= Logger.TRACE) {
    var arg0 = arguments[0]
    if (typeof(arg0) === 'object') {
      unbuffer(arg0)
      var request = Domain.active && Domain.active.members[0]
      arg0.rid = arg0.rid || (request && request.id)
      if (request) {
        request.app.traced.push(arg0)
      }
    }
  }
  return Logger.prototype.trace.apply(this, arguments)
}

module.exports = function (level) {
  var logStreams = [{ stream: process.stderr, level: level }]

  var log = new Overdrive(
    {
      name: 'fxa-auth-server',
      streams: logStreams
    }
  )

  return log
}

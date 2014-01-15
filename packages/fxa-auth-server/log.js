/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Domain = require('domain')
var util = require('util')
var Logger = require('bunyan')

function Overdrive(options) {
  Logger.call(this, options)
}
util.inherits(Overdrive, Logger)

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


// Log a security-related event.
// These get annotated with as much info as we can about the request,
// e.g. the originating IP and target user account.  The basic structure
// of the logged object is:
//
//   {
//      security: true,
//      event: <name-of-event>,
//      remoteAddressChain: [<client ip>, <proxy1>, ..., <proxyN>],
//      rid: <request-id>,
//      uid: <target-account-uid>,
//      <event-specific-fields>
//   }
//
Overdrive.prototype.security = function (info) {
  var request = Domain.active && Domain.active.members[0]
  info.security = true
  if (!info.event) {
    this.error({ op: 'log.security', msg: 'missing event name', err: info })
    info.event = 'unknown'
  }
  if (request) {
    info.remoteAddressChain = request.app.remoteAddressChain;
    if (!info.rid) {
        info.rid = request.id;
    }
    if (!info.uid) {
      // Intuit the target account uid as best we can.
      if (request.auth && request.auth.credentials) {
        info.uid = request.auth.credentials.uid
      } else if (request.payload && request.payload.uid) {
        info.uid = request.payload.uid
      }
    }
  }
  unbuffer(info)
  return this.info(info)
}

module.exports = function (level) {
  var logStreams = [{ stream: process.stderr, level: level }]

  var log = new Overdrive(
    {
      name: 'fxa-auth-server',
      streams: logStreams
    }
  )

  Object.keys(console).forEach(
    function (key) {
      console[key] = function () {
        var json = { op: 'console', message: util.format.apply(null, arguments) }
        if(log[key]) {
          log[key](json)
        }
        else {
          log.warn(json)
        }
      }
    }
  )

  return log
}

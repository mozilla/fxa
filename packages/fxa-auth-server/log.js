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
  return object
}

Overdrive.prototype.trace = function () {
  // TODO if this is a performance burden reintroduce the level check
  // otherwise this is valuable data for debugging in the log.summary
  var arg0 = arguments[0]
  if (typeof(arg0) === 'object') {
    unbuffer(arg0)
    var request = Domain.active && Domain.active.members[0]
    arg0.rid = arg0.rid || (request && request.id)
    if (request) {
      request.app.traced.push(arg0)
    }
  }

  return Logger.prototype.trace.apply(this, arguments)
}

Overdrive.prototype.event = function (name, data) {
  var e = {
    event: name,
    data: unbuffer(data)
  }
  process.stdout.write(JSON.stringify(e) + '\n')
}

Overdrive.prototype.stat = function (stats) {
  stats.op = 'stat'
  this.info(stats)
}

Overdrive.prototype.summary = function (request, response) {
  if (request.method === 'options') { return }
  var payload = request.payload || {}
  var query = request.query || {}
  var line = {
    op: 'request.summary',
    code: (response.isBoom) ? response.output.statusCode : response.statusCode,
    errno: response.errno || 0,
    rid: request.id,
    path: request.path,
    lang: request.app.acceptLanguage,
    agent: request.headers['user-agent'],
    remoteAddressChain: request.app.remoteAddressChain,
    t: Date.now() - request.info.received
  }
  line.uid = (request.auth && request.auth.credentials) ?
    request.auth.credentials.uid :
    payload.uid || query.uid
  line.service = payload.service || query.service
  line.redirectTo = payload.redirectTo || query.redirectTo
  line.keys = query.keys
  line.email = payload.email || query.email

  if (line.code >= 500) {
    line.trace = request.app.traced
    line.stack = response.stack
    this.error(unbuffer(line), response.message)
  }
  else {
    this.info(unbuffer(line))
  }
}

module.exports = function (level, name) {
  var logStreams = [{ stream: process.stderr, level: level }]
  name = name || 'fxa-auth-server'

  var log = new Overdrive(
    {
      name: name,
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')
var mozlog = require('mozlog')

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

function Lug(options) {
  EventEmitter.call(this)
  this.name = options.name || 'fxa-auth-server'
  mozlog.config({
    app: this.name,
    level: options.level,
    stream: process.stderr
  })
  this.logger = mozlog()
}
util.inherits(Lug, EventEmitter)

Lug.prototype.trace = function (data) {
  this.logger.debug(data.op, data)
}

Lug.prototype.error = function (data) {
  this.logger.error(data.op, data)
}

Lug.prototype.fatal = function (data) {
  this.logger.critical(data.op, data)
}

Lug.prototype.warn = function (data) {
  this.logger.warn(data.op, data)
}

Lug.prototype.info = function (data) {
  this.logger.info(data.op, data)
}

Lug.prototype.begin = function (op, request) {
  this.logger.debug(op)
}

Lug.prototype.event = function (name, data) {
  var e = {
    event: name,
    data: unbuffer(data)
  }
  process.stdout.write(JSON.stringify(e) + '\n')
}

Lug.prototype.stat = function (stats) {
  this.logger.info('stat', stats)
}

Lug.prototype.summary = function (request, response) {
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
    accountRecreated: request.app.accountRecreated,
    t: Date.now() - request.info.received
  }
  line.uid = (request.auth && request.auth.credentials) ?
    request.auth.credentials.uid :
    payload.uid || query.uid || '00'
  line.service = payload.service || query.service
  line.reason = payload.reason || query.reason
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
  var log = new Lug(
    {
      name: name,
      level: level
    }
  )

  process.stdout.on(
    'error',
    function (err) {
      if (err.code === 'EPIPE') {
        log.emit('error', err)
      }
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

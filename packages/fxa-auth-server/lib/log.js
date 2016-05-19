/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')
var mozlog = require('mozlog')

var logConfig = require('../config').get('log')
var StatsDCollector = require('./metrics/statsd')
var metricsContext = require('./metrics/context')

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
    stream: options.stderr || process.stderr,
    fmt: options.fmt
  })
  this.logger = mozlog()

  this.stdout = options.stdout || process.stdout

  this.statsd = new StatsDCollector(this.logger)
  this.statsd.init()
}
util.inherits(Lug, EventEmitter)

Lug.prototype.trace = function (data) {
  this.logger.debug(data.op, data)
}

Lug.prototype.error = function (data) {
  // If the error object contains an email address,
  // lift it into top-level fields so that our
  // PII-scrubbing tool is able to find it.
  if (data.err && data.err.email) {
    if (!data.email) {
      data.email = data.err.email
    }
    data.err.email = null
  }
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

Lug.prototype.event = function (name, request, data) {
  var e = {
    event: name,
    data: unbuffer(data)
  }
  e.data.metricsContext = metricsContext.add({},
    request.payload.metricsContext, request.headers.dnt === '1')
  this.stdout.write(JSON.stringify(e) + '\n')
}

Lug.prototype.activityEvent = function (event, request, data) {
  if (! data || ! data.uid) {
    return this.error({ op: 'log.activityEvent', data: data })
  }

  var info = metricsContext.add({
    event: event,
    userAgent: request.headers['user-agent']
  }, request.payload.metricsContext, request.headers.dnt === '1')
  optionallySetService(info, request)

  Object.keys(data).forEach(function (key) {
    info[key] = data[key]
  })

  this.logger.info('activityEvent', info)
  this.statsd.write(info)
}

function optionallySetService (data, request) {
  // don't overwrite service if it is specified in metricsContext
  if (data.service) {
    return
  }

  try {
    data.service = request.payload.service || request.query.service
  } catch (err) {
    // request.payload and request.query are not always set in the unit tests
  }
}

Lug.prototype.increment = function(event) {
  this.statsd.write({
    event: event
  })
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
    payload.uid || query.uid || response.uid || '00'
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

Lug.prototype.timing = function(name, timing, tags) {
  this.statsd.timing(name, timing, tags)
}

Lug.prototype.histogram = function(name, value, tags) {
  this.statsd.histogram(name, value, tags)
}

Lug.prototype.close = function() {
  return this.statsd.close()
}

module.exports = function (level, name, options) {
  options = options || {}
  options.name = name
  options.level = level
  options.fmt = logConfig.fmt
  var log = new Lug(options)

  log.stdout.on(
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EventEmitter = require('events').EventEmitter
var util = require('util')
var mozlog = require('mozlog')
var config = require('../config')
var logConfig = config.get('log')
var P = require('./promise')
var StatsDCollector = require('./metrics/statsd')

var ALWAYS_ACTIVITY_FLOW_EVENTS = {
  // These activity events are always flow events
  'account.confirmed': true,
  'account.created': true,
  'account.login': true,
  'account.verified': true
}

var ACTIVITY_FLOW_EVENTS = Object.keys(ALWAYS_ACTIVITY_FLOW_EVENTS)
  .reduce(function (events, event) {
    events[event] = true
    return events
  }, {
    // These activity events are flow events when there is a flowId
    'account.keyfetch': true,
    'account.login.sentUnblockCode': true,
    'account.login.confirmedUnblockCode': true,
    'account.signed': true
  })

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

Lug.prototype.close = function() {
  return this.statsd.close()
}

// Expose the standard error/warn/info/debug/etc log methods.

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

// Expose some statsd helpers directly on the logger object.

Lug.prototype.increment = function(event) {
  this.statsd.write({
    event: event
  })
}

Lug.prototype.stat = function (stats) {
  this.logger.info('stat', stats)
}

Lug.prototype.timing = function(name, timing, tags) {
  this.statsd.timing(name, timing, tags)
}

Lug.prototype.histogram = function(name, value, tags) {
  this.statsd.histogram(name, value, tags)
}


// Log a request summary line.
// This gets called once for each compelted request.
// See https://mana.mozilla.org/wiki/display/CLOUDSERVICES/Logging+Standard
// for a discussion of this format and why it's used.

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
    payload.uid || query.uid || response.uid ||
    (response.source && response.source.uid) || '00'
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


// Broadcast an event to attached services, such as sync.
// In production, these events are read from stdout
// and broadcast to relying services over SNS/SQS.

Lug.prototype.notifyAttachedServices = function (name, request, data) {
  return request.gatherMetricsContext({})
    .then(
      metricsContextData => {
        var e = {
          event: name,
          data: unbuffer(data)
        }
        e.data.metricsContext = metricsContextData
        this.stdout.write(JSON.stringify(e) + '\n')
      }
    )
}

// Log an activity metrics event.
// These events indicate key points at which a particular
// user has interacted with the service.

Lug.prototype.activityEvent = function (event, request, data) {
  if (! data || ! data.uid) {
    this.error({ op: 'log.activityEvent', data: data })
    return P.resolve()
  }

  var info = {
    event: event
  }

  if (request.headers['user-agent']) {
    info.userAgent = request.headers['user-agent']
  }

  optionallySetService(info, request)

  Object.keys(data).forEach(function (key) {
    info[key] = data[key]
  })

  this.logger.info('activityEvent', info)
  this.statsd.write(info)

  if (! ACTIVITY_FLOW_EVENTS[event]) {
    return P.resolve()
  }

  // log a flowEvent for all activityEvents
  return this.flowEvent(event, request)
}

// Log a flow metrics event.
// These events help understand the user's sign-in or sign-up journey.

Lug.prototype.flowEvent = function (event, request) {
  if (! event) {
    this.error({ op: 'log.flowEvent', missingEvent: true })
    return P.resolve()
  }

  if (! request || ! request.headers) {
    this.error({ op: 'log.flowEvent', event: event, badRequest: true })
    return P.resolve()
  }

  if (event === 'account.signed' && request.query && request.query.service === 'content-server') {
    // HACK: Prevent the content server from distorting our flow completion rates.
    //       Longer term we need to replace this with something better, obviously.
    return P.resolve()
  }

  return request.gatherMetricsContext({
    event: event,
    userAgent: request.headers['user-agent']
  }).then(
    info => {
      if (info.flow_id) {
        info.event = event
        optionallySetService(info, request)

        this.logger.info('flowEvent', info)
      } else if (ALWAYS_ACTIVITY_FLOW_EVENTS[event]) {
        this.error({ op: 'log.flowEvent', event: event, missingFlowId: true })
      }
    }
  )
}


function optionallySetService (data, request) {
  // don't overwrite service if it is already set
  if (data.service) {
    return
  }

  try {
    data.service = request.payload.service || request.query.service
  } catch (err) {
    // request.payload and request.query are not always set in the unit tests
  }
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
      console[key] = function () { // eslint-disable-line no-console
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const mozlog = require('mozlog');
const config = require('../config');
const logConfig = config.get('log');
let statsd;

const ISSUER = config.get('domain') || '';
const CLIENT_ID_TO_SERVICE_NAMES = config.get('oauth.clientIds') || {};

function Lug(options) {
  EventEmitter.call(this);
  this.name = options.name || 'fxa-auth-server';
  this.logger = mozlog({
    app: this.name,
    level: options.level,
    stream: options.stderr || process.stderr,
    fmt: options.fmt,
  })();

  this.stdout = options.stdout || process.stdout;

  this.notifier = require('./notifier')(this, statsd);
}
util.inherits(Lug, EventEmitter);

Lug.prototype.close = function() {};

// Expose the standard error/warn/info/debug/etc log methods.

Lug.prototype.trace = function(op, data) {
  this.logger.debug(op, data);
};

Lug.prototype.error = function(op, data) {
  // If the error object contains an email address,
  // lift it into top-level fields so that our
  // PII-scrubbing tool is able to find it.
  if (data.err && data.err.email) {
    if (!data.email) {
      data.email = data.err.email;
    }
    data.err.email = null;
  }
  this.logger.error(op, data);
};

Lug.prototype.fatal = function(op, data) {
  this.logger.critical(op, data);
};

Lug.prototype.warn = function(op, data) {
  this.logger.warn(op, data);
};

Lug.prototype.info = function(op, data) {
  this.logger.info(op, data);
};

Lug.prototype.begin = function(op, request) {
  this.logger.debug(op);
};

Lug.prototype.stat = function(stats) {
  this.logger.info('stat', stats);
};

// Log a request summary line.
// This gets called once for each completed request.
// See https://mana.mozilla.org/wiki/display/CLOUDSERVICES/Logging+Standard
// for a discussion of this format and why it's used.

Lug.prototype.summary = function(request, response) {
  if (request.method === 'options') {
    return;
  }

  request.emitRouteFlowEvent(response);

  const payload = request.payload || {};
  const query = request.query || {};
  const credentials = (request.auth && request.auth.credentials) || {};
  const responseBody = (response && response.source) || {};

  const line = {
    status: response.isBoom ? response.output.statusCode : response.statusCode,
    errno: response.errno || (response.source && response.source.errno) || 0,
    rid: request.id,
    path: request.path,
    lang: request.app.acceptLanguage,
    agent: request.headers['user-agent'],
    remoteAddressChain: request.app.remoteAddressChain,
    accountRecreated: request.app.accountRecreated,
    t: Date.now() - request.info.received,
    uid:
      credentials.uid ||
      payload.uid ||
      query.uid ||
      response.uid ||
      responseBody.uid ||
      '00',
    service: payload.service || query.service,
    reason: payload.reason || query.reason,
    redirectTo: payload.redirectTo || query.redirectTo,
    keys: !!query.keys,

    // Additional data used by the DataFlow fraud detection pipeline.
    // Logging PII for the fraud detection pipeline has been given
    // the green light so that the fraud detection logic can
    // handle much of the logic the customs server currently does.
    method: request.method,
    email: credentials.email || payload.email || query.email,
    phoneNumber: responseBody.formattedPhoneNumber,
  };

  if (line.status >= 500) {
    line.trace = request.app.traced;
    line.stack = response.stack;
    this.error('request.summary', line);
  } else {
    this.info('request.summary', line);
  }
};

// Broadcast an event to attached services, such as sync.
// In production, these events are broadcast to relying services over SNS/SQS.
Lug.prototype.notifyAttachedServices = async function(name, request, data) {
  let metricsContextData = {};
  if (request.gatherMetricsContext) {
    metricsContextData = await request.gatherMetricsContext({});
  }

  // Add a timestamp that this event occurred to help attached services resolve any
  // potential timing issues
  const now = Date.now();
  data.timestamp = data.timestamp || now; // Leave as milliseconds
  data.ts = data.ts || now / 1000; // Convert to float seconds

  // Tag all events with the issuing service.
  data.iss = ISSUER;

  // convert an oauth client-id to a human readable format, if a name is available.
  // If no name is available, continue to use the client_id.
  if (data.service && data.service !== 'sync') {
    data.clientId = data.service;
    data.service = CLIENT_ID_TO_SERVICE_NAMES[data.service] || data.service;
  }

  const e = {
    event: name,
    data,
  };
  e.data.metricsContext = metricsContextData;

  this.info('notify.attached', e);
  this.notifier.send(e);
};

// Log an activity metrics event.
// These events indicate key points at which a particular
// user has interacted with the service.

Lug.prototype.activityEvent = function(data) {
  if (!data || !data.event || !data.uid) {
    this.error('log.activityEvent', { data });
    return;
  }

  this.logger.info('activityEvent', data);
};

// Log a flow metrics event.
// These events help understand the user's sign-in or sign-up journey.

Lug.prototype.flowEvent = function(data) {
  if (!data || !data.event || !data.flow_id || !data.flow_time || !data.time) {
    this.error('flow.missingData', { data });
    return;
  }

  this.logger.info('flowEvent', data);
};

Lug.prototype.amplitudeEvent = function(data) {
  if (!data || !data.event_type || (!data.device_id && !data.user_id)) {
    this.error('amplitude.missingData', { data });
    return;
  }

  this.logger.info('amplitudeEvent', data);
};

module.exports = function(level, name, options = {}) {
  if (arguments.length === 1 && typeof level === 'object') {
    options = level;
    level = options.level;
    name = options.name;
  }
  options.name = name;
  options.level = level;
  options.fmt = logConfig.fmt;
  const log = new Lug(options);

  log.stdout.on('error', err => {
    if (err.code === 'EPIPE') {
      log.emit('error', err);
    }
  });

  if (options.statsd) {
    statsd = options.statsd;
  }

  return log;
};

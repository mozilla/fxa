/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A collector that accepts rum-diary-js-client stats, reformats them,
// and sends them to stderr. Heka will listen to the events from stderr.

'use strict';

var os = require('os');

var HOSTNAME = os.hostname();
var OP = 'client.metrics';
var VERSION = 1;

function addTime(loggableEvent) {
  // round the date to the nearest hour.
  var today = new Date();
  today.setMinutes(0, 0, 0);
  loggableEvent.time = today.toISOString();
}

function addOp(loggableEvent) {
  loggableEvent.op = OP;
}

function addHostname(loggableEvent) {
  loggableEvent.hostname = HOSTNAME;
}

function addPid(loggableEvent) {
  loggableEvent.pid = process.pid;
}

function addVersion(loggableEvent) {
  loggableEvent.v = VERSION;
}

function copyFields(fields, to, from) {
  fields.forEach(function (field) {
    to[field] = from.hasOwnProperty(field) ? from[field] : 'unknown';
  });
}

function isValidNavigationTimingValue(value) {
  return typeof value !== 'undefined' && value !== null;
}

function addNavigationTiming(loggableEvent, event) {
  var navigationTiming = event.navigationTiming;

  for (var key in navigationTiming) {
    if (isValidNavigationTimingValue(navigationTiming[key])) {
      loggableEvent['nt.' + key] = navigationTiming[key];
    }
  }
}

function addEvents(loggableEvent, event) {
  if (event.events && event.events.forEach) {
    loggableEvent.events = [];
    loggableEvent.event_durations = [];

    event.events.forEach(function (event, index) {
      loggableEvent.events.push(event.type);
      loggableEvent.event_durations.push(event.offset);
    });
  }
}

function addScreenSize(loggableEvent, event) {
  if (! event.screen) {
    return;
  }

  if (event.screen.width) {
    loggableEvent['screen.width'] = event.screen.width;
  }

  if (event.screen.height) {
    loggableEvent['screen.height'] = event.screen.height;
  }
}

function toLoggableEvent(event) {
  var loggableEvent = {};

  // work off of a whitelist to ensure only data we care about is logged.

  // fields that rely on server data.
  addTime(loggableEvent);
  addOp(loggableEvent);
  addHostname(loggableEvent);
  addPid(loggableEvent);
  addVersion(loggableEvent);

  // fields that rely on client data.
  copyFields([
    'lang',
    'agent',
    'duration',
    'context',
    'entrypoint',
    'service',
    'migration',
    'campaign',
    'marketingLink',
    'marketingType',
    'marketingClicked'
  ], loggableEvent, event);

  addNavigationTiming(loggableEvent, event);
  addEvents(loggableEvent, event);
  addScreenSize(loggableEvent, event);


  return loggableEvent;
}


function StdErrCollector() {
  // nothing to do here.
}

StdErrCollector.prototype = {
  write: function (event) {
    var loggableEvent = toLoggableEvent(event);

    // Heka listens on stderr.
    // process.stderr.write is synchronous unlike most stream operations.
    // See http://nodejs.org/api/process.html#process_process_stderr
    // If this causes a performance problem, figure out another way of
    // doing it.
    process.stderr.write(JSON.stringify(loggableEvent) + '\n');
  }
};

module.exports = StdErrCollector;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A collector that accepts rum-diary-js-client stats, reformats them,
// and sends them to stderr. Heka will listen to the events from stderr.

'use strict';
const os = require('os');

const HOSTNAME = os.hostname();
const METRICS_OP = 'client.metrics';
const MARKETING_OP = 'client.marketing';
const VERSION = 1;

function addTime(loggableEvent) {
  // round the date to the nearest hour.
  const today = new Date();
  today.setMinutes(0, 0, 0);
  loggableEvent.time = today.toISOString();
}

function addOp(loggableEvent, op) {
  loggableEvent.op = op;
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
  fields.forEach(function(field) {
    // eslint-disable-next-line no-prototype-builtins
    to[field] = from.hasOwnProperty(field) ? from[field] : 'unknown';
  });
}

function isValidNavigationTimingValue(value) {
  return typeof value !== 'undefined' && value !== null;
}

function addNavigationTiming(loggableEvent, event) {
  const navigationTiming = event.navigationTiming;

  // eslint-disable-next-line no-unused-vars
  for (const key in navigationTiming) {
    if (isValidNavigationTimingValue(navigationTiming[key])) {
      loggableEvent['nt.' + key] = navigationTiming[key];
    }
  }
}

function addEvents(loggableEvent, event) {
  if (event.events && event.events.forEach) {
    loggableEvent.events = [];
    loggableEvent.event_durations = []; //eslint-disable-line camelcase

    event.events
      .filter(event => !/^flow\./.test(event.type))
      .forEach(event => {
        loggableEvent.events.push(event.type);
        loggableEvent.event_durations.push(event.offset);
      });
  }
}

function addScreenSize(loggableEvent, event) {
  if (!event.screen) {
    return;
  }

  if (event.screen.width && typeof event.screen.width === 'number') {
    loggableEvent['screen.width'] = event.screen.width;
  }

  if (event.screen.height && typeof event.screen.height === 'number') {
    loggableEvent['screen.height'] = event.screen.height;
  }
}

function toLoggableEvent(event) {
  const loggableEvent = {};

  // work off of a whitelist to ensure only data we care about is logged.

  // fields that rely on server data.
  addTime(loggableEvent);
  addOp(loggableEvent, METRICS_OP);
  addHostname(loggableEvent);
  addPid(loggableEvent);
  addVersion(loggableEvent);

  // fields that rely on client data.
  copyFields(
    ['lang', 'agent', 'duration', 'context', 'broker', 'entrypoint', 'service'],
    loggableEvent,
    event
  );

  addNavigationTiming(loggableEvent, event);
  addEvents(loggableEvent, event);
  addScreenSize(loggableEvent, event);

  return loggableEvent;
}

function writeEntry(entry) {
  // Heka listens on stderr.
  // process.stderr.write is synchronous unlike most stream operations.
  // See http://nodejs.org/api/process.html#process_process_stderr
  // If this causes a performance problem, figure out another way of
  // doing it.
  process.stderr.write(JSON.stringify(entry) + '\n');
}

function processMarketingImpressions(event) {
  if (!(event && event.marketing && event.marketing.forEach)) {
    return;
  }

  // each marketing impression is printed individually
  event.marketing.forEach(function(impression) {
    addTime(impression);
    addOp(impression, MARKETING_OP);
    addHostname(impression);
    addPid(impression);
    addVersion(impression);

    copyFields(
      ['lang', 'agent', 'context', 'entrypoint', 'service'],
      impression,
      event
    );

    writeEntry(impression);
  });
}

function StdErrCollector() {
  // nothing to do here.
}

StdErrCollector.prototype = {
  write: function(event) {
    const loggableEvent = toLoggableEvent(event);
    writeEntry(loggableEvent);

    processMarketingImpressions(event);
  },
};

module.exports = StdErrCollector;

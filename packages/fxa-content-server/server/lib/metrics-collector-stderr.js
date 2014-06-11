/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A collector that accepts rum-diary-js-client stats, reformats them,
// and sends them to stderr. Heka will listen to the events from stderr.

'use strict';

function shallowCopyObject(from) {
  var to = {};
  for (var key in from) {
    to[key] = from[key];
  }

  return to;
}

function addOp(loggableMetrics) {
  loggableMetrics.op = 'client.metrics';
}

function isValidNavigationTimingValue(value) {
  return typeof value !== 'undefined' && value !== null;
}

function flattenNavigationTiming(loggableMetrics) {
  var navigationTiming = loggableMetrics.navigationTiming;

  for (var key in navigationTiming) {
    if (isValidNavigationTimingValue(navigationTiming[key])) {
      loggableMetrics['nt.' + key] = navigationTiming[key];
    }
  }

  delete loggableMetrics.navigationTiming;
}

function flattenEvents(loggableMetrics) {
  if (loggableMetrics.events && loggableMetrics.events.forEach) {
    loggableMetrics.events.forEach(function (event, index) {
      var eventName = 'event[' + index + '].' + event.type;
      loggableMetrics[eventName] = event.offset;
    });

    delete loggableMetrics.events;
  }
}

function deleteTimers(loggableMetrics) {
  delete loggableMetrics.timers;
}


function prepareEventForLogging(metrics) {
  var loggableMetrics = shallowCopyObject(metrics);

  addOp(loggableMetrics);
  flattenNavigationTiming(loggableMetrics);
  flattenEvents(loggableMetrics);
  deleteTimers(loggableMetrics);

  return loggableMetrics;
}


function StdErrCollector() {
  // nothing to do here.
}

StdErrCollector.prototype = {
  write: function (loggableMetrics) {
    var loggableMetrics = prepareEventForLogging(loggableMetrics);

    // Heka listens on stderr.
    // process.stderr.write is synchronous unlike most stream operations.
    // See http://nodejs.org/api/process.html#process_process_stderr
    // If this causes a performance problem, figure out another way of
    // doing it.
    process.stderr.write(JSON.stringify(loggableMetrics) + '\n');
  }
};

module.exports = StdErrCollector;

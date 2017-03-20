/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const _ = require('lodash');
const config = require('./configuration');
const flowMetrics = require('./flow-metrics');
const os = require('os');

const DNT_ALLOWED_DATA = [
  'context',
  'entrypoint',
  'migration',
  'service',
];
const NO_DNT_ALLOWED_DATA = DNT_ALLOWED_DATA.concat([
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source'
]);
const HOSTNAME = os.hostname();
const MAX_DATA_LENGTH = 100;
const VERSION = 1;

const FLOW_BEGIN_EVENT = 'flow.begin';
const FLOW_ID_KEY = config.get('flow_id_key');
const FLOW_ID_EXPIRY = config.get('flow_id_expiry');

const ENTRYPOINT_PATTERN = /^[\w.-]+$/;
const SERVICE_PATTERN = /^(sync|content-server|none|[0-9a-f]{16})$/;
const VALID_FLOW_EVENT_PROPERTIES = [
  { key: 'client_id', pattern: SERVICE_PATTERN },
  { key: 'context', pattern: /^[0-9a-z_-]+$/ },
  { key: 'entryPoint', pattern: ENTRYPOINT_PATTERN },
  { key: 'entrypoint', pattern: ENTRYPOINT_PATTERN },
  { key: 'flowId', pattern: /^[0-9a-f]{64}$/ },
  { key: 'migration', pattern: /^(sync11|amo|none)$/ },
  { key: 'service', pattern: SERVICE_PATTERN }
];

const UTM_PATTERN = /^[\w.%-]+$/;

const IS_DISABLED = config.get('client_metrics').stderr_collector_disabled;

const PERFORMANCE_TIMINGS = [
  // These timings are only an approximation, to be used as extra signals
  // when looking for correlations in the flow data. They're not perfect
  // representations, for instance:
  //
  //   * `network` includes fetching from the browser cache.
  //   * `server` includes some network time.
  //   * `client` is only a subset of the client-side processing time.
  //
  // Bear this in mind when looking at the data. The main `flow.performance`
  // event represents our best approximation of overall, user-perceived
  // performance.
  {
    event: 'network',
    timings: [
      { from: 'domainLookupStart', until: 'domainLookupEnd' },
      { from: 'connectStart', until: 'connectEnd' },
      { from: 'responseStart', until: 'responseEnd' }
    ]
  },
  {
    event: 'server',
    timings: [
      { from: 'requestStart', until: 'responseStart' }
    ]
  },
  {
    event: 'client',
    timings: [
      { from: 'domLoading', until: 'domComplete' }
    ]
  }
];

module.exports = (req, metrics, requestReceivedTime) => {
  if (IS_DISABLED || ! isValidFlowData(metrics, requestReceivedTime)) {
    return;
  }

  let emitPerformanceEvents = false;
  const events = metrics.events || [];
  const flowEvents = events.map(event => {
    if (event.type === 'loaded') {
      emitPerformanceEvents = true;
      return Object.assign({}, event, {
        type: 'flow.performance'
      });
    }

    if (event.type.indexOf('screen.') !== 0) {
      return event;
    }

    return Object.assign({}, event, {
      type: `flow.${event.type.substr(7)}.view`
    });
  }).filter(event => event.type.indexOf('flow.') === 0);

  flowEvents.forEach(event => {
    if (event.type === FLOW_BEGIN_EVENT) {
      event.time = metrics.flowBeginTime;
      event.flowTime = 0;
    } else {
      event.time = estimateTime({
        /*eslint-disable sorting/sort-object-props*/
        start: metrics.startTime,
        offset: event.offset,
        sent: metrics.flushTime,
        received: requestReceivedTime
        /*eslint-enable sorting/sort-object-props*/
      });

      if (! isValidTime(event.time, requestReceivedTime)) {
        return;
      }

      event.flowTime = event.time - metrics.flowBeginTime;
    }

    logFlowEvent(event, metrics, req);
  });

  const navigationTiming = metrics.navigationTiming;
  if (emitPerformanceEvents && navigationTiming) {
    PERFORMANCE_TIMINGS.forEach(item => {
      const time = item.timings.reduce((sum, timing) => {
        const from = navigationTiming[timing.from];
        const until = navigationTiming[timing.until];
        if (from >= 0 && until > from) {
          sum += until - from;
        }
        return sum;
      }, 0);

      if (time > 0) {
        logFlowEvent({
          flowTime: time,
          time: metrics.flowBeginTime + time,
          type: `flow.performance.${item.event}`
        }, metrics, req);
      }
    });
  }
};

function isValidFlowData (metrics, requestReceivedTime) {
  if (! metrics.flowId) {
    return false;
  }

  if (! isValidTime(metrics.flowBeginTime, requestReceivedTime)) {
    return false;
  }

  if (! VALID_FLOW_EVENT_PROPERTIES.every(p => isValidProperty(metrics[p.key], p.pattern))) {
    return false;
  }

  return flowMetrics.validate(FLOW_ID_KEY, metrics.flowId, metrics.flowBeginTime, metrics.agent);
}

function isValidTime (time, requestReceivedTime) {
  if (typeof time !== 'number') {
    return false;
  }

  const age = requestReceivedTime - time;
  if (age > FLOW_ID_EXPIRY || age < 0 || isNaN(age)) {
    return false;
  }

  return true;
}

function isValidProperty (propertyValue, pattern) {
  if (propertyValue) {
    return pattern.test(propertyValue);
  }

  return true;
}

function estimateTime (times) {
  const skew = times.received - times.sent;
  return times.start + times.offset + skew;
}

function logFlowEvent (event, data, request) {
  const eventData = _.assign({
    event: event.type,
    flow_id: data.flowId, //eslint-disable-line camelcase
    flow_time: Math.floor(event.flowTime), //eslint-disable-line camelcase
    hostname: HOSTNAME,
    op: 'flowEvent',
    pid: process.pid,
    time: new Date(event.time).toISOString(),
    userAgent: request.headers['user-agent'],
    v: VERSION
  }, _.mapValues(pickFlowData(data, request), sanitiseData));

  optionallySetFallbackData(eventData, 'service', data.client_id);
  optionallySetFallbackData(eventData, 'entrypoint', data.entryPoint);

  // The data pipeline listens on stderr.
  process.stderr.write(JSON.stringify(eventData) + '\n');
}

function pickFlowData (data, request) {
  if (isDNT(request)) {
    return _.pick(data, DNT_ALLOWED_DATA);
  }

  const pickedData = _.pick(data, NO_DNT_ALLOWED_DATA);

  return _.pickBy(pickedData, (value, key) => {
    if (key.indexOf('utm_') === 0) {
      // Silently drop utm_ properties that contain unexpected characters.
      return UTM_PATTERN.test(value);
    }

    return true;
  });
}

function isDNT (request) {
  return request.headers.dnt === '1';
}

function limitLength (data) {
  if (data && data.length > MAX_DATA_LENGTH) {
    return data.substr(0, MAX_DATA_LENGTH);
  }

  return data;
}

function sanitiseData (data) {
  if (! data || data === 'none') {
    return undefined;
  }

  return limitLength(data);
}

function optionallySetFallbackData (eventData, key, fallback) {
  if (! eventData[key] && fallback) {
    eventData[key] = limitLength(fallback);
  }
}

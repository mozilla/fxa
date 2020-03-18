/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const _ = require('lodash');
const amplitude = require('./amplitude');
const config = require('./configuration');
const flowMetrics = require('./flow-metrics');
const log = require('./logging/log')('server.flow-event');
const geodbConfig = config.get('geodb');
const geodb = require('../../../fxa-geodb')(geodbConfig);
const remoteAddress = require('../../../fxa-shared/express/remote-address')(
  config.get('clientAddressDepth')
);
const geolocate = require('../../../fxa-shared/express/geo-locate')(geodb)(
  remoteAddress
)(log);
const os = require('os');
const statsd = require('./statsd');
const {
  VERSION,
  PERFORMANCE_TIMINGS,
  limitLength,
  isValidTime,
} = require('../../../fxa-shared/metrics/flow-performance');

const VALIDATION_PATTERNS = require('./validation').PATTERNS;
const DNT_ALLOWED_DATA = ['context', 'entrypoint', 'migration', 'service'];
const NO_DNT_ALLOWED_DATA = DNT_ALLOWED_DATA.concat([
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
]);
const HOSTNAME = os.hostname();

const FLOW_BEGIN_EVENT = 'flow.begin';
const FLOW_ID_KEY = config.get('flow_id_key');
const FLOW_ID_EXPIRY = config.get('flow_id_expiry');
const FLOW_METRICS_DISABLED = config.get('flow_metrics_disabled');

const ENTRYPOINT_PATTERN = /^[\w.-]+$/;
const VALID_FLOW_EVENT_PROPERTIES = [
  { key: 'client_id', pattern: VALIDATION_PATTERNS.SERVICE },
  { key: 'context', pattern: VALIDATION_PATTERNS.CONTEXT },
  { key: 'entryPoint', pattern: ENTRYPOINT_PATTERN },
  { key: 'entrypoint', pattern: ENTRYPOINT_PATTERN },
  { key: 'flowId', pattern: /^[0-9a-f]{64}$/ },
  { key: 'migration', pattern: VALIDATION_PATTERNS.MIGRATION },
  { key: 'service', pattern: VALIDATION_PATTERNS.SERVICE },
];

const UTM_PATTERN = /^[\w.%-]+$/;

const metricsRequest = (req, metrics, requestReceivedTime) => {
  if (FLOW_METRICS_DISABLED || !isValidFlowData(metrics, requestReceivedTime)) {
    return;
  }

  metrics.location = geodbConfig.enabled ? geolocate(req) : {};

  let emitPerformanceEvents = false;
  const events = metrics.events || [];
  const { initialView } = metrics;
  events.forEach(event => {
    if (event.type === FLOW_BEGIN_EVENT) {
      event.time = metrics.flowBeginTime;
      event.flowTime = 0;
    } else {
      event.time = estimateTime({
        start: metrics.startTime,
        offset: event.offset,
        sent: metrics.flushTime,
        received: requestReceivedTime,
      });

      if (event.type === 'loaded') {
        emitPerformanceEvents = true;
        event = Object.assign({}, event, {
          type: `flow.performance.${initialView}`,
        });
      }

      if (!isValidTime(event.time, requestReceivedTime, FLOW_ID_EXPIRY)) {
        return;
      }

      if (/^flow\.timing\./.test(event.type)) {
        const separatorIndex = event.type.lastIndexOf('.');
        event.flowTime = event.type.substr(separatorIndex + 1);
        event.type = event.type.substr(0, separatorIndex);
      } else {
        event.flowTime = event.time - metrics.flowBeginTime;
      }
    }

    amplitude(event, req, metrics);

    if (event.type.substr(0, 7) === 'screen.') {
      event = Object.assign({}, event, {
        type: `flow.${event.type.substr(7)}.view`,
      });
    }

    if (event.type.substr(0, 5) === 'flow.') {
      logFlowEvent(event, metrics, req);
    }
  });

  const navigationTiming = metrics.navigationTiming;
  if (emitPerformanceEvents && navigationTiming) {
    PERFORMANCE_TIMINGS.forEach(item => {
      const relativeTime = item.timings.reduce((sum, timing) => {
        const from = navigationTiming[timing.from];
        const until = navigationTiming[timing.until];
        if (from >= 0 && until > from) {
          sum += until - from;
        }
        return sum;
      }, 0);
      const absoluteTime = metrics.flowBeginTime + relativeTime;

      if (
        relativeTime > 0 &&
        isValidTime(absoluteTime, requestReceivedTime, FLOW_ID_EXPIRY)
      ) {
        logFlowEvent(
          {
            flowTime: relativeTime,
            time: absoluteTime,
            type: `flow.performance.${initialView}.${item.event}`,
          },
          metrics,
          req
        );
      }
    });
  }
};

function isValidFlowData(metrics, requestReceivedTime) {
  if (!metrics.flowId) {
    return false;
  }

  if (
    !isValidTime(metrics.flowBeginTime, requestReceivedTime, FLOW_ID_EXPIRY)
  ) {
    return false;
  }

  if (
    !VALID_FLOW_EVENT_PROPERTIES.every(p =>
      isValidProperty(metrics[p.key], p.pattern)
    )
  ) {
    return false;
  }

  return flowMetrics.validate(
    FLOW_ID_KEY,
    metrics.flowId,
    metrics.flowBeginTime
  );
}

function isValidProperty(propertyValue, pattern) {
  if (propertyValue) {
    return pattern.test(propertyValue);
  }

  return true;
}

function estimateTime(times) {
  const skew = times.received - times.sent;
  return times.start + times.offset + skew;
}

function logFlowEvent(event, data, request) {
  const { location } = data;
  const eventData = _.assign(
    {
      country: location && location.country,
      event: event.type,
      flow_id: data.flowId, //eslint-disable-line camelcase
      flow_time: Math.floor(event.flowTime), //eslint-disable-line camelcase
      hostname: HOSTNAME,
      locale: request.locale,
      op: 'flowEvent',
      pid: process.pid,
      region: location && location.state,
      time: new Date(event.time).toISOString(),
      userAgent: request.headers['user-agent'],
      v: VERSION,
    },
    _.mapValues(pickFlowData(data, request), sanitiseData)
  );

  optionallySetFallbackData(eventData, 'service', data.client_id);
  optionallySetFallbackData(eventData, 'entrypoint', data.entryPoint);

  // The data pipeline listens on stderr.
  process.stderr.write(JSON.stringify(eventData) + '\n');
  logStatsdPerfEvent(eventData);
}

function logStatsdPerfEvent(eventData) {
  if (eventData.event.startsWith('flow.performance.')) {
    const perfMetricNameParts = eventData.event.split('.');
    const view = perfMetricNameParts[2];
    const metricName =
      perfMetricNameParts.length === 3 ? 'total' : perfMetricNameParts[3];
    statsd.timing(`nt.${metricName}`, eventData.flow_time, { view });
  }
}

function pickFlowData(data, request) {
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

function isDNT(request) {
  return request.headers.dnt === '1';
}

function sanitiseData(data) {
  if (!data || data === 'none') {
    return undefined;
  }

  return limitLength(data);
}

function optionallySetFallbackData(eventData, key, fallback) {
  if (!eventData[key] && fallback) {
    eventData[key] = limitLength(fallback);
  }
}

module.exports = {
  logFlowEvent,
  metricsRequest,
};

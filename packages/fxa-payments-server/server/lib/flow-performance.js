/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const os = require('os');
const config = require('../config');
const log = require('./logging/log')();
const {
  VERSION,
  PERFORMANCE_TIMINGS,
  limitLength,
  isValidTime,
} = require('../../../fxa-shared/metrics/flow-performance.js');
const geodbConfig = config.get('geodb');
const geodb = require('../../../fxa-geodb/lib/fxa-geodb.js')(geodbConfig);
const remoteAddress = require('../../../fxa-shared/express/remote-address.js')(
  config.get('clientAddressDepth')
);
const geolocate = require('../../../fxa-shared/express/geo-locate.js')(geodb)(
  remoteAddress
)(log);

const HOSTNAME = os.hostname();
const FLOW_ID_EXPIRY = config.get('flow_id_expiry');

module.exports = (event, request, data) => {
  const { view, perfStartTime, flowBeginTime, flowId, navigationTiming } = data;

  if (
    !view ||
    !perfStartTime ||
    !flowBeginTime ||
    !flowId ||
    !navigationTiming
  ) {
    return;
  }

  data.location = geodbConfig.enabled ? geolocate(request) : {};

  const eventTime =
    perfStartTime + event.offset + (data.requestReceivedTime - data.flushTime);
  writePerfEvent(
    {
      time: eventTime,
      flowTime: eventTime - perfStartTime,
      type: `flow.performance.payments.${view}`,
    },
    data,
    request
  );

  PERFORMANCE_TIMINGS.forEach(item => {
    const relativeTime = item.timings.reduce((sum, timing) => {
      const from = navigationTiming[timing.from];
      const until = navigationTiming[timing.until];
      if (from >= 0 && until > from) {
        sum += until - from;
      }
      return sum;
    }, 0);
    const absoluteTime = perfStartTime + relativeTime;
    if (
      relativeTime > 0 &&
      isValidTime(absoluteTime, data.requestReceivedTime, FLOW_ID_EXPIRY)
    ) {
      writePerfEvent(
        {
          flowTime: relativeTime,
          time: absoluteTime,
          type: `flow.performance.payments.${view}.${item.event}`,
        },
        data,
        request
      );
    }
  });
};

function writePerfEvent(event, data, request) {
  const eventData = {
    country: data.location && data.location.country,
    event: event.type,
    flow_id: data.flowId,
    flow_time: Math.floor(event.flowTime),
    hostname: HOSTNAME,
    locale: request.locale,
    op: 'flowEvent',
    pid: process.pid,
    region: data.location && data.location.state,
    time: new Date(event.time).toISOString(),
    userAgent: request.headers['user-agent'],
    v: VERSION,
  };

  Object.entries(eventData).forEach(([k, v]) => {
    eventData[k] = limitLength(v);
  });

  log.info(eventData);
}

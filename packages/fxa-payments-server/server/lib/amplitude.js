/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {
  GROUPS,
  initialize,
  mapBrowser,
  mapFormFactor,
  mapLocation,
  mapOs,
  mapTime,
  toSnakeCase,
} = require('../../../fxa-shared/metrics/amplitude.js');
const config = require('../config');
const amplitude = config.get('amplitude');
const log = require('./logging/log')();
const ua = require('../../../fxa-shared/metrics/user-agent');
const { version: VERSION } = require('../../package.json');

const FUZZY_EVENTS = new Map([
  [
    // Emit events from the front-end as `amplitude.${GROUP}.${EVENT}`
    /^amplitude\.([\w-]+)\.([\w-]+)$/,
    {
      group: group => GROUPS[group],
      event: (group, event) => toSnakeCase(event),
    },
  ],
]);

const transform = initialize({}, {}, FUZZY_EVENTS);

module.exports = (event, request, data, requestReceivedTime) => {
  if (!amplitude.enabled || !event || !request || !data) {
    return;
  }

  requestReceivedTime = requestReceivedTime || Date.now();

  const userAgent = ua.parse(request.headers['user-agent']);

  const amplitudeEvent = transform(event, {
    version: VERSION,
    ...mapBrowser(userAgent),
    ...mapOs(userAgent),
    ...mapFormFactor(userAgent),
    ...mapLocation(data.location),
    ...mapTime(data, requestReceivedTime),
    ...data,
  });

  if (amplitudeEvent) {
    // Amplitude events are logged to stdout, where they are picked up by the
    // stackdriver logging agent.
    log.info('amplitudeEvent', amplitudeEvent);
  }
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { GROUPS, initialize } = require('../../../fxa-shared/metrics/amplitude');
const log = require('./logging/log')();
const ua = require('./user-agent');
const { version: VERSION } = require('../../package.json');

const FUZZY_EVENTS = new Map([
  [
    // Emit events from the front-end as `amplitude.${GROUP}.${EVENT}`
    /^amplitude\.([\w-]+)\.([\w-]+)$/,
    {
      group: group => GROUPS[group],
      event: (group, event) => event,
    },
  ],
]);

const transform = initialize({}, {}, FUZZY_EVENTS);

module.exports = (event, request, data) => {
  if (!event || !request || !data) {
    return;
  }

  const userAgent = ua.parse(request.headers['user-agent']);

  const amplitudeEvent = transform(event, {
    version: VERSION,
    ...mapBrowser(userAgent),
    ...mapOs(userAgent),
    ...mapFormFactor(userAgent),
    ...mapLocation(data.location),
    ...data,
  });

  if (amplitudeEvent) {
    log.info('amplitudeEvent', amplitudeEvent);
  }
};

function mapBrowser(userAgent) {
  return mapUserAgentProperties(userAgent, 'ua', 'browser', 'browserVersion');
}

function mapOs(userAgent) {
  return mapUserAgentProperties(userAgent, 'os', 'os', 'osVersion');
}

function mapUserAgentProperties(
  userAgent,
  key,
  familyProperty,
  versionProperty
) {
  const group = userAgent[key];
  const { family } = group;
  if (family && family !== 'Other') {
    return {
      [familyProperty]: family,
      [versionProperty]: group.toVersionString(),
    };
  }
}

function mapFormFactor(userAgent) {
  const { brand, family: formFactor } = userAgent.device;
  if (brand && formFactor && brand !== 'Generic') {
    return { formFactor };
  }
}

function mapLocation(location) {
  if (location && (location.country || location.state)) {
    return {
      country: location.country,
      region: location.state,
    };
  }
}

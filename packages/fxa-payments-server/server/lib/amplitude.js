/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  GROUPS,
  initialize,
  mapBrowser,
  mapFormFactor,
  mapLocation,
  mapOs,
  toSnakeCase,
  validate,
} = require('fxa-shared/metrics/amplitude').amplitude;
const config = require('../config');
const amplitudeConfig = config.get('amplitude');
const log = require('./logging/log')();
const ua = require('fxa-shared/lib/user-agent');
const { version: VERSION } = require('../../package.json');
const Sentry = require('@sentry/node');
const { Container } = require('typedi');
const { StatsD } = require('hot-shots');

const geodbConfig = config.get('geodb');
const geodb = require('fxa-geodb')(geodbConfig);

const remoteAddress =
  require('fxa-shared/express/remote-address').remoteAddress(
    config.get('clientAddressDepth')
  );
const geolocate = require('fxa-shared/express/geo-locate').geolocate(geodb)(
  remoteAddress
)(log);
const { determineLocale } = require('@fxa/shared/l10n');

const FUZZY_EVENTS = new Map([
  [
    // Emit events from the front-end as `amplitude.${GROUP}.${EVENT}`
    /^amplitude\.([\w-]+)\.([\w-]+)$/,
    {
      group: (group) => GROUPS[group],
      event: (group, event) => toSnakeCase(event),
    },
  ],
]);

const transform = initialize(
  config.get('oauth_client_id_map'),
  {},
  FUZZY_EVENTS,
  log,
  Container.has(StatsD) ? Container.get(StatsD) : undefined
);

// TODO: remove eslint ignore in FXA-6950
// eslint-disable-next-line no-unused-vars
function getLocation(request) {
  if (!geodbConfig.enabled) {
    return {};
  }

  if(geodbConfig?.locationOverride?.location) {
    return geodbConfig.locationOverride.location;
  }

  return geolocate(request);
}

// TODO: remove eslint ignore in FXA-6950
// eslint-disable-next-line no-unused-vars
function getCountryCode(location) {
  if (location && location.countryCode) {
    return location.countryCode;
  }

  return null;
}

function getLanguage(request) {
  return determineLocale(request.headers['accept-language']);
}

const amplitude = (event, request, data) => {
  const statsd = Container.get(StatsD);
  if (!amplitudeConfig.enabled || !event || !request || !data) {
    return;
  }

  const additionalData = {
    lang: getLanguage(request),
    countryCode: getCountryCode(getLocation(request)),
  }

  if (amplitudeConfig.rawEvents) {
    const wanted = [
      'deviceId',
      'devices',
      'emailDomain',
      'entrypoint_experiment',
      'entrypoint_variation',
      'entrypoint',
      'experiments',
      'flowBeginTime',
      'flowId',
      'lang',
      'location',
      'newsletters',
      'planId',
      'productId',
      'service',
      'syncEngines',
      'templateVersion',
      'uid',
      'userPreferences',
      'utm_campaign',
      'utm_content',
      'utm_medium',
      'utm_referrer',
      'utm_source',
      'utm_term',
    ];
    const picked = wanted.reduce((acc, v) => {
      if (data[v] !== undefined) {
        acc[v] = data[v];
      }
      if (additionalData[v] !== undefined) {
        acc[v] = additionalData[v];
      }
      return acc;
    }, {});
    const rawEvent = {
      event,
      context: {
        eventSource: 'payments',
        version: VERSION,
        userAgent: request.headers?.['user-agent'],
        ...picked,
      },
    };
    log.info('rawAmplitudeData', rawEvent);
    statsd.increment('amplitude.event.raw');
  }

  const userAgent = ua.parse(request.headers?.['user-agent']);

  statsd.increment('amplitude.event');

  const amplitudeEvent = transform(event, {
    version: VERSION,
    ...mapBrowser(userAgent),
    ...mapOs(userAgent),
    ...mapFormFactor(userAgent),
    ...mapLocation(data.location),
    ...data,
    ...additionalData,
  });

  if (amplitudeEvent) {
    if (amplitudeConfig.schemaValidation) {
      try {
        validate(amplitudeEvent);
      } catch (err) {
        log.error('amplitude.validationError', { err, amplitudeEvent });

        // Since we are adding a schema retroactively, let's be conservative:
        // temporarily capture any validation "errors" with Sentry to ensure
        // that the schema is not too strict against existing events.  We'll
        // update the schema accordingly.  And allow the events in the
        // meantime.
        Sentry.withScope((scope) => {
          scope.setContext('amplitude.validationError', {
            event_type: amplitudeEvent.event_type,
            flow_id: amplitudeEvent.user_properties.flow_id,
            error: err.message,
          });
          Sentry.captureMessage('Amplitude event failed validation', 'error');
        });
      }
    }

    // Amplitude events are logged to stdout, where they are picked up by the
    // stackdriver logging agent.
    log.info('amplitudeEvent', amplitudeEvent);
  } else {
    statsd.increment('amplitude.event.dropped');
  }
};

module.exports = {
  amplitude,
  getLocation,
  getCountryCode,
};

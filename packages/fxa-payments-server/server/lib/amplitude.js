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
  toSnakeCase,
  validate,
} = require('../../../fxa-shared/metrics/amplitude.js');
const config = require('../config');
const amplitude = config.get('amplitude');
const log = require('./logging/log')();
const ua = require('../../../fxa-shared/metrics/user-agent');
const { version: VERSION } = require('../../package.json');
const Sentry = require('@sentry/node');
const { Container } = require('typedi');
const { StatsD } = require('hot-shots');

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

module.exports = (event, request, data) => {
  const statsd = Container.get(StatsD);
  if (!amplitude.enabled || !event || !request || !data) {
    return;
  }

  if (amplitude.rawEvents) {
    const wanted = [
      'deviceId',
      'devices',
      'emailDomain',
      'emailSender',
      'emailService',
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
      'utm_source',
      'utm_term',
    ];
    const picked = wanted.reduce((acc, v) => {
      if (data[v] !== undefined) {
        acc[v] = data[v];
      }
      return acc;
    }, {});
    const rawEvent = {
      event,
      context: {
        eventSource: 'payments',
        version: VERSION,
        userAgent: request.headers['user-agent'],
        ...picked,
      },
    };
    log.info('rawAmplitudeData', rawEvent);
    statsd.increment('amplitude.event.raw');
  }

  const userAgent = ua.parse(request.headers['user-agent']);

  statsd.increment('amplitude.event');

  const amplitudeEvent = transform(event, {
    version: VERSION,
    ...mapBrowser(userAgent),
    ...mapOs(userAgent),
    ...mapFormFactor(userAgent),
    ...mapLocation(data.location),
    ...data,
  });

  if (amplitudeEvent) {
    if (amplitude.schemaValidation) {
      try {
        validate(amplitudeEvent);
      } catch (err) {
        log.error('amplitude.validationError', { err, amplitudeEvent });

        // Since we are adding a schema retroactively, let's be conservative:
        // temporarily capture any validation "errors" with Sentry to ensure
        // that the schema is not too strict against existing events.  We'll
        // update the schema accordingly.  And allow the events in the
        // meantime.
        Sentry.withScope(scope => {
          scope.setContext('amplitude.validationError', {
            event_type: amplitudeEvent.event_type,
            flow_id: amplitudeEvent.user_properties.flow_id,
            error: err.message,
          });
          Sentry.captureMessage(
            `Amplitude event failed validation: ${err.message}.`,
            Sentry.Severity.Error
          );
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

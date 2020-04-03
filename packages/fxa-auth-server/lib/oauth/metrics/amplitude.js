/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module contains mappings from event names to amplitude event definitions.
// A module in fxa-shared is responsible for performing the actual transformations.
//
// You can see the event taxonomy here:
//
// https://docs.google.com/spreadsheets/d/1G_8OJGOxeWXdGJ1Ugmykk33Zsl-qAQL05CONSeD4Uz4

'use strict';

const Sentry = require('@sentry/node');

const {
  GROUPS,
  initialize,
  validate,
} = require('../../../../fxa-shared/metrics/amplitude');
const { version: VERSION } = require('../../../package.json');

const EVENTS = {
  'token.created': {
    group: GROUPS.activity,
    event: 'access_token_created',
  },
  'verify.success': {
    group: GROUPS.activity,
    event: 'access_token_checked',
  },
};

const FUZZY_EVENTS = new Map([]);

module.exports = (log, config) => {
  if (!log || !config.oauthServer.clientIdToServiceNames) {
    throw new TypeError('Missing argument');
  }

  const transformEvent = initialize(
    config.oauthServer.clientIdToServiceNames,
    EVENTS,
    FUZZY_EVENTS
  );

  return function receiveEvent(eventType, data) {
    if (!eventType || !data) {
      log.error('amplitude.badArgument', {
        err: 'Bad argument',
        event: eventType,
      });
      return;
    }

    const event = {
      type: eventType,
      time: data.time || Date.now(),
    };
    const eventData = Object.assign(
      {},
      {
        uid: data.uid,
        service: data.service,
        version: VERSION,
      }
    );

    if (config.amplitude.rawEvents) {
      const rawEvent = {
        event,
        context: {
          eventSource: 'oauth',
          ...eventData,
        },
      };
      log.info('rawAmplitudeData', rawEvent);
    }

    const amplitudeEvent = transformEvent(event, eventData);

    if (amplitudeEvent) {
      if (config.amplitude.schemaValidation) {
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
              err,
            });
            Sentry.captureMessage(
              'Amplitude event failed validation.',
              Sentry.Severity.Error
            );
          });

          // @TODO Uncomment to stop emitting invalid events once we are
          // satisfied with the schema.
          // return;
        }
      }

      log.info('amplitudeEvent', amplitudeEvent);
    }
  };
};

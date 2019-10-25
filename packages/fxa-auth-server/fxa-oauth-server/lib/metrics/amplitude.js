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

const {
  GROUPS,
  initialize,
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

function shouldExclude(event) {
  // Exclude certain high-volume clients from logging events into amplitude.
  const props = event.event_properties;
  const excluded =
    (props.service === 'fennec-stage' &&
      props.oauth_client_id === '3332a18d142636cb') ||
    (props.service === 'firefox-desktop' &&
      props.oauth_client_id === '5882386c6d801776') ||
    (props.service === 'firefox-ios' &&
      props.oauth_client_id === '1b1a3e44c54fbb58');
  return excluded;
}

module.exports = (log, config) => {
  if (!log || !config.clientIdToServiceNames) {
    throw new TypeError('Missing argument');
  }

  const transformEvent = initialize(
    config.clientIdToServiceNames,
    EVENTS,
    FUZZY_EVENTS
  );

  return function receiveEvent(event, data) {
    if (!event || !data) {
      log.error('amplitude.badArgument', { err: 'Bad argument', event });
      return;
    }

    const eventData = Object.assign(
      {},
      {
        uid: data.uid,
        service: data.service,
        version: VERSION,
      }
    );

    const amplitudeEvent = transformEvent(
      {
        type: event,
        time: data.time || Date.now(),
      },
      eventData
    );

    if (amplitudeEvent) {
      if (shouldExclude(amplitudeEvent)) {
        log.info('excludedAmplitudeEvent', amplitudeEvent);
      } else {
        log.info('amplitudeEvent', amplitudeEvent);
      }
    }
  };
};

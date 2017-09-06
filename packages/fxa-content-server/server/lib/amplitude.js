/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module contains mappings from content server event names to
// amplitude event definitions. The intention is for the returned
// `receiveEvent` function to be invoked for every event and the
// mappings determine which of those will be transformed into an
// amplitude event.
//
// You can read more about the amplitude event
// structure here:
//
// https://amplitude.zendesk.com/hc/en-us/articles/204771828-HTTP-API
//
// You can see the event taxonomy here:
//
// https://docs.google.com/spreadsheets/d/1G_8OJGOxeWXdGJ1Ugmykk33Zsl-qAQL05CONSeD4Uz4

/* eslint-disable sorting/sort-object-props, camelcase */

'use strict';

const APP_VERSION = /^[0-9]+\.([0-9]+)\./.exec(require('../../package.json').version)[1];

const GROUPS = {
  email: 'fxa_email',
  login: 'fxa_login',
  registration: 'fxa_reg',
  settings: 'fxa_pref',
  sms: 'fxa_sms'
};

const ENGAGE_SUBMIT_EVENT_GROUPS = {
  'force-auth': GROUPS.login,
  signin: GROUPS.login,
  signup: GROUPS.registration
};

const VIEW_EVENT_GROUPS = {
  'force-auth': GROUPS.login,
  settings: GROUPS.settings,
  signin: GROUPS.login,
  signup: GROUPS.registration,
  sms: GROUPS.sms
};

const EMAIL_TYPES = {
  'complete-reset-password': 'reset_password',
  'complete-signin': 'login',
  'verify-email': 'registration'
};

const NEWSLETTER_STATES = {
  optIn: 'subscribed',
  optOut: 'unsubscribed',
};

const EVENTS = {
  'flow.reset-password.submit': {
    group: GROUPS.login,
    event: 'forgot_submit'
  },
  'settings.change-password.success': {
    group: GROUPS.settings,
    event: 'password'
  },
  'settings.clients.disconnect.submit': {
    group: GROUPS.settings,
    event: 'disconnect_device'
  },
  'settings.signout.success': {
    group: GROUPS.settings,
    event: 'logout'
  },
};

const FUZZY_EVENTS = new Map([
  [ /^flow\.([\w-]+)\.engage$/, {
    isDynamicGroup: true,
    group: eventCategory => ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
    event: 'engage'
  } ],
  [ /^flow\.[\w-]+\.forgot-password$/, {
    group: GROUPS.login,
    event: 'forgot_pwd'
  } ],
  [ /^flow\.[\w-]+\.have-account$/, {
    group: GROUPS.registration,
    event: 'have_account'
  } ],
  [ /^flow\.([\w-]+)\.submit$/, {
    isDynamicGroup: true,
    group: eventCategory => ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
    event: 'submit'
  } ],
  [ /^screen\.([\w-]+)$/, {
    isDynamicGroup: true,
    group: eventCategory => VIEW_EVENT_GROUPS[eventCategory],
    event: 'view'
  } ],
  [ /^settings\.communication-preferences\.(optIn|optOut)\.success$/, {
    group: GROUPS.settings,
    event: 'newsletter'
  } ],
  [ /^([\w-]+).verification.success$/, {
    isDynamicGroup: true,
    group: eventCategory => eventCategory in EMAIL_TYPES ? GROUPS.email : null,
    event: 'click'
  } ]
]);

const NOP = () => {};

const EVENT_PROPERTIES = {
  [GROUPS.email]: mixProperties(mapEmailType, mapService),
  [GROUPS.login]: mixProperties(mapEntrypoint, mapService),
  [GROUPS.registration]: mixProperties(mapEntrypoint, mapService),
  [GROUPS.settings]: mapEntrypoint,
  [GROUPS.sms]: NOP
};

const USER_PROPERTIES = {
  [GROUPS.email]: NOP,
  [GROUPS.login]: mixProperties(mapUid, mapUtmProperties),
  [GROUPS.registration]: mixProperties(mapUid, mapUtmProperties),
  [GROUPS.settings]: mixProperties(mapUid, mapNewsletterState),
  [GROUPS.sms]: NOP
};

module.exports = receiveEvent;

function receiveEvent (event, data) {
  if (! event || ! data) {
    return;
  }

  const eventType = event.type;
  let mapping = EVENTS[eventType];
  let eventCategory;

  if (! mapping) {
    for (const [ key, value ] of FUZZY_EVENTS.entries()) {
      const match = key.exec(eventType);
      if (match) {
        mapping = value;
        if (match.length === 2) {
          eventCategory = match[1];
        }
        break;
      }
    }
  }

  if (mapping) {
    let group = mapping.group;
    if (mapping.isDynamicGroup) {
      group = group(eventCategory);
      if (! group) {
        return;
      }
    }

    process.stderr.write(`${JSON.stringify({
      op: 'amplitudeEvent',
      time: event.time,
      user_id: marshallOptionalValue(data.uid),
      device_id: marshallOptionalValue(data.deviceId),
      event_type: `${group} - ${mapping.event}`,
      session_id: data.flowBeginTime,
      event_properties: mapEventProperties(group, eventCategory, data),
      user_properties: mapUserProperties(group, eventCategory, data),
      app_version: APP_VERSION,
      language: data.lang
    })}\n`);
  }
}

function mapEventProperties (group, eventCategory, data) {
  return Object.assign({
    device_id: marshallOptionalValue(data.deviceId)
  }, EVENT_PROPERTIES[group](eventCategory, data));
}

function mapUserProperties (group, eventCategory, data) {
  return Object.assign({
    flow_id: marshallOptionalValue(data.flowId),
  }, USER_PROPERTIES[group](eventCategory, data));
}

function marshallOptionalValue (value) {
  if (value && value !== 'none') {
    return value;
  }
}

function mixProperties (...mappers) {
  return (eventCategory, data) => Object.assign({}, ...mappers.map(m => m(eventCategory, data)));
}

function mapEmailType (eventCategory) {
  const email_type = EMAIL_TYPES[eventCategory];
  if (email_type) {
    return { email_type };
  }
}

function mapEntrypoint (eventCategory, data) {
  const entrypoint = marshallOptionalValue(data.entrypoint);
  if (entrypoint) {
    return { entrypoint };
  }
}

function mapService (eventCategory, data) {
  const service = marshallOptionalValue(data.service);
  if (service) {
    return { service };
  }
}

function mapNewsletterState (eventCategory) {
  const newsletter_state = NEWSLETTER_STATES[eventCategory];
  if (newsletter_state) {
    return { newsletter_state };
  }
}

function mapUid (eventCategory, data) {
  const fxa_uid = marshallOptionalValue(data.uid);
  if (fxa_uid) {
    return { fxa_uid };
  }
}

function mapUtmProperties (eventCategory, data) {
  return {
    utm_campaign: marshallOptionalValue(data.utm_campaign),
    utm_content: marshallOptionalValue(data.utm_content),
    utm_medium: marshallOptionalValue(data.utm_medium),
    utm_source: marshallOptionalValue(data.utm_source),
    utm_term: marshallOptionalValue(data.utm_term)
  };
}


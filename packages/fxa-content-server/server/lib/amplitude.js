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

const geolocate = require('./geo-locate');
const P = require('bluebird');
const ua = require('node-uap');

const SERVICES = require('./configuration').get('oauth_client_id_map');

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
  [ /^settings\.clients\.disconnect\.submit\.([a-z]+)$/, {
    group: GROUPS.settings,
    event: 'disconnect_device'
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
  [GROUPS.login]: mapService,
  [GROUPS.registration]: mapService,
  [GROUPS.settings]: mapDisconnectReason,
  [GROUPS.sms]: NOP
};

const USER_PROPERTIES = {
  [GROUPS.email]: mapFlowId,
  [GROUPS.login]: mixProperties(mapFlowId, mapUtmProperties),
  [GROUPS.registration]: mixProperties(mapFlowId, mapUtmProperties),
  [GROUPS.settings]: mapNewsletterState,
  [GROUPS.sms]: mapFlowId
};

module.exports = receiveEvent;

function receiveEvent (event, request, data) {
  if (! event || ! data) {
    return P.resolve();
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

  return P.resolve()
    .then(() => {
      if (mapping) {
        let group = mapping.group;
        if (mapping.isDynamicGroup) {
          group = group(eventCategory);
          if (! group) {
            return;
          }
        }

        return geolocate(request)
          .then(location => {
            const userAgent = ua.parse(request.headers['user-agent']);

            process.stderr.write(`${
              JSON.stringify(
                Object.assign({
                  op: 'amplitudeEvent',
                  time: event.time,
                  user_id: marshallOptionalValue(data.uid),
                  device_id: marshallOptionalValue(data.deviceId),
                  event_type: `${group} - ${mapping.event}`,
                  session_id: data.flowBeginTime,
                  event_properties: mapEventProperties(group, mapping.event, eventCategory, data),
                  user_properties: mapUserProperties(group, eventCategory, data, userAgent),
                  app_version: APP_VERSION,
                  language: data.lang
                }, mapOs(userAgent), mapDevice(userAgent), mapLocation(location))
              )
            }\n`);
          });
      }
    });
}

function mapEventProperties (group, event, eventCategory, data) {
  return Object.assign({
    device_id: marshallOptionalValue(data.deviceId)
  }, EVENT_PROPERTIES[group](event, eventCategory, data));
}

function mapUserProperties (group, eventCategory, data, userAgent) {
  return Object.assign(
    {},
    mapBrowser(userAgent),
    mapEntrypoint(data),
    mapExperiments(data),
    USER_PROPERTIES[group](eventCategory, data)
  );
}

function marshallOptionalValue (value) {
  if (value && value !== 'none') {
    return value;
  }
}

function mapOs (userAgent) {
  return mapUserAgentProperties(userAgent, 'os', 'os_name', 'os_version');
}

function mapBrowser (userAgent) {
  return mapUserAgentProperties(userAgent, 'ua', 'ua_browser', 'ua_version');
}

function mapUserAgentProperties (userAgent, key, familyProperty, versionProperty) {
  const group = userAgent[key];
  const { family } = group;
  if (family && family !== 'Other') {
    return {
      [familyProperty]: family,
      [versionProperty]: marshallVersion(group)
    };
  }
}

function mapLocation (location) {
  if (location && (location.country || location.state)) {
    return {
      country: location.country,
      region: location.state
    };
  }
}

function marshallVersion (version) {
  // To maintain consistency with metrics emitted by the auth server,
  // we can't rely on toVersionString() here. Ultimately, this code
  // should be refactored out of the content server as part of
  // https://github.com/mozilla/fxa-shared/issues/11

  if (! version.major) {
    return;
  }

  if (! version.minor || parseInt(version.minor) === 0) {
    return version.major;
  }

  return `${version.major}.${version.minor}`;
}

function mapDevice (userAgent) {
  const { brand, family: device_model } =  userAgent.device;
  if (brand && device_model && brand !== 'Generic') {
    return { device_model };
  }
}

function mixProperties (...mappers) {
  return (event, eventCategory, data) =>
    Object.assign({}, ...mappers.map(m => m(event, eventCategory, data)));
}

function mapEntrypoint (data) {
  const entrypoint = marshallOptionalValue(data.entrypoint);
  if (entrypoint) {
    return { entrypoint };
  }
}

function mapExperiments (data) {
  if (data.experiments && data.experiments.length > 0) {
    return {
      experiments: data.experiments.map(e => `${toSnakeCase(e.choice)}_${toSnakeCase(e.group)}`)
    };
  }
}

function toSnakeCase (string) {
  return string.replace(/([a-z])([A-Z])/g, (s, c1, c2) => `${c1}_${c2.toLowerCase()}`)
    .replace(/([A-Z])/g, c => c.toLowerCase())
    .replace(/\./g, '_')
    .replace(/-/g, '_');
}

function mapDisconnectReason (event, eventCategory) {
  if (event === 'disconnect_device' && eventCategory) {
    return { reason: eventCategory };
  }
}

function mapEmailType (event, eventCategory) {
  const email_type = EMAIL_TYPES[eventCategory];
  if (email_type) {
    return { email_type };
  }
}

function mapService (event, eventCategory, data) {
  const service = marshallOptionalValue(data.service);
  if (service) {
    return { service: SERVICES[service] || service };
  }
}

function mapFlowId (eventCategory, data) {
  const flow_id = marshallOptionalValue(data.flowId);
  if (flow_id) {
    return { flow_id };
  }
}

function mapNewsletterState (eventCategory) {
  const newsletter_state = NEWSLETTER_STATES[eventCategory];
  if (newsletter_state) {
    return { newsletter_state };
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


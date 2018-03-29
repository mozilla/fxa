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
const ua = require('node-uap');

const SERVICES = require('./configuration').get('oauth_client_id_map');

const APP_VERSION = /^[0-9]+\.([0-9]+)\./.exec(require('../../package.json').version)[1];

const GROUPS = {
  connectDevice: 'fxa_connect_device',
  email: 'fxa_email',
  emailFirst: 'fxa_email_first',
  login: 'fxa_login',
  registration: 'fxa_reg',
  settings: 'fxa_pref',
  sms: 'fxa_sms'
};

const VIEW_ENGAGE_SUBMIT_EVENT_GROUPS = {
  'enter-email': GROUPS.emailFirst,
  'force-auth': GROUPS.login,
  settings: GROUPS.settings,
  signin: GROUPS.login,
  signup: GROUPS.registration,
  sms: GROUPS.connectDevice
};

const CONNECT_DEVICE_FLOWS = {
  'app-store': 'store_buttons',
  install_from: 'store_buttons',
  signin_from: 'signin',
  sms: 'sms'
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

// In the following regular expressions, the first match group is exposed to
// the rest of the code as `eventCategory` and the second as `eventTarget`.
const FUZZY_EVENTS = new Map([
  [ /^flow\.([\w-]+)\.engage$/, {
    isDynamicGroup: true,
    group: eventCategory => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
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
  [ /^flow\.((?:install|signin)_from)\.\w+$/, {
    group: GROUPS.connectDevice,
    event: 'view'
  } ],
  [ /^flow\.connect-another-device\.link\.(app-store)\.([\w-]+)$/, {
    group: GROUPS.connectDevice,
    event: 'engage'
  } ],
  [ /^flow\.([\w-]+)\.submit$/, {
    isDynamicGroup: true,
    group: eventCategory => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
    event: 'submit'
  } ],
  [ /^screen\.([\w-]+)$/, {
    isDynamicGroup: true,
    group: eventCategory => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
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
  [ /^([\w-]+).verification.clicked$/, {
    isDynamicGroup: true,
    group: eventCategory => eventCategory in EMAIL_TYPES ? GROUPS.email : null,
    event: 'click'
  } ]
]);

const EVENT_PROPERTIES = {
  [GROUPS.connectDevice]: mapConnectDeviceFlow,
  [GROUPS.email]: mixProperties(mapEmailType, mapService),
  [GROUPS.emailFirst]: mapService,
  [GROUPS.login]: mapService,
  [GROUPS.registration]: mapService,
  [GROUPS.settings]: mapDisconnectReason
};

const USER_PROPERTIES = {
  [GROUPS.connectDevice]: mapFlowId,
  [GROUPS.email]: mapFlowId,
  [GROUPS.emailFirst]: mixProperties(mapFlowId, mapUtmProperties),
  [GROUPS.login]: mixProperties(mapFlowId, mapUtmProperties),
  [GROUPS.registration]: mixProperties(mapFlowId, mapUtmProperties),
  [GROUPS.settings]: mapNewsletterState
};

module.exports = receiveEvent;

function receiveEvent (event, request, data) {
  if (! event || ! data) {
    return;
  }

  const eventType = event.type;
  let mapping = EVENTS[eventType];
  let eventCategory, eventTarget;

  if (! mapping) {
    for (const [ key, value ] of FUZZY_EVENTS.entries()) {
      const match = key.exec(eventType);
      if (match) {
        mapping = value;
        if (match.length >= 2) {
          eventCategory = match[1];
          if (match.length === 3) {
            eventTarget = match[2];
          }
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

    const location = geolocate(request);
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
          event_properties: mapEventProperties(group, mapping.event, eventCategory, eventTarget, data),
          user_properties: mapUserProperties(group, eventCategory, data, userAgent),
          app_version: APP_VERSION,
          language: data.lang
        }, mapOs(userAgent), mapDevice(userAgent), mapLocation(location))
      )
    }\n`);
  }
}

function mapEventProperties (group, event, eventCategory, eventTarget, data) {
  return Object.assign({
    device_id: marshallOptionalValue(data.deviceId)
  }, EVENT_PROPERTIES[group](event, eventCategory, eventTarget, data));
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
      [versionProperty]: group.toVersionString()
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

function mapDevice (userAgent) {
  const { brand, family: device_model } =  userAgent.device;
  if (brand && device_model && brand !== 'Generic') {
    return { device_model };
  }
}

function mixProperties (...mappers) {
  return (...args) => Object.assign({}, ...mappers.map(m => m(...args)));
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
      '$append': {
        experiments: data.experiments.map(e => `${toSnakeCase(e.choice)}_${toSnakeCase(e.group)}`)
      }
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

function mapConnectDeviceFlow (event, eventCategory, eventTarget) {
  const connect_device_flow = CONNECT_DEVICE_FLOWS[eventCategory];
  if (connect_device_flow) {
    const result = { connect_device_flow };

    if (eventTarget) {
      result.connect_device_os = eventTarget;
    }

    return result;
  }
}

function mapEmailType (event, eventCategory) {
  const email_type = EMAIL_TYPES[eventCategory];
  if (email_type) {
    return { email_type };
  }
}

function mapService (event, eventCategory, eventTarget, data) {
  const service = marshallOptionalValue(data.service);
  if (service) {
    let serviceName, clientId;

    if (service === 'sync') {
      serviceName = service;
    } else {
      serviceName = SERVICES[service] || 'undefined_oauth';
      clientId = service;
    }

    return { service: serviceName, oauth_client_id: clientId };
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


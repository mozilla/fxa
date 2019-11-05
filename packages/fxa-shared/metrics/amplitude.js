/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const DAY = 1000 * 60 * 60 * 24;
const WEEK = DAY * 7;
const FOUR_WEEKS = WEEK * 4;

const GROUPS = {
  activity: 'fxa_activity',
  button: 'fxa_rp_button',
  connectDevice: 'fxa_connect_device',
  email: 'fxa_email',
  emailFirst: 'fxa_email_first',
  login: 'fxa_login',
  notify: 'fxa_notify',
  registration: 'fxa_reg',
  rp: 'fxa_rp',
  settings: 'fxa_pref',
  sms: 'fxa_sms',
  sub: 'fxa_subscribe',
  subCancel: 'fxa_subscribe_cancel',
  subManage: 'fxa_subscribe_manage',
  subPayManage: 'fxa_pay_manage',
  subPaySetup: 'fxa_pay_setup',
  subSupport: 'fxa_subscribe_support',
};

const CONNECT_DEVICE_FLOWS = {
  'app-store': 'store_buttons',
  install_from: 'store_buttons',
  signin_from: 'signin',
  sms: 'sms',
};

const NEWSLETTER_STATES = {
  optIn: 'subscribed',
  optOut: 'unsubscribed',
};

const EVENT_PROPERTIES = {
  [GROUPS.activity]: NOP,
  [GROUPS.button]: NOP,
  [GROUPS.connectDevice]: mapConnectDeviceFlow,
  [GROUPS.email]: mapEmailType,
  [GROUPS.emailFirst]: NOP,
  [GROUPS.login]: NOP,
  [GROUPS.notify]: NOP,
  [GROUPS.registration]: mapDomainValidationResult,
  [GROUPS.rp]: NOP,
  [GROUPS.settings]: mapDisconnectReason,
  [GROUPS.sms]: NOP,
  [GROUPS.sub]: NOP,
  [GROUPS.subCancel]: NOP,
  [GROUPS.subManage]: NOP,
  [GROUPS.subPayManage]: NOP,
  [GROUPS.subPaySetup]: NOP,
  [GROUPS.subSupport]: NOP,
};

function NOP() {}

function mapConnectDeviceFlow(eventType, eventCategory, eventTarget) {
  const connect_device_flow = CONNECT_DEVICE_FLOWS[eventCategory];

  if (connect_device_flow) {
    const result = { connect_device_flow };

    if (eventTarget) {
      result.connect_device_os = eventTarget;
    }

    return result;
  }
}

function mapEmailType(eventType, eventCategory, eventTarget, data) {
  const email_type = data.emailTypes[eventCategory];

  if (email_type) {
    const result = {
      email_type,
      email_provider: data.emailDomain,
      email_sender: data.emailSender,
      email_service: data.emailService,
    };

    const { templateVersion } = data;
    if (templateVersion) {
      result.email_template = eventCategory;
      result.email_version = templateVersion;
    }

    return result;
  }
}

function mapDisconnectReason(eventType, eventCategory) {
  if (eventType === 'disconnect_device' && eventCategory) {
    return { reason: eventCategory };
  }
}

function mapDomainValidationResult(
  eventType,
  eventCategory,
  eventTarget,
  data
) {
  // This function is called for all fxa_reg event types, only add the event
  // properties for the results pertaining to domain_validation_result.
  if (eventType === 'domain_validation_result' && eventCategory) {
    return { validation_result: eventCategory };
  }
}

module.exports = {
  EVENT_PROPERTIES,
  GROUPS,
  mapBrowser,
  mapFormFactor,
  mapLocation,
  mapOs,
  mapUserAgentProperties,
  toSnakeCase,

  /**
   * Initialize an amplitude event mapper. You can read more about the amplitude
   * event structure here:
   *
   *   https://amplitude.zendesk.com/hc/en-us/articles/204771828-HTTP-API
   *
   * And you can see our event taxonomy here:
   *
   *   https://docs.google.com/spreadsheets/d/1G_8OJGOxeWXdGJ1Ugmykk33Zsl-qAQL05CONSeD4Uz4
   *
   * @param {Object} services An object of client-id:service-name mappings.
   *
   * @param {Object} events   An object of name:definition event mappings, where
   *                          each definition value is itself an object with `group`
   *                          and `event` string properties.
   *
   * @param {Map} fuzzyEvents A map of regex:definition event mappings. Each regex
   *                          key may include up to two capturing groups. The first
   *                          group is used as the `eventCategory` and the second is
   *                          used as the `eventTarget`. Again each definition value
   *                          is an object containing `group` and `event` properties
   *                          but here `group` can be a string or a function. If it's
   *                          a function, it will be passed the matched `eventCategory`
   *                          as its argument and should return the group string.
   *
   * @returns {Function}      The mapper function.
   */
  initialize(services, events, fuzzyEvents) {
    /**
     * Map from a source event and it's associated data to an amplitude event.
     *
     * @param {Object} event      The source event to map from.
     *
     * @param {String} event.type The type of the event.
     *
     * @param {Number} event.time The time of the event in epoch-milliseconds.
     *
     * @param {Object} data       All of the data associated with the event. This
     *                            parameter supports many properties that are too
     *                            numerous to list here, but may be discerned with
     *                            ease by perusing the code.
     */
    return (event, data) => {
      if (!event || !data) {
        return;
      }

      let eventType = event.type;
      let mapping = events[eventType];
      let eventCategory, eventTarget;

      if (!mapping) {
        for (const [key, value] of fuzzyEvents.entries()) {
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
        eventType = mapping.event;
        if (typeof eventType === 'function') {
          eventType = eventType(eventCategory, eventTarget);
          if (!eventType) {
            return;
          }
        }

        let eventGroup = mapping.group;
        if (typeof eventGroup === 'function') {
          eventGroup = eventGroup(eventCategory);
          if (!eventGroup) {
            return;
          }
        }

        let version;
        try {
          version = /([0-9]+)\.([0-9])$/.exec(data.version)[0];
        } catch (err) {}

        return pruneUnsetValues({
          op: 'amplitudeEvent',
          event_type: `${eventGroup} - ${eventType}`,
          time: event.time,
          user_id: data.uid,
          device_id: data.deviceId,
          session_id: data.flowBeginTime,
          app_version: version,
          language: data.lang,
          country: data.country,
          region: data.region,
          os_name: data.os,
          os_version: data.osVersion,
          device_model: data.formFactor,
          event_properties: mapEventProperties(
            eventType,
            eventGroup,
            eventCategory,
            eventTarget,
            data
          ),
          user_properties: mapUserProperties(eventGroup, eventCategory, data),
        });
      }
    };

    function mapEventProperties(
      eventType,
      eventGroup,
      eventCategory,
      eventTarget,
      data
    ) {
      const { serviceName, clientId } = getServiceNameAndClientId(data);

      return Object.assign(
        pruneUnsetValues({
          service: serviceName,
          oauth_client_id: clientId,
          // TODO: Delete data.plan_id and data.product_id after the camel-cased
          //       equivalents have been in place for at least one train.
          plan_id: data.planId || data.plan_id,
          product_id: data.productId || data.product_id,
        }),
        EVENT_PROPERTIES[eventGroup](
          eventType,
          eventCategory,
          eventTarget,
          data
        )
      );
    }

    function getServiceNameAndClientId(data) {
      let serviceName, clientId;

      const { service } = data;
      if (service && service !== 'content-server') {
        if (service === 'sync') {
          serviceName = service;
        } else {
          serviceName = services[service] || 'undefined_oauth';
          clientId = service;
        }
      }

      return { serviceName, clientId };
    }

    function mapUserProperties(eventGroup, eventCategory, data) {
      return Object.assign(
        pruneUnsetValues({
          entrypoint: data.entrypoint,
          entrypoint_experiment: data.entrypoint_experiment,
          entrypoint_variation: data.entrypoint_variation,
          flow_id: data.flowId,
          ua_browser: data.browser,
          ua_version: data.browserVersion,
          utm_campaign: data.utm_campaign,
          utm_content: data.utm_content,
          utm_medium: data.utm_medium,
          utm_source: data.utm_source,
          utm_term: data.utm_term,
        }),
        mapAppendProperties(data),
        mapSyncDevices(data),
        mapSyncEngines(data),
        mapNewsletterState(eventCategory, data),
        mapNewsletters(data)
      );
    }

    function mapAppendProperties(data) {
      const servicesUsed = mapServicesUsed(data);
      const experiments = mapExperiments(data);
      const userPreferences = mapUserPreferences(data);

      if (servicesUsed || experiments || userPreferences) {
        return {
          $append: Object.assign(
            {},
            servicesUsed,
            experiments,
            userPreferences
          ),
        };
      }
    }

    function mapServicesUsed(data) {
      const { serviceName } = getServiceNameAndClientId(data);

      if (serviceName) {
        return {
          fxa_services_used: serviceName,
        };
      }
    }
  },
};

function pruneUnsetValues(data) {
  const result = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (value || value === false) {
      result[key] = value;
    }
  });

  return result;
}

function mapExperiments(data) {
  const { experiments } = data;

  if (Array.isArray(experiments) && experiments.length > 0) {
    return {
      experiments: experiments.map(
        e => `${toSnakeCase(e.choice)}_${toSnakeCase(e.group)}`
      ),
    };
  }
}

function mapUserPreferences(data) {
  const { userPreferences } = data;

  // Don't send user preferences metric if there are none!
  if (!userPreferences || Object.keys(userPreferences).length === 0) {
    return;
  }

  const formattedUserPreferences = {};
  for (const pref in userPreferences) {
    formattedUserPreferences[toSnakeCase(pref)] = userPreferences[pref];
  }

  return formattedUserPreferences;
}

function toSnakeCase(string) {
  return string
    .replace(/([a-z])([A-Z])/g, (s, c1, c2) => `${c1}_${c2.toLowerCase()}`)
    .replace(/([A-Z])/g, c => c.toLowerCase())
    .replace(/\./g, '_')
    .replace(/-/g, '_');
}

function mapSyncDevices(data) {
  const { devices } = data;

  if (Array.isArray(devices)) {
    return {
      sync_device_count: devices.length,
      sync_active_devices_day: countDevices(devices, DAY),
      sync_active_devices_week: countDevices(devices, WEEK),
      sync_active_devices_month: countDevices(devices, FOUR_WEEKS),
    };
  }
}

function countDevices(devices, period) {
  return devices.filter(device => device.lastAccessTime >= Date.now() - period)
    .length;
}

function mapSyncEngines(data) {
  const { syncEngines: sync_engines } = data;

  if (Array.isArray(sync_engines) && sync_engines.length > 0) {
    return { sync_engines };
  }
}

function mapNewsletterState(eventCategory, data) {
  let newsletter_state = NEWSLETTER_STATES[eventCategory];

  if (!newsletter_state) {
    const { marketingOptIn } = data;

    if (marketingOptIn === true || marketingOptIn === false) {
      newsletter_state = marketingOptIn ? 'subscribed' : 'unsubscribed';
    }
  }

  if (newsletter_state) {
    return { newsletter_state };
  }
}

function mapNewsletters(data) {
  let { newsletters } = data;
  if (newsletters) {
    newsletters = newsletters.map(newsletter => {
      return toSnakeCase(newsletter);
    });
    return { newsletters };
  }
}

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

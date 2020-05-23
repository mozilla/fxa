/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module contains mappings from content server event names to
// amplitude event definitions. A module in fxa-shared is responsible
// for performing the actual transformations.
//
// You can see the event taxonomy here:
//
// https://docs.google.com/spreadsheets/d/1G_8OJGOxeWXdGJ1Ugmykk33Zsl-qAQL05CONSeD4Uz4

/* eslint-disable camelcase */

'use strict';

const _ = require('lodash');
const {
  GROUPS,
  initialize,
  mapBrowser,
  mapFormFactor,
  mapLocation,
  mapOs,
  validate,
} = require('fxa-shared/metrics/amplitude');
const logger = require('./logging/log')();
const ua = require('fxa-shared/metrics/user-agent');
const config = require('./configuration');
const { version: VERSION } = require('../../package.json');

const SERVICES = config.get('oauth_client_id_map');
const amplitude = config.get('amplitude');
const Sentry = require('@sentry/node');
const statsd = require('./statsd');

// Maps view name to email type
const EMAIL_TYPES = {
  'complete-reset-password': 'reset_password',
  'complete-signin': 'login',
  'verify-email': 'registration',
};

const EVENTS = {
  'flow.reset-password.submit': {
    group: GROUPS.login,
    event: 'forgot_submit',
  },
  'flow.choose-what-to-sync.back': {
    group: GROUPS.registration,
    event: 'cwts_back',
  },
  'flow.choose-what-to-sync.engage': {
    group: GROUPS.registration,
    event: 'cwts_engage',
  },
  'flow.choose-what-to-sync.submit': {
    group: GROUPS.registration,
    event: 'cwts_submit',
  },
  'flow.choose-what-to-sync.cwts_do_not_sync': {
    group: GROUPS.registration,
    event: 'cwts_do_not_sync',
  },
  'flow.would-you-like-to-sync.cwts_do_not_sync': {
    group: GROUPS.login,
    event: 'cwts_do_not_sync',
  },
  'flow.update-firefox.engage': {
    group: GROUPS.notify,
    event: 'update_firefox_engage',
  },
  'flow.update-firefox.view': {
    group: GROUPS.notify,
    event: 'update_firefox_view',
  },
  'screen.choose-what-to-sync': {
    group: GROUPS.registration,
    event: 'cwts_view',
  },
  'settings.change-password.success': {
    group: GROUPS.settings,
    event: 'password',
  },
  'settings.signout.success': {
    group: GROUPS.settings,
    event: 'logout',
  },
  'cached.signin.success': {
    group: GROUPS.login,
    event: 'complete',
  },

  // Signup code based metrics
  'screen.confirm-signup-code': {
    group: GROUPS.registration,
    event: 'signup_code_view',
  },
  'flow.confirm-signup-code.engage': {
    group: GROUPS.registration,
    event: 'signup_code_engage',
  },
  'flow.confirm-signup-code.submit': {
    group: GROUPS.registration,
    event: 'signup_code_submit',
  },

  // Add recovery key metrics
  'screen.add-recovery-key': {
    group: GROUPS.settings,
    event: 'add_recovery_key_view',
  },
  'flow.add-recovery-key.submit': {
    group: GROUPS.settings,
    event: 'add_recovery_key_submit',
  },

  // Recovery key confirm password
  'screen.confirm-password': {
    group: GROUPS.settings,
    event: 'recovery_key_confirm_password_view',
  },
  'flow.confirm-password.engage': {
    group: GROUPS.settings,
    event: 'recovery_key_confirm_password_engage',
  },
  'flow.confirm-password.submit': {
    group: GROUPS.settings,
    event: 'recovery_key_confirm_password_submit',
  },
  'flow.confirm-password.success': {
    group: GROUPS.settings,
    event: 'recovery_key_confirm_password_success',
  },

  // Save recovery key
  'screen.save-recovery-key': {
    group: GROUPS.settings,
    event: 'save_recovery_key_view',
  },
  'flow.save-recovery-key.submit': {
    group: GROUPS.settings,
    event: 'save_recovery_key_submit',
  },
  'flow.save-recovery-key.copy': {
    group: GROUPS.settings,
    event: 'save_recovery_key_copy',
  },
  'flow.save-recovery-key.download': {
    group: GROUPS.settings,
    event: 'save_recovery_key_download',
  },
  'flow.save-recovery-key.print': {
    group: GROUPS.settings,
    event: 'save_recovery_key_print',
  },

  // Confirm recovery key
  'screen.confirm-recovery-key': {
    group: GROUPS.settings,
    event: 'confirm_recovery_key_view',
  },
  'flow.confirm-recovery-key.engage': {
    group: GROUPS.settings,
    event: 'confirm_recovery_key_engage',
  },
  'flow.confirm-recovery-key.submit': {
    group: GROUPS.settings,
    event: 'confirm_recovery_key_submit',
  },
  'flow.confirm-recovery-key.success': {
    group: GROUPS.settings,
    event: 'confirm_recovery_key_success',
  },

  // Verified recovery key
  'screen.post-verify.account-recovery.verified-recovery-key': {
    group: GROUPS.settings,
    event: 'verified_recovery_key_view',
  },
  'flow.post-verify.account-recovery.verified-recovery-key.submit': {
    group: GROUPS.settings,
    event: 'verified_recovery_key_submit',
  },

  'screen.account-recovery-confirm-key': {
    group: GROUPS.login,
    event: 'forgot_password_confirm_recovery_key_view',
  },
  'flow.account-recovery-confirm-key.engage': {
    group: GROUPS.login,
    event: 'forgot_password_confirm_recovery_key_engage',
  },
  'flow.account-recovery-confirm-key.submit': {
    group: GROUPS.login,
    event: 'forgot_password_confirm_recovery_key_submit',
  },

  // Password reset with recovery key metrics
  'screen.account-recovery-reset-password': {
    group: GROUPS.login,
    event: 'forgot_password_recovery_key_view',
  },
  'flow.account-recovery-reset-password.engage': {
    group: GROUPS.login,
    event: 'forgot_password_recovery_key_engage',
  },
  'flow.account-recovery-reset-password.submit': {
    group: GROUPS.login,
    event: 'forgot_password_recovery_key_submit',
  },
  'flow.account-recovery-reset-password.recovery-key-consume.success': {
    group: GROUPS.login,
    event: 'forgot_password_recovery_key_success',
  },

  'flow.add-newsletters.subscribe': {
    group: GROUPS.newsletters,
    event: 'subscribe',
  },

  'flow.add-newsletters.link.maybe-later': {
    group: GROUPS.newsletters,
    event: 'later',
  },

  'screen.connect-another-device': {
    group: GROUPS.connectDevice,
    event: 'view',
  },
  'flow.rp.engage': {
    group: GROUPS.rp,
    event: 'engage',
  },
  'flow.email-domain-validation.triggered': {
    group: GROUPS.registration,
    event: 'domain_validation_triggered',
  },
  'flow.email-domain-validation.skipped': {
    group: GROUPS.registration,
    event: 'domain_validation_skipped',
  },
  'flow.email-domain-validation.ignored': {
    group: GROUPS.registration,
    event: 'domain_validation_ignored',
  },

  'screen.get-started': {
    group: GROUPS.qrConnectDevice,
    event: 'get_started_view',
  },
  'flow.get-started.submit': {
    group: GROUPS.qrConnectDevice,
    event: 'get_started_submit',
  },
  'flow.get-started.link.maybe-later': {
    group: GROUPS.qrConnectDevice,
    event: 'get_started_later',
  },

  'screen.ready-to-scan': {
    group: GROUPS.qrConnectDevice,
    event: 'ready_to_scan_view',
  },
  'flow.ready-to-scan.submit': {
    group: GROUPS.qrConnectDevice,
    event: 'ready_to_scan_submit',
  },
  'flow.ready-to-scan.link.maybe-later': {
    group: GROUPS.qrConnectDevice,
    event: 'ready_to_scan_later',
  },
  'flow.ready-to-scan.link.use-sms': {
    group: GROUPS.qrConnectDevice,
    event: 'ready_to_scan_use_sms',
  },

  'screen.scan-code': {
    group: GROUPS.qrConnectDevice,
    event: 'scan_code_view',
  },
  'flow.scan-code.link.use-sms': {
    group: GROUPS.qrConnectDevice,
    event: 'scan_code_use_sms',
  },
  'flow.scan-code.device-connected': {
    group: GROUPS.qrConnectDevice,
    event: 'scan_code_device_connected',
  },

  'screen.connected': {
    group: GROUPS.qrConnectDevice,
    event: 'connected_view',
  },
  'flow.connected.submit': {
    group: GROUPS.qrConnectDevice,
    event: 'connected_connect_another',
  },
  'flow.connected.link.done': {
    group: GROUPS.qrConnectDevice,
    event: 'connected_done',
  },
  'flow.connected.link.use-sms': {
    group: GROUPS.qrConnectDevice,
    event: 'connected_use_sms',
  },
};

const VIEW_ENGAGE_SUBMIT_EVENT_GROUPS = {
  'add-newsletters': GROUPS.newsletters,
  'enter-email': GROUPS.emailFirst,
  'force-auth': GROUPS.login,
  pair: GROUPS.connectDevice,
  'rp-button': GROUPS.button,
  settings: GROUPS.settings,
  signin: GROUPS.login,
  signup: GROUPS.registration,
  sms: GROUPS.connectDevice,
  subscribe: GROUPS.sub,
  support: GROUPS.subSupport,
};

// In the following regular expressions, the first match group is
// exposed as `eventCategory` and the second as `eventTarget`.
const FUZZY_EVENTS = new Map([
  [
    /^experiment\.(?:control|designF|designG)\.passwordStrength\.([\w]+)$/,
    {
      group: GROUPS.registration,
      event: (eventCategory, eventTarget) => `password_${eventCategory}`,
    },
  ],
  [
    /^flow\.signin-totp-code\.submit$/,
    {
      group: GROUPS.login,
      event: 'totp_code_submit',
    },
  ],
  [
    /^screen\.signin-totp-code$/,
    {
      group: GROUPS.login,
      event: 'totp_code_view',
    },
  ],
  [
    /^flow\.signin-totp-code\.engage$/,
    {
      group: GROUPS.login,
      event: 'totp_code_engage',
    },
  ],
  [
    /^screen\.settings\.two-step-authentication$/,
    {
      group: GROUPS.settings,
      event: 'two_step_authentication_view',
    },
  ],
  [
    /^flow\.([\w-]+)\.engage$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'engage',
    },
  ],
  [
    /^flow\.[\w-]+\.forgot-password$/,
    {
      group: GROUPS.login,
      event: 'forgot_pwd',
    },
  ],
  [
    /^flow\.[\w-]+\.have-account$/,
    {
      group: GROUPS.registration,
      event: 'have_account',
    },
  ],
  [
    /^flow\.((?:install|signin)_from)\.\w+$/,
    {
      group: GROUPS.connectDevice,
      event: 'view',
    },
  ],
  [
    /^screen\.(?:signup|signin)\.(sms)$/,
    {
      group: GROUPS.connectDevice,
      event: 'view',
    },
  ],
  [
    /^flow\.connect-another-device\.link\.(app-store)\.([\w-]+)$/,
    {
      group: GROUPS.connectDevice,
      event: 'engage',
    },
  ],
  [
    /^flow\.([\w-]+)\.submit$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'submit',
    },
  ],
  [
    /^screen\.(?:oauth\.)?([\w-]+)$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'view',
    },
  ],
  [
    /^settings\.communication-preferences\.(optIn|optOut)\.success$/,
    {
      group: GROUPS.settings,
      event: 'newsletter',
    },
  ],
  [
    /^settings\.clients\.disconnect\.submit\.([a-z]+)$/,
    {
      group: GROUPS.settings,
      event: 'disconnect_device',
    },
  ],
  [
    /^([\w-]+).verification.clicked$/,
    {
      group: (eventCategory) =>
        eventCategory in EMAIL_TYPES ? GROUPS.email : null,
      event: 'click',
    },
  ],
  [
    /^flow\.signin-totp-code\.success$/,
    {
      group: GROUPS.login,
      event: 'totp_code_success',
    },
  ],
  [
    /^flow\.(support)\.success$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'success',
    },
  ],
  [
    /^flow\.(support)\.view$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'view',
    },
  ],
  [
    /^flow\.(support)\.fail$/,
    {
      group: (eventCategory) => VIEW_ENGAGE_SUBMIT_EVENT_GROUPS[eventCategory],
      event: 'fail',
    },
  ],
  [
    /^flow\.email-domain-validation\.(block|warn|success)$/,
    {
      group: GROUPS.registration,
      event: 'domain_validation_result',
    },
  ],
]);

const transform = initialize(SERVICES, EVENTS, FUZZY_EVENTS);

module.exports = receiveEvent;

function receiveEvent(event, request, data) {
  if (amplitude.disabled || !event || !request || !data) {
    return;
  }

  if (amplitude.rawEvents) {
    const rawEvent = {
      event,
      context: {
        eventSource: 'content',
        version: VERSION,
        emailTypes: EMAIL_TYPES,
        userAgent: request.headers['user-agent'],
        ..._.pick(data, [
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
        ]),
      },
    };
    logger.info('rawAmplitudeData', rawEvent);
    statsd.increment('amplitude.event.raw');
  }

  const userAgent = ua.parse(request.headers['user-agent']);

  const amplitudeEvent = transform(
    event,
    Object.assign(
      { emailTypes: EMAIL_TYPES, version: VERSION },
      pruneUnsetValues(data),
      mapBrowser(userAgent),
      mapOs(userAgent),
      mapFormFactor(userAgent),
      mapLocation(data.location)
    )
  );
  statsd.increment('amplitude.event');

  if (amplitudeEvent) {
    if (amplitude.schemaValidation) {
      try {
        validate(amplitudeEvent);
      } catch (err) {
        logger.error('amplitude.validationError', { err, amplitudeEvent });

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
          Sentry.captureMessage(
            `Amplitude event failed validation: ${err.message}.`,
            Sentry.Severity.Error
          );
        });
      }
    }

    logger.info('amplitudeEvent', amplitudeEvent);
  } else {
    statsd.increment('amplitude.event.dropped');
  }
}

function pruneUnsetValues(data) {
  const result = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value && value !== 'none') {
      result[key] = value;
    }
  });

  return result;
}

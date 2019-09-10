/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module contains mappings from activity/flow event names to
// amplitude event definitions. A module in fxa-shared is responsible
// for performing the actual transformations.
//
// You can see the event taxonomy here:
//
// https://docs.google.com/spreadsheets/d/1G_8OJGOxeWXdGJ1Ugmykk33Zsl-qAQL05CONSeD4Uz4

'use strict';

const { GROUPS, initialize } = require('../../../fxa-shared/metrics/amplitude');
const P = require('../promise');
const { version: VERSION } = require('../../package.json');

// Maps template name to email type
const EMAIL_TYPES = {
  lowRecoveryCodesEmail: '2fa',
  newDeviceLoginEmail: 'login',
  passwordChangedEmail: 'change_password',
  passwordResetEmail: 'reset_password',
  passwordResetAccountRecoveryEmail: 'account_recovery',
  passwordResetRequiredEmail: 'reset_password',
  postChangePrimaryEmail: 'change_email',
  postRemoveSecondaryEmail: 'secondary_email',
  postVerifyEmail: 'registration',
  postVerifyTrailheadEmail: 'registration',
  postVerifySecondaryEmail: 'secondary_email',
  postAddTwoStepAuthenticationEmail: '2fa',
  postRemoveTwoStepAuthenticationEmail: '2fa',
  postAddAccountRecoveryEmail: 'account_recovery',
  postRemoveAccountRecoveryEmail: 'account_recovery',
  postConsumeRecoveryCodeEmail: '2fa',
  postNewRecoveryCodesEmail: '2fa',
  recoveryEmail: 'reset_password',
  unblockCode: 'unblock',
  verifyEmail: 'registration',
  verifyShortCodeEmail: 'registration',
  verifyLoginEmail: 'login',
  verifyLoginCodeEmail: 'login',
  verifyPrimaryEmail: 'verify',
  verifySyncEmail: 'registration',
  verifySecondaryEmail: 'secondary_email',
  verifyTrailheadEmail: 'registration',
};

const EVENTS = {
  'account.confirmed': {
    group: GROUPS.login,
    event: 'email_confirmed',
  },
  'account.created': {
    group: GROUPS.registration,
    event: 'created',
  },
  'account.login': {
    group: GROUPS.login,
    event: 'success',
  },
  'account.login.blocked': {
    group: GROUPS.login,
    event: 'blocked',
  },
  'account.login.confirmedUnblockCode': {
    group: GROUPS.login,
    event: 'unblock_success',
  },
  'account.reset': {
    group: GROUPS.login,
    event: 'forgot_complete',
  },
  'account.signed': {
    group: GROUPS.activity,
    event: 'cert_signed',
  },
  'account.verified': {
    group: GROUPS.registration,
    event: 'email_confirmed',
  },
  'sms.installFirefox.sent': {
    group: GROUPS.sms,
    event: 'sent',
  },
};

const FUZZY_EVENTS = new Map([
  [
    /^email\.(\w+)\.bounced$/,
    {
      group: eventCategory =>
        EMAIL_TYPES[eventCategory] ? GROUPS.email : null,
      event: 'bounced',
    },
  ],
  [
    /^email\.(\w+)\.sent$/,
    {
      group: eventCategory =>
        EMAIL_TYPES[eventCategory] ? GROUPS.email : null,
      event: 'sent',
    },
  ],
  [
    /^flow\.complete\.(\w+)$/,
    {
      group: eventCategory => GROUPS[eventCategory],
      event: 'complete',
    },
  ],
]);

const ACCOUNT_RESET_COMPLETE = `${GROUPS.login} - forgot_complete`;
const LOGIN_COMPLETE = `${GROUPS.login} - complete`;

module.exports = (log, config) => {
  if (!log || !config.oauth.clientIds) {
    throw new TypeError('Missing argument');
  }

  const verificationReminders = require('../verification-reminders')(
    log,
    config
  );
  verificationReminders.keys.forEach(key => {
    EMAIL_TYPES[
      `verificationReminder${key[0].toUpperCase()}${key.substr(1)}Email`
    ] = 'registration';
  });

  const transformEvent = initialize(
    config.oauth.clientIds,
    EVENTS,
    FUZZY_EVENTS
  );

  return receiveEvent;

  function receiveEvent(event, request, data = {}, metricsContext = {}) {
    if (!event || !request) {
      log.error('amplitude.badArgument', {
        err: 'Bad argument',
        event,
        hasRequest: !!request,
      });
      return P.resolve();
    }

    return request.app.devices
      .catch(() => {})
      .then(devices => {
        const { formFactor } = request.app.ua;

        if (event === 'flow.complete') {
          // HACK: Push flowType into the event so it can be parsed as eventCategory
          event += `.${metricsContext.flowType}`;
        }

        const amplitudeEvent = transformEvent(
          {
            type: event,
            time: metricsContext.time || Date.now(),
          },
          Object.assign(
            {},
            data,
            {
              devices,
              formFactor,
              uid: data.uid || getFromToken(request, 'uid'),
              deviceId: getFromMetricsContext(
                metricsContext,
                'device_id',
                request,
                'deviceId'
              ),
              flowId: getFromMetricsContext(
                metricsContext,
                'flow_id',
                request,
                'flowId'
              ),
              flowBeginTime: getFromMetricsContext(
                metricsContext,
                'flowBeginTime',
                request,
                'flowBeginTime'
              ),
              lang: request.app.locale,
              emailDomain: data.email_domain,
              emailSender: data.email_sender,
              emailService: data.email_service,
              emailTypes: EMAIL_TYPES,
              service: getService(request, data, metricsContext),
              version: VERSION,
            },
            getOs(request),
            getBrowser(request),
            getLocation(request)
          )
        );

        if (amplitudeEvent) {
          log.amplitudeEvent(amplitudeEvent);

          // HACK: Account reset returns a session token so emit login complete too
          if (amplitudeEvent.event_type === ACCOUNT_RESET_COMPLETE) {
            log.amplitudeEvent({
              ...amplitudeEvent,
              event_type: LOGIN_COMPLETE,
              time: amplitudeEvent.time + 1,
            });
          }
        }
      });
  }
};

function getFromToken(request, key) {
  if (request.auth && request.auth.credentials) {
    return request.auth.credentials[key];
  }
}

function getFromMetricsContext(metricsContext, key, request, payloadKey) {
  return (
    metricsContext[key] ||
    (request.payload &&
      request.payload.metricsContext &&
      request.payload.metricsContext[payloadKey])
  );
}

function getOs(request) {
  const { os, osVersion } = request.app.ua;

  if (os) {
    return { os, osVersion };
  }
}

function getBrowser(request) {
  const { browser, browserVersion } = request.app.ua;

  if (browser) {
    return { browser, browserVersion };
  }
}

function getLocation(request) {
  const { location } = request.app.geo;

  if (location && (location.country || location.state)) {
    return {
      country: location.country,
      region: location.state,
    };
  }
}

function getService(request, data, metricsContext) {
  if (data.service) {
    return data.service;
  }

  if (request.payload && request.payload.service) {
    return request.payload.service;
  }

  if (request.query && request.query.service) {
    return request.query.service;
  }

  return metricsContext.service;
}

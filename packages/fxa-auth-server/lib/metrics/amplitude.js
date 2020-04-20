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

const { Container } = require('typedi');
const { StatsD } = require('hot-shots');

const { GROUPS, initialize } = require('../../../fxa-shared/metrics/amplitude');
const { version: VERSION } = require('../../package.json');

// Maps template name to email type
const EMAIL_TYPES = {
  subscriptionReactivation: 'subscription_reactivation',
  subscriptionUpgrade: 'subscription_upgrade',
  subscriptionDowngrade: 'subscription_downgrade',
  subscriptionPaymentExpired: 'subscription_payment_expired',
  subscriptionPaymentFailed: 'subscription_payment_failed',
  subscriptionAccountDeletion: 'subscription_account_deletion',
  subscriptionCancellation: 'subscription_cancellation',
  subscriptionSubsequentInvoice: 'subscription_subsequent_invoice',
  subscriptionFirstInvoice: 'subscription_first_invoice',
  downloadSubscription: 'subscription_download',
  lowRecoveryCodes: '2fa',
  newDeviceLogin: 'login',
  passwordChanged: 'change_password',
  passwordReset: 'reset_password',
  passwordResetAccountRecovery: 'account_recovery',
  passwordResetRequired: 'reset_password',
  postChangePrimary: 'change_email',
  postRemoveSecondary: 'secondary_email',
  postVerify: 'registration',
  postVerifySecondary: 'secondary_email',
  postAddTwoStepAuthentication: '2fa',
  postRemoveTwoStepAuthentication: '2fa',
  postAddAccountRecovery: 'account_recovery',
  postRemoveAccountRecovery: 'account_recovery',
  postConsumeRecoveryCode: '2fa',
  postNewRecoveryCodes: '2fa',
  postVerifyAddRecoveryKey: 'registration',
  postVerifyAddSecondary: 'registration',
  recovery: 'reset_password',
  unblockCode: 'unblock',
  verify: 'registration',
  verifySecondaryCode: 'secondary_email',
  verifyShortCode: 'registration',
  verifyLogin: 'login',
  verifyLoginCode: 'login',
  verifyPrimary: 'verify',
  verifySecondary: 'secondary_email',
  verificationReminderFirst: 'registration',
  verificationReminderSecond: 'registration',
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

  async function receiveEvent(
    eventType,
    request,
    data = {},
    metricsContext = {}
  ) {
    const statsd = Container.get(StatsD);
    if (!eventType || !request) {
      log.error('amplitude.badArgument', {
        err: 'Bad argument',
        event: eventType,
        hasRequest: !!request,
      });
      return;
    }

    let devices;
    try {
      // yes, this syntax is correct. request.app.devices is a promise.
      devices = await request.app.devices;
    } catch (e) {
      // ignore the error
      devices = {};
    }

    const { formFactor } = request.app.ua;
    const service = getService(request, data, metricsContext);
    const uid = data.uid || getFromToken(request, 'uid');
    const deviceId = getFromMetricsContext(
      metricsContext,
      'device_id',
      request,
      'deviceId'
    );
    const flowId = getFromMetricsContext(
      metricsContext,
      'flow_id',
      request,
      'flowId'
    );
    const flowBeginTime = getFromMetricsContext(
      metricsContext,
      'flowBeginTime',
      request,
      'flowBeginTime'
    );
    const productId = getFromMetricsContext(
      metricsContext,
      'product_id',
      request,
      'productId'
    );
    const planId = getFromMetricsContext(
      metricsContext,
      'plan_id',
      request,
      'planId'
    );

    if (eventType === 'flow.complete') {
      // HACK: Push flowType into the event so it can be parsed as eventCategory
      eventType += `.${metricsContext.flowType}`;
    }

    const event = {
      type: eventType,
      time: metricsContext.time || Date.now(),
    };

    if (config.amplitude.rawEvents) {
      const wanted = [
        'entrypoint_experiment',
        'entrypoint_variation',
        'entrypoint',
        'experiments',
        'location',
        'marketingOptIn',
        'newsletters',
        'syncEngines',
        'templateVersion',
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
      const { location } = request.app.geo;
      const rawEvent = {
        event,
        context: {
          ...picked,
          eventSource: 'auth',
          version: VERSION,
          deviceId,
          devices,
          emailDomain: data.email_domain,
          emailSender: data.email_sender,
          emailService: data.email_service,
          emailTypes: EMAIL_TYPES,
          flowBeginTime,
          flowId,
          formFactor,
          lang: request.app.locale,
          location,
          planId,
          productId,
          service,
          uid,
          userAgent: request.headers['user-agent'],
        },
      };
      log.info('rawAmplitudeData', rawEvent);
      statsd.increment('amplitude.event.raw');
    }

    statsd.increment('amplitude.event');

    const amplitudeEvent = transformEvent(event, {
      ...data,
      devices,
      formFactor,
      uid,
      deviceId,
      flowId,
      flowBeginTime,
      productId,
      planId,
      lang: request.app.locale,
      emailDomain: data.email_domain,
      emailSender: data.email_sender,
      emailService: data.email_service,
      emailTypes: EMAIL_TYPES,
      service,
      version: VERSION,
      ...getOs(request),
      ...getBrowser(request),
      ...getLocation(request),
    });

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
    } else {
      statsd.increment('amplitude.event.dropped');
    }
  }
};

module.exports.EMAIL_TYPES = EMAIL_TYPES;

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

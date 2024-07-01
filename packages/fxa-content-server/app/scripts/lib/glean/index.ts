/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';

import { userIdSha256 } from './account';
import * as cachedLogin from './cachedLogin';
import * as cadApproveDevice from './cadApproveDevice';
import * as cadFirefox from './cadFirefox';
import * as cadMobilePair from './cadMobilePair';
import * as cad from './cad';
import * as email from './email';
import * as event from './event';
import * as login from './login';
import * as passwordReset from './passwordReset';
import { accountsEvents } from './pings';
import * as reg from './reg';
import { oauthClientId, service } from './relyingParty';
import { deviceType, entrypoint, flowId } from './session';
import * as thirdPartyAuthSetPassword from './thirdPartyAuthSetPassword';
import * as utm from './utm';

export type GleanMetricsConfig = {
  enabled: boolean;
  applicationId: string;
  uploadEnabled: boolean;
  appDisplayVersion: string;
  channel: string;
  serverEndpoint: string;
  logPings: boolean;
  debugViewTag: string;
};

export type GleanMetricsContext = {
  metrics: any;
  relier: any;
  user: any;
  userAgent: any;
};

type SubmitPingFn = () => Promise<void>;

const eventPropertyNames = ['reason'] as const;
type PropertyNameT = typeof eventPropertyNames;
type PropertyName = PropertyNameT[number];
type EventProperties = {
  [k in PropertyName]?: string;
};

let EXEC_MUTEX = false;
const lambdas: SubmitPingFn[] = [];

const submitPing = async (fn: SubmitPingFn) => {
  lambdas.push(fn);

  if (EXEC_MUTEX) return;

  EXEC_MUTEX = true;
  let f: SubmitPingFn | undefined;

  while ((f = lambdas.shift())) {
    await f();
  }

  EXEC_MUTEX = false;
};

const encoder = new TextEncoder();

let gleanEnabled = false;
let gleanMetricsContext;

const hashUid = async (uid) => {
  const data = encoder.encode(uid);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const uint8View = new Uint8Array(hash);
  const hex = uint8View.reduce(
    (str, byte) => str + ('00' + byte.toString(16)).slice(-2),
    ''
  );
  return hex;
};

const populateMetrics = async (properties: EventProperties = {}) => {
  const account = gleanMetricsContext.user.getSignedInAccount();

  // the "signed in" account could just be the most recently used account from
  // local storage; the user might not have proved that they know the password
  // of the account
  if (account.get('sessionToken')) {
    const hashedUid = await hashUid(account.get('uid'));
    userIdSha256.set(hashedUid);
  } else {
    userIdSha256.set('');
  }

  for (const n of eventPropertyNames) {
    event[n].set(properties[n] || '');
  }

  const flowEventMetadata = gleanMetricsContext.metrics.getFlowEventMetadata();

  oauthClientId.set(gleanMetricsContext.relier.get('clientId') || '');
  service.set(gleanMetricsContext.relier.get('service') || '');

  deviceType.set(gleanMetricsContext.userAgent.genericDeviceType() || '');
  entrypoint.set(flowEventMetadata.entrypoint || '');
  flowId.set(flowEventMetadata.flowId || '');

  utm.campaign.set(flowEventMetadata.utmCampaign || '');
  utm.content.set(flowEventMetadata.utmContent || '');
  utm.medium.set(flowEventMetadata.utmMedium || '');
  utm.source.set(flowEventMetadata.utmSource || '');
  utm.term.set(flowEventMetadata.utmTerm || '');
};

const recordEventMetric = (eventName: string, properties: EventProperties) => {
  switch (eventName) {
    case 'email_first_view':
      email.firstView.record();
      break;
    case 'apple_oauth_email_first_start':
      email.appleOauthEmailFirstStart.record();
      break;
    case 'google_oauth_email_first_start':
      email.googleOauthEmailFirstStart.record();
      break;
    case 'reg_cwts_engage':
      reg.cwtsEngage.record();
      break;
    case 'reg_marketing_engage':
      reg.marketingEngage.record();
      break;
    case 'reg_view':
      reg.view.record();
      break;
    case 'reg_engage':
      reg.engage.record({
        reason: properties['reason'] || '',
      });
      break;
    case 'reg_submit':
      reg.submit.record();
      break;
    case 'reg_submit_success':
      reg.submitSuccess.record();
      break;
    case 'reg_signup_code_view':
      reg.signupCodeView.record();
      break;
    case 'reg_signup_code_submit':
      reg.signupCodeSubmit.record();
      break;
    case 'reg_success_view':
      reg.successView.record();
      break;
    case 'login_view':
      login.view.record();
      break;
    case 'login_forgot_pwd_submit':
      login.forgotPwdSubmit.record();
      break;
    case 'login_submit':
      login.submit.record();
      break;
    case 'login_submit_success':
      login.submitSuccess.record();
      break;
    case 'login_submit_frontend_error':
      login.submitFrontendError.record({
        reason: properties['reason'] || '',
      });
      break;
    case 'cached_login_forgot_pwd_submit':
      cachedLogin.forgotPwdSubmit.record();
      break;
    case 'cached_login_view':
      cachedLogin.view.record();
      break;
    case 'cached_login_submit':
      cachedLogin.submit.record();
      break;
    case 'cached_login_success_view':
      cachedLogin.successView.record();
      break;
    case 'login_email_confirmation_view':
      login.emailConfirmationView.record();
      break;
    case 'login_email_confirmation_submit':
      login.emailConfirmationSubmit.record();
      break;
    case 'login_email_confirmation_success_view':
      login.emailConfirmationSuccessView.record();
      break;
    case 'login_totp_form_view':
      login.totpFormView.record();
      break;
    case 'login_totp_code_submit':
      login.totpCodeSubmit.record();
      break;
    case 'login_totp_code_success_view':
      login.totpCodeSuccessView.record();
      break;
    case 'password_reset_create_new_submit':
      passwordReset.createNewSubmit.record();
      break;
    case 'password_reset_create_new_success_view':
      passwordReset.createNewSuccessView.record();
      break;
    case 'password_reset_create_new_view':
      passwordReset.createNewView.record();
      break;
    case 'password_reset_recovery_key_create_new_submit':
      passwordReset.recoveryKeyCreateNewSubmit.record();
      break;
    case 'password_reset_recovery_key_create_new_view':
      passwordReset.recoveryKeyCreateNewView.record();
      break;
    case 'password_reset_recovery_key_create_success_view':
      passwordReset.recoveryKeyCreateSuccessView.record();
      break;
    case 'password_reset_recovery_key_submit':
      passwordReset.recoveryKeySubmit.record();
      break;
    case 'password_reset_recovery_key_view':
      passwordReset.recoveryKeyView.record();
      break;
    case 'password_reset_submit':
      passwordReset.submit.record();
      break;
    case 'password_reset_view':
      passwordReset.view.record();
      break;
    case 'cad_firefox_view':
      cadFirefox.view.record();
      break;
    case 'cad_firefox_choice_view':
      cadFirefox.choiceView.record();
      break;
    case 'cad_firefox_choice_engage':
      cadFirefox.choiceEngage.record({
        reason: properties['reason'] || '',
      });
      break;
    case 'cad_firefox_choice_submit':
      cadFirefox.choiceSubmit.record({
        reason: properties['reason'] || '',
      });
      break;
    case 'cad_firefox_choice_notnow_submit':
      cadFirefox.choiceNotnowSubmit.record();
      break;
    case 'cad_firefox_sync_device_submit':
      cadFirefox.syncDeviceSubmit.record();
      break;
    case 'cad_approve_device_view':
      cadApproveDevice.view.record();
      break;
    case 'cad_mobile_pair_view':
      cadMobilePair.view.record();
      break;
    case 'cad_view':
      cad.view.record();
      break;
    case 'cad_submit':
      cad.submit.record();
      break;
    case 'cad_startbrowsing_submit':
      cad.startbrowsingSubmit.record();
      break;
    case 'third_party_auth_set_password_view':
      thirdPartyAuthSetPassword.view.record();
      break;
    case 'third_party_auth_set_password_engage':
      thirdPartyAuthSetPassword.engage.record();
      break;
    case 'third_party_auth_set_password_submit':
      thirdPartyAuthSetPassword.submit.record();
      break;
    case 'third_party_auth_set_password_success':
      thirdPartyAuthSetPassword.success.record();
      break;
  }
};

const createEventFn =
  (eventName) =>
  async (properties: EventProperties = {}) => {
    if (!gleanEnabled) {
      return;
    }

    const fn = async () => {
      event.name.set(eventName);
      await populateMetrics(properties);

      // recording the event metric triggers the event ping because Glean is initialized with `maxEvents: 1`
      recordEventMetric(eventName, properties);

      accountsEvents.submit();
    };

    submitPing(fn);
  };

export const GleanMetrics = {
  initialize: (config: GleanMetricsConfig, context: GleanMetricsContext) => {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1859629
    // Starting with glean.js v2, accessing localStorage during
    // initialization could cause an error
    try {
      if (config.enabled) {
        Glean.initialize(config.applicationId, config.uploadEnabled, {
          appDisplayVersion: config.appDisplayVersion,
          channel: config.channel,
          serverEndpoint: config.serverEndpoint,
          // Glean does not offer direct control over when metrics are uploaded;
          // this ensures that events are uploaded.
          maxEvents: 1,
        });
        Glean.setLogPings(config.logPings);
        if (config.debugViewTag) {
          Glean.setDebugViewTag(config.debugViewTag);
        }

        gleanMetricsContext = context;
      }
      GleanMetrics.setEnabled(config.enabled);
    } catch (_) {
      // set some states so we won't try to do anything with glean.js later
      config.enabled = false;
      gleanEnabled = false;
    }
  },

  setEnabled: (enabled) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },

  emailFirst: {
    view: createEventFn('email_first_view'),
    appleOauthStart: createEventFn('apple_oauth_email_first_start'),
    googleOauthStart: createEventFn('google_oauth_email_first_start'),
  },

  registration: {
    view: createEventFn('reg_view'),
    submit: createEventFn('reg_submit'),
    success: createEventFn('reg_submit_success'),
  },

  signupConfirmation: {
    view: createEventFn('reg_signup_code_view'),
    submit: createEventFn('reg_signup_code_submit'),
  },

  login: {
    view: createEventFn('login_view'),
    submit: createEventFn('login_submit'),
    success: createEventFn('login_submit_success'),
    error: createEventFn('login_submit_frontend_error'),
  },

  cachedLogin: {
    view: createEventFn('cached_login_view'),
    submit: createEventFn('cached_login_submit'),
    success: createEventFn('cached_login_success_view'),
  },

  loginConfirmation: {
    view: createEventFn('login_email_confirmation_view'),
    submit: createEventFn('login_email_confirmation_submit'),
  },

  totpForm: {
    view: createEventFn('login_totp_form_view'),
    submit: createEventFn('login_totp_code_submit'),
    success: createEventFn('login_totp_code_success_view'),
  },

  cad: {
    view: createEventFn('cad_view'),
    submit: createEventFn('cad_submit'),
    startbrowsingSubmit: createEventFn('cad_startbrowsing_submit'),
  },

  cadFirefox: {
    view: createEventFn('cad_firefox_view'),
    choiceView: createEventFn('cad_firefox_choice_view'),
    choiceEngage: createEventFn('cad_firefox_choice_engage'),
    choiceSubmit: createEventFn('cad_firefox_choice_submit'),
    choiceNotnowSubmit: createEventFn('cad_firefox_choice_notnow_submit'),
    syncDeviceSubmit: createEventFn('cad_firefox_sync_device_submit'),
    notnowSubmit: createEventFn('cad_firefox_notnow_submit'),
  },
  cadMobilePair: {
    view: createEventFn('cad_mobile_pair_view'),
    submit: createEventFn('cad_mobile_pair_submit'),
  },
  cadMobilePairUseAppView: {
    view: createEventFn('cad_mobile_pair_use_app_view'),
  },
  cadApproveDevice: {
    view: createEventFn('cad_approve_device_view'),
    submit: createEventFn('cad_approve_device_submit'),
  },
  setPasswordThirdPartyAuth: {
    view: createEventFn('third_party_auth_set_password_view'),
    engage: createEventFn('third_party_auth_set_password_engage'),
    submit: createEventFn('third_party_auth_set_password_submit'),
    success: createEventFn('third_party_auth_set_password_success'),
  },
};

export default GleanMetrics;

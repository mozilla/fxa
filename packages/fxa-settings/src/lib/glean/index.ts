/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Glean from '@mozilla/glean/web';
import GleanMetricsAPI from '@mozilla/glean/metrics';
import UAParser from 'ua-parser-js';
import { Entries } from 'type-fest';
import {
  GleanMetricsConfig,
  eventsMap,
  EventMapKeys,
  EventsMap,
  GleanPingMetrics,
} from './web/index';
import * as email from './web/email';
import * as error from './web/error';
import * as promoQrMobile from './web/promoQrMobile';
import * as reg from './web/reg';
import * as login from './web/login';
import * as cachedLogin from './web/cachedLogin';
import * as passwordReset from './web/passwordReset';
import * as thirdPartyAuth from './web/thirdPartyAuth';
import * as postVerifySetPassword from './web/postVerifySetPassword';
import * as passkeyEnterPassword from './web/passkeyEnterPassword';
import * as passkey from './web/passkey';
import { userIdSha256, userId } from './web/account';
import { oauthClientId, service } from './web/relyingParty';
import {
  deviceType,
  entrypoint,
  flowId,
  pairingChannelHash,
} from './web/session';
import * as utm from './web/utm';
import * as entrypointQuery from './web/entrypoint';
import { Integration } from '../../models';
import { MetricsFlow } from '../metrics-flow';
import { currentAccount } from '../../lib/cache';
import { getPairingChannelId } from '../pairing-channel-params';

type DeviceTypes = 'mobile' | 'tablet' | 'desktop';
export type GleanMetricsContext = {
  metricsFlow: MetricsFlow | null;
  userAgent: string;
  integration: Integration;
};
type PingFn = ReturnType<typeof createEventFn>;
type SubmitPingFn = () => Promise<void>;
type GleanMetricsT = {
  initialize: (
    config: GleanMetricsConfig,
    context: GleanMetricsContext
  ) => void;
  setEnabled: (enabled: boolean) => void;
  getEnabled: () => boolean;
  isDone: () => Promise<void>;
  pageLoad: (url?: string) => void;
  handleClickEvent(event: Event): void;

  useGlean: () => { enabled: boolean };
} & {
  [k in EventMapKeys]: { [eventKey in keyof EventsMap[k]]: PingFn };
};

let EXEC_MUTEX = false;
const lambdas: SubmitPingFn[] = [];

const submitPing = async (fn: SubmitPingFn) => {
  lambdas.push(fn);

  if (EXEC_MUTEX) return;

  EXEC_MUTEX = true;
  let f: SubmitPingFn | undefined;

  while ((f = lambdas.shift())) {
    try {
      await f();
    } catch (e) {
      // A failed ping must not hold the mutex: isDone() polls it, and callers
      // navigate only once it resolves.
    }
  }

  EXEC_MUTEX = false;
};

let gleanEnabled = false;
let metricsContext: GleanMetricsContext;
let ua: UAParser | null;

const encoder = new TextEncoder();
const sha256Hex = async (value: string) => {
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const uint8View = new Uint8Array(hash);
  const hex = uint8View.reduce(
    (str, byte) => str + ('00' + byte.toString(16)).slice(-2),
    ''
  );
  return hex;
};

const getDeviceType: () => DeviceTypes | void = () => {
  if (ua) {
    // This logic is from the old content server frontend
    const parsedType = ua.getDevice().type;
    switch (parsedType) {
      case 'mobile':
      case 'tablet':
        return parsedType;
      case 'smarttv':
      case 'wearable':
      case 'embedded':
        return 'mobile';
      default:
        return 'desktop';
    }
  }

  if (metricsContext?.userAgent) {
    ua = new UAParser(metricsContext.userAgent);
    return getDeviceType();
  }
};

const initMetrics = async () => {
  userId.set('');
  userIdSha256.set('');
  const account = currentAccount();
  try {
    if (account?.uid) {
      userId.set(account.uid);
      userIdSha256.set(await sha256Hex(account.uid));
    }
  } catch (e) {
    // noop
  }

  oauthClientId.set(metricsContext.integration.data.clientId || '');
  service.set(metricsContext.integration.data.service || '');

  deviceType.set(getDeviceType() || '');
  entrypoint.set(metricsContext.integration.data.entrypoint || '');
  flowId.set(metricsContext.metricsFlow?.flowId || '');

  // The join key across the two devices in a pairing. Re-derived on every event
  // rather than set once, so an event fired before the channel existed does not
  // leave the rest of the flow unjoinable.
  const pairingChannelId = getPairingChannelId();
  pairingChannelHash.set(
    pairingChannelId ? await sha256Hex(pairingChannelId) : ''
  );

  utm.campaign.set(metricsContext.integration.data.utmCampaign || '');
  utm.content.set(metricsContext.integration.data.utmContent || '');
  utm.medium.set(metricsContext.integration.data.utmMedium || '');
  utm.source.set(metricsContext.integration.data.utmSource || '');
  utm.term.set(metricsContext.integration.data.utmTerm || '');

  entrypointQuery.variation.set(
    metricsContext.integration.data.entrypointVariation || ''
  );
  entrypointQuery.experiment.set(
    metricsContext.integration.data.entrypointExperiment || ''
  );
};

const recordEventMetric = async (
  eventName: string,
  gleanPingMetrics: GleanPingMetrics
) => {
  switch (eventName) {
    case 'email_first_view':
      email.firstView.record();
      break;
    case 'email_first_engage':
      email.firstEngage.record();
      break;
    case 'email_first_submit_success':
      email.firstSubmitSuccess.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'email_first_submit_fail':
      email.firstSubmitFail.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'email_first_google_oauth_start':
      email.firstGoogleOauthStart.record();
      break;
    case 'email_first_apple_oauth_start':
      email.firstAppleOauthStart.record();
      break;
    case 'email_first_passkey_submit':
      email.firstPasskeySubmit.record();
      break;
    case 'email_first_passkey_submit_frontend_error':
      email.firstPasskeySubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'email_first_passkey_submit_success':
      email.firstPasskeySubmitSuccess.record();
      break;
    case 'reg_view':
      reg.view.record();
      break;
    case 'reg_engage':
      reg.engage.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_submit':
      reg.submit.record();
      break;
    case 'reg_submit_success':
      reg.submitSuccess.record();
      break;
    case 'reg_signup_code_view':
      reg.signupCodeView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_signup_code_submit':
      reg.signupCodeSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_signup_code_submit_frontend_error':
      reg.signupCodeSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_success_view':
      reg.successView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_age_invalid':
      reg.ageInvalid.record();
      break;
    case 'reg_change_email_link_click':
      reg.changeEmailLinkClick.record();
      break;
    case 'reg_why_do_we_ask_link_click':
      reg.whyDoWeAskLinkClick.record();
      break;
    case 'login_view':
      const loginViewExtra =
        typeof gleanPingMetrics.event?.thirdPartyLinks === 'boolean'
          ? {
              third_party_links: gleanPingMetrics.event.thirdPartyLinks,
            }
          : undefined;
      login.view.record(loginViewExtra);
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
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_diff_account_link_click':
      login.diffAccountLinkClick.record();
      break;
    case 'login_backup_code_view':
      login.backupCodeView.record();
      break;
    case 'login_backup_code_submit':
      login.backupCodeSubmit.record();
      break;
    case 'login_backup_code_success_view':
      login.backupCodeSuccessView.record();
      break;
    case 'login_backup_choice_view':
      login.backupChoiceView.record();
      break;
    case 'login_backup_choice_submit':
      login.backupChoiceSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_engage':
      login.engage.record();
      break;
    case 'login_locked_account_banner_view':
      login.lockedAccountBannerView.record();
      break;
    case 'login_alternative_auth_view':
      login.alternativeAuthView.record();
      break;
    case 'login_alternative_auth_google_start':
      login.alternativeAuthGoogleStart.record();
      break;
    case 'login_alternative_auth_apple_start':
      login.alternativeAuthAppleStart.record();
      break;
    case 'login_passkey_submit':
      login.passkeySubmit.record();
      break;
    case 'login_passkey_submit_frontend_error':
      login.passkeySubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_passkey_submit_success':
      login.passkeySubmitSuccess.record();
      break;
    case 'login_alternative_auth_passkey_submit':
      login.alternativeAuthPasskeySubmit.record();
      break;
    case 'login_alternative_auth_passkey_submit_frontend_error':
      login.alternativeAuthPasskeySubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_alternative_auth_passkey_submit_success':
      login.alternativeAuthPasskeySubmitSuccess.record();
      break;
    case 'login_otp_passkey_submit':
      login.otpPasskeySubmit.record();
      break;
    case 'login_otp_passkey_submit_frontend_error':
      login.otpPasskeySubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_otp_passkey_submit_success':
      login.otpPasskeySubmitSuccess.record();
      break;
    case 'cached_login_forgot_pwd_submit':
      cachedLogin.forgotPwdSubmit.record();
      break;
    case 'cached_login_view':
      const cachedLoginViewExtra =
        typeof gleanPingMetrics.event?.thirdPartyLinks === 'boolean'
          ? {
              third_party_links: gleanPingMetrics.event.thirdPartyLinks,
            }
          : undefined;
      cachedLogin.view.record(cachedLoginViewExtra);
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
    case 'login_recovery_phone_success_view':
      login.recoveryPhoneSuccessView.record();
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
    case 'password_reset_create_new_recovery_key_message_click':
      passwordReset.createNewRecoveryKeyMessageClick.record();
      break;
    case 'password_reset_create_new_submit':
      passwordReset.createNewSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'password_reset_create_new_success_view':
      passwordReset.createNewSuccessView.record();
      break;
    case 'password_reset_create_new_view':
      passwordReset.createNewView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'password_reset_email_confirmation_different_account':
      passwordReset.emailConfirmationDifferentAccount.record();
      break;
    case 'password_reset_email_confirmation_signin':
      passwordReset.emailConfirmationSignin.record();
      break;
    case 'password_reset_remember_password_link_view':
      passwordReset.rememberPasswordLinkView.record({
        has_passkey_option:
          gleanPingMetrics?.event?.['has_passkey_option'] || '',
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'password_reset_remember_password_link_click':
      passwordReset.rememberPasswordLinkClick.record({
        has_passkey_option:
          gleanPingMetrics?.event?.['has_passkey_option'] || '',
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'password_reset_email_confirmation_submit':
      passwordReset.emailConfirmationSubmit.record();
      break;
    case 'password_reset_email_confirmation_view':
      passwordReset.emailConfirmationView.record();
      break;
    case 'password_reset_email_confirmation_resend_code':
      passwordReset.emailConfirmationResendCode.record();
      break;
    case 'password_reset_recovery_key_cannot_find':
      passwordReset.recoveryKeyCannotFind.record();
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
    case 'password_reset_backup_choice_view':
      passwordReset.backupChoiceView.record();
      break;
    case 'password_reset_backup_choice_submit':
      passwordReset.backupChoiceSubmit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'third_party_auth_google_reg_start':
      thirdPartyAuth.googleRegStart.record();
      break;
    case 'third_party_auth_apple_reg_start':
      thirdPartyAuth.appleRegStart.record();
      break;
    case 'third_party_auth_google_login_start':
      thirdPartyAuth.googleLoginStart.record();
      break;
    case 'third_party_auth_apple_login_start':
      thirdPartyAuth.appleLoginStart.record();
      break;
    case 'reg_otp_view':
      reg.otpView.record();
      break;
    case 'reg_otp_engage':
      reg.otpEngage.record();
      break;
    case 'reg_otp_submit':
      reg.otpSubmit.record();
      break;
    case 'reg_otp_submit_success':
      reg.otpSubmitSuccess.record();
      break;
    case 'reg_otp_submit_frontend_error':
      reg.otpSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'reg_otp_email_confirmation_resend_code':
      reg.otpEmailConfirmationResendCode.record();
      break;
    case 'reg_otp_change_email':
      reg.otpChangeEmail.record();
      break;
    case 'login_otp_view':
      login.otpView.record();
      break;
    case 'login_otp_engage':
      login.otpEngage.record();
      break;
    case 'login_otp_submit':
      login.otpSubmit.record();
      break;
    case 'login_otp_submit_success':
      login.otpSubmitSuccess.record();
      break;
    case 'login_otp_submit_frontend_error':
      login.otpSubmitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'login_otp_email_confirmation_resend_code':
      login.otpEmailConfirmationResendCode.record();
      break;
    case 'login_otp_change_email':
      login.otpChangeEmail.record();
      break;
    case 'error_view':
      error.view.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'post_verify_set_password_view':
      postVerifySetPassword.view.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'post_verify_set_password_engage':
      postVerifySetPassword.engage.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'post_verify_set_password_submit':
      postVerifySetPassword.submit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'post_verify_set_password_submit_frontend_error':
      postVerifySetPassword.submitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'post_verify_set_password_success':
      postVerifySetPassword.success.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_button_view':
      passkey.buttonView.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_auth_success':
      passkey.authSuccess.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_get_help_link_click':
      passkey.getHelpLinkClick.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_signin_prf_support':
      passkey.signinPrfSupport.record({
        supported: gleanPingMetrics?.event?.['supported'] || '',
      });
      break;
    case 'passkey_signin_retry_without_prf_request':
      passkey.signinRetryWithoutPrfRequest.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
        outcome: gleanPingMetrics?.event?.['outcome'] || '',
      });
      break;
    case 'passkey_enter_password_view':
      passkeyEnterPassword.view.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_enter_password_engage':
      passkeyEnterPassword.engage.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_enter_password_submit':
      passkeyEnterPassword.submit.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_enter_password_submit_frontend_error':
      passkeyEnterPassword.submitFrontendError.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'passkey_enter_password_success':
      passkeyEnterPassword.success.record({
        reason: gleanPingMetrics?.event?.['reason'] || '',
      });
      break;
    case 'promo_qr_mobile_view':
      promoQrMobile.view.record({
        branch: gleanPingMetrics?.event?.['branch'] || '',
        nimbus_user_id: gleanPingMetrics?.event?.['nimbusUserId'] || '',
      });
      break;
    default: {
      const { recordLazyEventMetric } = await import(
        /* webpackChunkName: "glean-lazy-events" */ './lazy-events'
      );
      recordLazyEventMetric(eventName, gleanPingMetrics);
    }
  }
};

const createEventFn =
  (eventName: string) =>
  (gleanPingMetrics: GleanPingMetrics = {}) => {
    if (!gleanEnabled) {
      return;
    }

    const fn = async () => {
      await initMetrics();

      // recording the event metric triggers the event ping because Glean is initialized with `maxEvents: 1`
      await recordEventMetric(eventName, gleanPingMetrics);
    };

    submitPing(fn);
  };

export const GleanMetrics: Pick<
  GleanMetricsT,
  | 'initialize'
  | 'setEnabled'
  | 'getEnabled'
  | 'useGlean'
  | 'isDone'
  | 'pageLoad'
  | 'handleClickEvent'
> = {
  initialize: async (
    config: GleanMetricsConfig,
    context: GleanMetricsContext
  ) => {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1859629
    // Starting with glean.js v2, accessing localStorage during
    // initialization could cause an error
    try {
      if (config.enabled) {
        Glean.initialize(config.applicationId, config.uploadEnabled, {
          appDisplayVersion: config.appDisplayVersion,
          channel: config.appChannel,
          serverEndpoint: config.serverEndpoint,
          enableAutoPageLoadEvents: true,
          enableAutoElementClickEvents: true,
        });
        Glean.setLogPings(config.logPings);
        if (config.debugViewTag) {
          Glean.setDebugViewTag(config.debugViewTag);
        }
      }
      GleanMetrics.setEnabled(config.enabled);
      metricsContext = context;
      ua = null;

      // try to initialize any available metrics prior to any automatic Glean
      // events
      await initMetrics();
    } catch (_) {
      // set some states so we won't try to do anything with glean.js later
      config.enabled = false;
      gleanEnabled = false;
    }
  },

  setEnabled: (enabled: boolean) => {
    gleanEnabled = enabled;
    Glean.setUploadEnabled(gleanEnabled);
  },

  getEnabled: () => {
    return gleanEnabled;
  },

  useGlean: () => ({ enabled: GleanMetrics.getEnabled() }),

  pageLoad: (url?: string) => {
    if (url) {
      GleanMetricsAPI.pageLoad({ url });
    } else {
      GleanMetricsAPI.pageLoad();
    }
  },

  handleClickEvent(event: Event) {
    GleanMetricsAPI.handleClickEvent(event);
  },

  /**
   * The ping calls are awaited internally for ease of use and that works in
   * most cases.  But in the scenario where we want to wait for the pings to
   * finish before we unload the page, we are doing so, crudely, here.  Do not
   * emit more pings after calling this function.
   */
  isDone: () =>
    new Promise((resolve) => {
      const checkForEmptyFnList = () => {
        if (lambdas.length === 0 && !EXEC_MUTEX) {
          setTimeout(resolve, 5);
        } else {
          setTimeout(checkForEmptyFnList, lambdas.length * 5 || 5);
        }
      };

      checkForEmptyFnList();
    }),
};

for (const [page, events] of Object.entries(eventsMap) as Entries<EventsMap>) {
  (GleanMetrics as any)[page] = Object.entries(events).reduce(
    (acc: { [key: string]: PingFn }, [evt, name]) => {
      acc[evt] = createEventFn(name);
      return acc;
    },
    {}
  );
}

export default GleanMetrics as GleanMetricsT;

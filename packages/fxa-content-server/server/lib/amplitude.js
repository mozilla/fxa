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

const pick = require('lodash/pick');
const {
  GROUPS,
  initialize,
  mapBrowser,
  mapFormFactor,
  mapLocation,
  mapOs,
  validate,
} = require('fxa-shared/metrics/amplitude').amplitude;
const logger = require('./logging/log')();
const ua = require('fxa-shared/lib/user-agent').default;
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
  'cached.signin.success': {
    group: GROUPS.login,
    event: 'complete',
  },
  'pairing.signin.success': {
    group: GROUPS.login,
    event: 'complete_pairing',
  },

  'screen.signin-confirmed': {
    group: GROUPS.signin,
    event: 'signin_confirmed_view',
  },
  'flow.signin-confirmed.continue': {
    group: GROUPS.signin,
    event: 'signin_confirmed_continue',
  },
  'flow.signin-confirmed.start-browsing': {
    group: GROUPS.signin,
    event: 'signin_confirmed_start_browsing',
  },

  'screen.signin-bounced': {
    group: GROUPS.signin,
  },
  'flow.signin-bounced.link.support': {
    group: GROUPS.signin,
    event: 'signin_bounced_view',
  },
  'flow.signin-bounced.link.create-account': {
    group: GROUPS.signin,
    event: 'signin_bounced_create_account',
  },
  'flow.signin-bounced.link.back': {
    group: GROUPS.signin,
    event: 'signin_bounced_back',
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

  // Signup confirmed metrics
  'screen.signup-confirmed': {
    group: GROUPS.registration,
    event: 'signup_confirmed_view',
  },
  'flow.signup-confirmed.continue': {
    group: GROUPS.registration,
    event: 'signup_confirmed_view_continue',
  },
  'flow.signup-confirmed.start-browsing': {
    group: GROUPS.registration,
    event: 'signup_confirmed_start_browsing',
  },

  // Reset password confirmation
  'screen.reset-password-confirmed': {
    group: GROUPS.login,
    event: 'reset_password_confirmed_view',
  },
  'flow.reset-password-confirmed.continue': {
    group: GROUPS.login,
    event: 'reset_password_confirmed_continue',
  },
  'flow.reset-password-confirmed.start-browsing': {
    group: GROUPS.login,
    event: 'reset_password_confirmed_start_browsing',
  },

  // Reset password with recovery key verified
  'screen.reset-password-with-recovery-key-verified': {
    group: GROUPS.login,
    event: 'reset_password_with_recovery_key_verified_view',
  },
  'flow.reset-password-with-recovery-key-verified.generate-new-key': {
    group: GROUPS.login,
    event: 'reset_password_with_recovery_key_verified_generate_new_key',
  },
  'flow.reset-password-with-recovery-key-verified.continue-to-account': {
    group: GROUPS.login,
    event: 'reset_password_with_recovery_key_verified_continue_to_account',
  },
  'flow.reset-password-with-recovery-key-verified.continue': {
    group: GROUPS.login,
    event: 'reset_password_with_recovery_key_verified_continue',
  },
  'flow.reset-password-with-recovery-key-verified.start-browsing': {
    group: GROUPS.login,
    event: 'reset_password_with_recovery_key_verified_start_browsing',
  },

  // Confirm account recovery key
  'screen.confirm-recovery-key': {
    group: GROUPS.activity,
    event: 'confirm_recovery_key_view',
  },
  'flow.confirm-recovery-key.engage': {
    group: GROUPS.activity,
    event: 'confirm_recovery_key_engage',
  },
  'flow.confirm-recovery-key.submit': {
    group: GROUPS.activity,
    event: 'confirm_recovery_key_submit',
  },
  'flow.confirm-recovery-key.success': {
    group: GROUPS.activity,
    event: 'confirm_recovery_key_success',
  },

  // Verified account recovery key
  'screen.post-verify.account-recovery.verified-recovery-key': {
    group: GROUPS.activity,
    event: 'verified_recovery_key_view',
  },
  'flow.post-verify.account-recovery.verified-recovery-key.submit': {
    group: GROUPS.activity,
    event: 'verified_recovery_key_submit',
  },

  // Primary email verified - Primary email confirmed
  'screen.primary-email-verified': {
    group: GROUPS.signup,
    event: 'primary_email_verified_view',
  },
  'flow.primary-email-verified.continue': {
    group: GROUPS.signup,
    event: 'primary_email_verified_view_continue',
  },
  'flow.primary-email-verified.start-browsing': {
    group: GROUPS.signup,
    event: 'primary_email_verified_view_start_browsing',
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

  // Password reset with account recovery key metrics
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
  'flow.scan-code.device-connected': {
    group: GROUPS.qrConnectDevice,
    event: 'scan_code_device_connected',
  },
  'flow.connected.link.done': {
    group: GROUPS.qrConnectDevice,
    event: 'connected_done',
  },
  'enter-email.thirdPartyAuth': {
    group: GROUPS.thirdPartyAuth,
    event: 'view',
  },

  'screen.cannot-create-account': {
    group: GROUPS.registration,
    event: 'cannot_create_account_view',
  },

  // cookies_disabled
  'screen.cookies-disabled': {
    group: GROUPS.activity,
    event: 'cookies_disabled_view',
  },
  'flow.cookies-disabled.try-again-submit': {
    group: GROUPS.activity,
    event: 'cookies_disabled_try_again_submit',
  },
  'flow.cookies-disabled.try-again-success': {
    group: GROUPS.activity,
    event: 'cookies_disabled_try_again_success',
  },
  'flow.cookies-disabled.try-again-fail': {
    group: GROUPS.activity,
    event: 'cookies_disabled_try_again_fail',
  },

  // legal
  'screen.legal': {
    group: GROUPS.activity,
    event: 'legal_view',
  },
  'screen.legal-terms': {
    group: GROUPS.activity,
    event: 'legal_terms_view',
  },
  'screen.legal-privacy': {
    group: GROUPS.activity,
    event: 'legal_privacy_view',
  },
  'flow.legal-terms.back': {
    group: GROUPS.activity,
    event: 'legal_terms_back',
  },
  'flow.legal-privacy.back': {
    group: GROUPS.activity,
    event: 'legal_privacy_back',
  },

  /* Everything under this point should be Settings events, aka 'fxa_pref' group */
  // Account recovery key
  'screen.settings.account-recovery': {
    group: GROUPS.settings,
    event: 'account_recovery_view',
  },
  // Revoke
  'flow.settings.account-recovery.confirm-revoke.submit': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_revoke_submit',
  },
  'flow.settings.account-recovery.confirm-revoke.success': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_revoke_success',
  },
  'flow.settings.account-recovery.confirm-revoke.fail': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_revoke_fail',
  },
  // Create/Change Key
  // Info page
  // The first step of the "recovery key" wizard loads for a user who is creating a key
  'flow.settings.account-recovery.create-key.info': {
    group: GROUPS.settings,
    event: 'account_recovery_create_key_info',
  },
  // The first step of the "recovery key" wizard loads for a user who is changing an existing key
  'flow.settings.account-recovery.change-key.info': {
    group: GROUPS.settings,
    event: 'account_recovery_change_key_info',
  },
  // A user on the first step of the "recovery key" wizard, who is trying to create a new key, clicks the "Start creating your account recovery key" button to proceed to the next step
  'flow.settings.account-recovery.create-key.start': {
    group: GROUPS.settings,
    event: 'account_recovery_create_key_start',
  },
  // A user on the first step of the "recovery key" wizard, who is trying to change an existing key, clicks the button to proceed to the next step
  'flow.settings.account-recovery.change-key.start': {
    group: GROUPS.settings,
    event: 'account_recovery_change_key_start',
  },
  // A user in the recovery key flow to create a key exits the flow
  'flow.settings.account-recovery.create-key.cancel': {
    group: GROUPS.settings,
    event: 'account_recovery_create_key_cancel',
  },
  // A user in the recovery key flow to change an existing key exits the flow
  'flow.settings.account-recovery.change-key.cancel': {
    group: GROUPS.settings,
    event: 'account_recovery_change_key_cancel',
  },
  // Confirm password page
  'flow.settings.account-recovery.confirm-password.submit': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_password_submit',
  },
  'flow.settings.account-recovery.confirm-password.success': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_password_success',
  },
  'flow.settings.account-recovery.confirm-password.fail': {
    group: GROUPS.settings,
    event: 'account_recovery_confirm_password_fail',
  },
  // Key download page
  // A user on the "download" step of the account recovery flow downloads their key
  'flow.settings.account-recovery.recovery-key.download-option': {
    group: GROUPS.settings,
    event: 'account_recovery_option_download',
  },
  // Recovery key download was successful
  'flow.settings.account-recovery.recovery-key.download-success': {
    group: GROUPS.settings,
    event: 'account_recovery_download_success',
  },
  // An error occured while download the recovery key
  'flow.settings.account-recovery.recovery-key.download-failed': {
    group: GROUPS.settings,
    event: 'account_recovery_download_failed',
  },
  // A user on the "download" step of the account recovery flow copies their key to their clipboard
  'flow.settings.account-recovery.recovery-key.copy-option': {
    group: GROUPS.settings,
    event: 'account_recovery_option_copy',
  },
  // A user on the "download" step of the account recovery flow moves to the next step (or exits the flow) without downloading
  'flow.settings.account-recovery.recovery-key.skip-download': {
    group: GROUPS.settings,
    event: 'account_recovery_skip_download',
  },
  // Save hint page
  'flow.settings.account-recovery.create-hint.view': {
    group: GROUPS.settings,
    event: 'account_recovery_create_hint_view',
  },
  // A user on the "hint" step of the account recovery flow clicks the submit button to save the hint they entered into the text input
  'flow.settings.account-recovery.create-hint.submit': {
    group: GROUPS.settings,
    event: 'account_recovery_create_hint_submit',
  },
  'flow.settings.account-recovery.create-hint.success': {
    group: GROUPS.settings,
    event: 'account_recovery_create_hint_success',
  },
  'flow.settings.account-recovery.create-hint.fail': {
    group: GROUPS.settings,
    event: 'account_recovery_create_hint_fail',
  },
  // A user exits hint step of the account recovery key flow without saving a hint, either by exiting the flow entirely or by skipping to the next step
  'flow.settings.account-recovery.create-hint.skip': {
    group: GROUPS.settings,
    event: 'account_recovery_create_hint_skip',
  },
  // Avatar
  'screen.settings.avatar.change': {
    group: GROUPS.settings,
    event: 'avatar_change_view',
  },
  'avatar.crop.submit.change': {
    group: GROUPS.settings,
    event: 'avatar_crop_submit_change',
  },
  // Change password
  'screen.settings.change-password': {
    group: GROUPS.settings,
    event: 'change_password_view',
  },
  'settings.change-password.success': {
    group: GROUPS.settings,
    event: 'password',
  },
  // Create password
  'screen.settings.create-password': {
    group: GROUPS.settings,
    event: 'create_password_view',
  },
  'settings.create-password.engage': {
    group: GROUPS.settings,
    event: 'create_password_engage',
  },
  'settings.create-password.submit': {
    group: GROUPS.settings,
    event: 'create_password_submit',
  },
  'settings.create-password.success': {
    group: GROUPS.settings,
    event: 'create_password_success',
  },
  'settings.create-password.fail': {
    group: GROUPS.settings,
    event: 'create_password_fail',
  },
  // Delete account
  'screen.settings.delete-account': {
    group: GROUPS.settings,
    event: 'delete_account_view',
  },
  'flow.settings.account-delete.terms-checked.success': {
    group: GROUPS.settings,
    event: 'delete_account_terms_checked_success',
  },
  'flow.settings.account-delete.confirm-password.success': {
    group: GROUPS.settings,
    event: 'delete_account_confirm_password_success',
  },
  'flow.settings.account-delete.confirm-password.fail': {
    group: GROUPS.settings,
    event: 'delete_account_confirm_password_fail',
  },
  // Secondary email
  'screen.settings.emails': {
    group: GROUPS.settings,
    event: 'add_secondary_email_view',
  },
  'settings.emails.submit': {
    group: GROUPS.settings,
    event: 'add_secondary_email_submit',
  },
  'verify-secondary-email.verification.clicked': {
    group: GROUPS.settings,
    event: 'verify_secondary_email_clicked',
  },
  'verify-secondary-email.verification.success': {
    group: GROUPS.settings,
    event: 'verify_secondary_email_success',
  },
  'verify-secondary-email.verification.fail': {
    group: GROUPS.settings,
    event: 'verify_secondary_email_fail',
  },
  // Two factor auth
  'screen.settings.two-step-authentication.recovery-codes': {
    group: GROUPS.settings,
    event: 'two_step_authentication_recovery_codes_view',
  },
  'flow.settings.two-step-authentication.submit': {
    group: GROUPS.settings,
    event: 'two_step_authentication_submit',
  },
  'flow.settings.two-step-authentication.download-option': {
    group: GROUPS.settings,
    event: 'two_step_authentication_recovery_codes_download',
  },
  'flow.settings.two-step-authentication.copy-option': {
    group: GROUPS.settings,
    event: 'two_step_authentication_recovery_codes_copy',
  },
  'flow.settings.two-step-authentication.print-option': {
    group: GROUPS.settings,
    event: 'two_step_authentication_recovery_codes_print',
  },
  // Misc
  'settings.signout.success': {
    group: GROUPS.settings,
    event: 'logout',
  },

  // pairing page during sign up
  'screen.signup.pair': {
    group: GROUPS.connectDevice,
    event: 'pair_view',
  },
  'screen.pair': {
    group: GROUPS.connectDevice,
    event: 'pair_view',
  },
  'signup.pair.submit': {
    group: GROUPS.connectDevice,
    event: 'pair_submit',
  },
  'screen.pair.supp': {
    group: GROUPS.connectDevice,
    event: 'pair_supp_view',
  },
  'screen.pair.auth.totp': {
    group: GROUPS.connectDevice,
    event: 'view',
  },
  'pair.submit': {
    group: GROUPS.connectDevice,
    event: 'pair_submit',
  },
  // link to download mobile Firefox
  'screen.pair.downloadlink.engage': {
    group: GROUPS.connectDevice,
    event: 'download_engage',
  },
  // link to skip pairing and go to Settings
  'screen.pair.notnow.engage': {
    group: GROUPS.connectDevice,
    event: 'pair_notnow_engage',
  },

  // pairing process
  'screen.pair.auth.allow': {
    group: GROUPS.qrConnectDevice,
    event: 'view',
  },
  // submit event from pairing authority
  'flow.pair.auth.allow.submit': {
    group: GROUPS.qrConnectDevice,
    event: 'submit',
  },
  // the screen displayed if the pairing authority approved first
  'screen.pair.auth.wait-for-supp': {
    group: GROUPS.qrConnectDevice,
    event: 'wait_for_supp',
  },
  'screen.pair.supp.allow': {
    group: GROUPS.qrConnectDevice,
    event: 'supp_allow_view',
  },
  // the screen displayed if the pairing supplicant approved first
  'screen.pair.supp.wait-for-auth': {
    group: GROUPS.qrConnectDevice,
    event: 'wait_for_auth',
  },
  'screen.pair.auth.complete': {
    group: GROUPS.qrConnectDevice,
    event: 'complete',
  },
  'screen.pair.auth.fx-view': {
    group: GROUPS.qrConnectDevice,
    event: 'fx_view_engage',
  },
  'cad.notnow.engage': {
    group: GROUPS.connectDevice,
    event: 'cad_notnow_engage',
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
  subscribe: GROUPS.sub,
  support: GROUPS.subSupport,
};

// In the following regular expressions, the first match group is
// exposed as `eventCategory` and the second as `eventTarget`.
const FUZZY_EVENTS = new Map([
  [
    /^screen(?:\.signin|\.signup)?\.(get-started|ready-to-scan|scan-code|connected)$/,
    {
      group: GROUPS.qrConnectDevice,
      event: (eventCategory, eventTarget) =>
        `${eventCategory.replace(/-/g, '_')}_view`,
    },
  ],
  [
    /^flow(?:\.signin|\.signup)?\.(get-started|ready-to-scan|scan-code|connected).submit$/,
    {
      group: GROUPS.qrConnectDevice,
      event: (eventCategory, eventTarget) =>
        `${eventCategory.replace(/-/g, '_')}_submit`,
    },
  ],
  [
    /^flow(?:\.signin|\.signup)?\.(get-started|ready-to-scan).link.maybe-later$/,
    {
      group: GROUPS.qrConnectDevice,
      event: (eventCategory, eventTarget) =>
        `${eventCategory.replace(/-/g, '_')}_later`,
    },
  ],
  [
    /^flow(?:\.signin|\.signup)?\.(ready-to-scan|scan-code|connected).link.use-sms$/,
    {
      group: GROUPS.qrConnectDevice,
      event: (eventCategory, eventTarget) =>
        `${eventCategory.replace(/-/g, '_')}_use_sms`,
    },
  ],
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
    /^flow\.(signup|signin)\.connect-another-device\.link\.([\w-]+)$/,
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
  [
    /^flow\.?(apple|google)?\.(deeplink|oauth-start|oauth-complete|signin-complete)$/,
    {
      group: GROUPS.thirdPartyAuth,
      event: (eventCategory, eventTarget) => {
        return `${eventCategory.replace(/-/g, '_')}_${eventTarget.replace(
          /-/g,
          '_'
        )}`;
      },
    },
  ],
  [
    /^flow\.?([\w-]+)?\.(brand-messaging-prelaunch-view|brand-messaging-prelaunch-learn-more|brand-messaging-prelaunch-banner-close|brand-messaging-postlaunch-view|brand-messaging-postlaunch-learn-more|brand-messaging-postlaunch-banner-close)$/,
    {
      group: GROUPS.branding,
      event: (eventCategory, eventTarget) => {
        return `${eventCategory.replace(/-/g, '_')}_${eventTarget.replace(
          /-/g,
          '_'
        )}`;
      },
    },
  ],
  [
    /^screen\.post-verify\.third-party-auth\.set-password$/,
    {
      group: GROUPS.thirdPartyAuth,
      event: 'set_password_view',
    },
  ],
  [
    /^flow\.post-verify\.third-party-auth\.set-password\.(engage|submit|success)$/,
    {
      group: GROUPS.thirdPartyAuth,
      event: (eventCategory, eventTarget) => `set_password_${eventCategory}`,
    },
  ],
]);

const transform = initialize(SERVICES, EVENTS, FUZZY_EVENTS, logger, statsd);

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
        userAgent: request.headers && request.headers['user-agent'],
        ...pick(data, [
          'deviceId',
          'devices',
          'emailDomain',
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

  const userAgent = ua.parse(request.headers && request.headers['user-agent']);

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
          Sentry.captureMessage('Amplitude event failed validation', 'error');
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

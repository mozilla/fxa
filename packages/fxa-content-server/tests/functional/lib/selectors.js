/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Define selectors on a per-screen basis.
 */
define([], function () {
  'use strict';

  /*eslint-disable max-len*/
  return {
    '400': {
      ERROR: '.error',
      HEADER: '#fxa-400-header'
    },
    CHOOSE_WHAT_TO_SYNC: {
      ENGINE_ADDRESSES: '#sync-engine-addresses',
      ENGINE_CREDIT_CARDS: '#sync-engine-creditcards',
      ENGINE_HISTORY: '#sync-engine-history',
      ENGINE_PASSWORDS: '#sync-engine-passwords',
      HEADER: '#fxa-choose-what-to-sync-header',
      SUBMIT: 'button[type=submit]'
    },
    CONFIRM_SIGNIN: {
      HEADER: '#fxa-confirm-signin-header'
    },
    CONFIRM_SIGNUP: {
      HEADER: '#fxa-confirm-header'
    },
    CONNECT_ANOTHER_DEVICE: {
      HEADER: '#fxa-connect-another-device-header'
    },
    FORCE_AUTH: {
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-force-auth-header'
    },
    SETTINGS: {
      HEADER: '#fxa-settings-header',
      PROFILE_HEADER: '#fxa-settings-profile-header .card-header',
      PROFILE_SUB_HEADER: '#fxa-settings-profile-header .card-subheader'
    },
    SIGNIN: {
      EMAIL: 'input[type=email]',
      EMAIL_NOT_EDITABLE: '.prefillEmail',
      HEADER: '#fxa-signin-header',
      PASSWORD: 'input[type=password]'
    },
    SIGNIN_COMPLETE: {
      HEADER: '#fxa-sign-in-complete-header'
    },
    SIGNIN_UNBLOCK: {
      EMAIL_FIELD: '.verification-email-message',
      HEADER: '#fxa-signin-unblock-header'
    },
    SIGNUP: {
      CUSTOMIZE_SYNC_CHECKBOX: '#customize-sync',
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-signup-header',
      LINK_SIGN_IN: 'a#have-account',
      LINK_SUGGEST_SYNC: '#suggest-sync',
      SUB_HEADER: '#fxa-signup-header .service'
    },
    SIGNUP_COMPLETE: {
      HEADER: '#fxa-sign-up-complete-header'
    },
    SMS_LEARN_MORE: {
      HEADER: '#websites-notice'
    },
    SMS_SEND: {
      HEADER: '#fxa-send-sms-header',
      LINK_LEARN_MORE: 'a#learn-more',
      LINK_MARKETING: '.marketing-link',
      LINK_MARKETING_ANDROID: '.marketing-link-android',
      LINK_MARKETING_IOS: '.marketing-link-ios',
      LINK_MAYBE_LATER: 'a[href="/connect_another_device"]',
      LINK_WHY_IS_THIS_REQUIRED: 'a[href="/sms/why"]',
      PHONE_NUMBER: 'input[type="tel"]',
      PHONE_NUMBER_TOOLTIP: 'input[type="tel"] ~ .tooltip',
      SUBMIT: 'button[type="submit"]'
    },
    SMS_SENT: {
      HEADER: '#fxa-sms-sent-header',
      LINK_BACK: '#back',
      LINK_RESEND: '#resend',
      PHONE_NUMBER_SENT_TO: '.success'
    },
    SMS_WHY_IS_THIS_REQUIRED: {
      CLOSE: '.connect-another-device button[type="submit"]',
      HEADER: '#fxa-why-connect-another-device-header',
    }
  };
  /*eslint-enable max-len*/
});

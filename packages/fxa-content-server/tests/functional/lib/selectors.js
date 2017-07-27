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
    CHANGE_PASSWORD: {
      MENU_BUTTON: '#change-password .settings-unit-toggle'
    },
    CHOOSE_WHAT_TO_SYNC: {
      ENGINE_ADDRESSES: '#sync-engine-addresses',
      ENGINE_CREDIT_CARDS: '#sync-engine-creditcards',
      ENGINE_HISTORY: '#sync-engine-history',
      ENGINE_PASSWORDS: '#sync-engine-passwords',
      HEADER: '#fxa-choose-what-to-sync-header',
      SUBMIT: 'button[type=submit]'
    },
    COMPLETE_RESET_PASSWORD: {
      DAMAGED_LINK_HEADER: '#fxa-reset-link-damaged-header',
      EXPIRED_LINK_HEADER: '#fxa-reset-link-expired-header',
      HEADER: '#fxa-complete-reset-password-header',
    },
    CONFIRM_RESET_PASSWORD: {
      HEADER: '#fxa-confirm-reset-password-header',
      LINK_RESEND: '#resend',
      RESEND_SUCCESS: '.success'
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
    EMAIL: {
      ADDRESS_LABEL: '#emails .address',
      ADD_BUTTON: '.email-add:not(.disabled)',
      INPUT: '.new-email',
      MENU_BUTTON: '#emails .settings-unit-stub button',
      NOT_VERIFIED_LABEL: '.not-verified',
      SET_PRIMARY_EMAIL_BUTTON: '.email-address .set-primary',
      VERIFIED_LABEL: '.verified'
    },
    FORCE_AUTH: {
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-force-auth-header'
    },
    MOZILLA_ORG_SYNC: {
      HEADER: '.header-content'
    },
    RESET_PASSWORD: {
      BACK: '#back',
      EMAIL: 'input[type=email]',
      ERROR: '.error',
      HEADER: '#fxa-reset-password-header',
      LINK_ERROR_SIGNUP: '.error a[href="/signup"]',
      LINK_LEARN_HOW_SYNC_WORKS: 'a[href="https://support.mozilla.org/products/firefox/sync"]',
      LINK_SIGNIN: 'a[href="/signin"]',
      SUBMIT: 'button[type="submit"]',
      SUCCESS: '.success'
    },
    SETTINGS: {
      HEADER: '#fxa-settings-header',
      PROFILE_HEADER: '#fxa-settings-profile-header .card-header',
      PROFILE_SUB_HEADER: '#fxa-settings-profile-header .card-subheader',
      SIGNOUT: '#signout'
    },
    SIGNIN: {
      EMAIL: 'input[type=email]',
      EMAIL_NOT_EDITABLE: '.prefillEmail',
      HEADER: '#fxa-signin-header',
      PASSWORD: 'input[type=password]',
      RESET_PASSWORD: 'a[href="/reset_password"]',
      SUBMIT: 'button[type=submit]',
      TOOLTIP: '.tooltip',
    },
    SIGNIN_COMPLETE: {
      HEADER: '#fxa-sign-in-complete-header'
    },
    SIGNIN_UNBLOCK: {
      EMAIL_FIELD: '.verification-email-message',
      HEADER: '#fxa-signin-unblock-header'
    },
    SIGNUP: {
      AGE: '#age',
      CUSTOMIZE_SYNC_CHECKBOX: '#customize-sync',
      EMAIL: 'input[type=email]',
      HEADER: '#fxa-signup-header',
      LINK_SIGN_IN: 'a#have-account',
      LINK_SUGGEST_SIGN_IN: '.error a[href="/signin"]',
      LINK_SUGGEST_SYNC: '#suggest-sync a',
      PASSWORD: 'input[type=password]',
      SUB_HEADER: '#fxa-signup-header .service',
      SUGGEST_SIGN_IN: '.error',
      SUGGEST_SYNC: '#suggest-sync',
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

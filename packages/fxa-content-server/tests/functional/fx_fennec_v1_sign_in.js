/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  'use strict';

  const config = intern.config;
  const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=fx_fennec_v1&service=sync`;
  const SMS_PAGE_URL = `${config.fxaContentRoot}sms?context=fx_desktop_v1&service=sync&signinCodes=true`;

  let email;
  const PASSWORD = '12345678';

  const thenify = FunctionalHelpers.thenify;

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const createUser = FunctionalHelpers.createUser;
  const deleteAllSms = FunctionalHelpers.deleteAllSms;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  const getSmsSigninCode = FunctionalHelpers.getSmsSigninCode;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const type = FunctionalHelpers.type;

  const setupTest = thenify(function (successSelector, options) {
    options = options || {};

    return this.parent
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutSignIn(email, PASSWORD))
      .then(testElementExists(successSelector))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))
      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified('fxaccounts:login'));
        }
      });
  });

  registerSuite({
    name: 'Fx Fennec Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest('#fxa-confirm-signin-header', { preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-in-complete-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest('#fxa-confirm-signin-header', { preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))

        .then(testElementExists('#fxa-sign-in-complete-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest('#fxa-confirm-header', { preVerified: false }))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-connect-another-device-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest('#fxa-signin-unblock-header', { blocked: true, preVerified: true }))

        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'signup in desktop, send an SMS, open deferred deeplink in Fennec': function () {
      const testPhoneNumber = TestHelpers.createPhoneNumber();
      let signinUrlWithSigninCode;

      return this.remote
        // The phoneNumber can be reused by different tests, delete all
        // of its SMS messages to ensure a clean slate.
        .then(deleteAllSms(testPhoneNumber))
        .then(setupTest(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openPage(SMS_PAGE_URL, selectors.SMS_SEND.HEADER))
        .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
        .then(click(selectors.SMS_SEND.SUBMIT))
        .then(testElementExists(selectors.SMS_SENT.HEADER))
        .then(getSmsSigninCode(testPhoneNumber, 0))
        .then(function (signinCode) {
          signinUrlWithSigninCode = `${SIGNIN_PAGE_URL}&signin=${signinCode}`;
          return this.parent
            .then(clearBrowserState())
            .then(openPage(signinUrlWithSigninCode, selectors.SIGNIN.HEADER))
            .then(testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email));
        });
    }
  });
});

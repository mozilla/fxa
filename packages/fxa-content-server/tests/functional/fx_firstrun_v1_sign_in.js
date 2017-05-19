/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  const config = intern.config;
  const PAGE_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';

  var email;
  const PASSWORD = '12345678';

  const SELECTOR_CONFIRM_SIGNIN_HEADER = '#fxa-confirm-signin-header';
  const SELECTOR_CONFIRM_SIGNUP_HEADER = '#fxa-confirm-header';
  const SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER = '#fxa-connect-another-device-header';
  const SELECTOR_SETTINGS_HEADER = '#fxa-settings-header';
  const SELECTOR_SIGNIN_HEADER = '#fxa-signin-header';
  const SELECTOR_SIGNIN_SUB_HEADER = '#fxa-signin-header .service';
  const SELECTOR_SIGNIN_UNBLOCK_HEADER = '#fxa-signin-unblock-header';
  const SELECTOR_SIGNIN_COMPLETE_HEADER = '#fxa-sign-in-complete-header';
  const SELECTOR_VERIFICATION_EMAIL = '.verification-email-message';

  const thenify = FunctionalHelpers.thenify;

  const clearBrowserNotifications = FunctionalHelpers.clearBrowserNotifications;
  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  const noPageTransition = FunctionalHelpers.noPageTransition;
  const noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  const setupTest = thenify(function (options) {
    options = options || {};

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(options.pageUrl || PAGE_URL, '.email'))
      .then(visibleByQSA(SELECTOR_SIGNIN_SUB_HEADER))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: options.canLinkAccountResponse !== false }))
      // delay for the webchannel message
      .sleep(500)
      .then(fillOutSignIn(email, PASSWORD))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'));
  });

  registerSuite({
    name: 'Firstrun Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState({
          force: true
        }));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists(SELECTOR_CONFIRM_SIGNIN_HEADER))

        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(SELECTOR_SIGNIN_COMPLETE_HEADER))
          .then(closeCurrentWindow())

        .then(testElementExists(SELECTOR_SIGNIN_COMPLETE_HEADER))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists(SELECTOR_CONFIRM_SIGNIN_HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(openVerificationLinkInDifferentBrowser(email))

        .then(testElementExists(SELECTOR_SIGNIN_COMPLETE_HEADER))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'unverified': function () {
      this.timeout = 90 * 1000;
      return this.remote
        .then(setupTest({ preVerified: false }))

        .then(testElementExists(SELECTOR_CONFIRM_SIGNUP_HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))
          .then(closeCurrentWindow())

        // Since this is really a signup flow, the original tab
        // redirects to CAD too.
        .then(testElementExists(SELECTOR_CONNECT_ANOTHER_DEVICE_HEADER))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'signin, cancel merge warning': function () {
      return this.remote
        .then(setupTest({ canLinkAccountResponse: false, preVerified: true }))

        .then(noSuchBrowserNotification('fxaccounts:login'))

        // user should not transition to the next screen
        .then(noPageTransition(SELECTOR_SIGNIN_HEADER));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists(SELECTOR_SIGNIN_UNBLOCK_HEADER))
        .then(testElementTextInclude(SELECTOR_VERIFICATION_EMAIL, email))
        .then(fillOutSignInUnblock(email, 0))

        // Only users that go through signin confirmation see
        // `/signin_complete`, and users that go through signin unblock see
        // the default `settings` page.
        .then(testElementExists(SELECTOR_SETTINGS_HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});

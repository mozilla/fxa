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
      .then(visibleByQSA('#fxa-signin-header .service'))
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

        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(openVerificationLinkInDifferentBrowser(email))

        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'unverified': function () {
      this.timeout = 90 * 1000;
      return this.remote
        .then(setupTest({ preVerified: false }))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(clearBrowserNotifications())

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-connect-another-device-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-up-complete-header'))
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'signin, cancel merge warning': function () {
      return this.remote
        .then(setupTest({ canLinkAccountResponse: false, preVerified: true }))

        .then(noSuchBrowserNotification('fxaccounts:login'))

        // user should not transition to the next screen
        .then(noPageTransition('#fxa-signin-header'));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        // Only users that go through signin confirmation see
        // `/signin_complete`, and users that go through signin unblock see
        // the default `settings` page.
        .then(testElementExists('#fxa-settings-header'))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});

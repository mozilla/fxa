/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserNotifications = FunctionalHelpers.clearBrowserNotifications;
  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (context, preVerified, options) {
    options = options || {};

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: preVerified }))
      .then(openPage(context, options.pageUrl || PAGE_URL, '.email'))
      .then(respondToWebChannelMessage(context, 'fxaccounts:can_link_account', { ok: options.canLinkAccountResponse !== false }))
      // delay for the webchannel message
      .sleep(500)
      .then(fillOutSignIn(context, email, PASSWORD))
      .then(testIsBrowserNotified(context, 'fxaccounts:can_link_account'));
  });

  registerSuite({
    name: 'Firstrun Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState(this, {
          force: true
        }));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(clearBrowserNotifications())
        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(noSuchBrowserNotification(this, 'fxaccounts:login'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(clearBrowserNotifications())
        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkDifferentBrowser(email))

        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(noSuchBrowserNotification(this, 'fxaccounts:login'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(clearBrowserNotifications())

        .then(testElementExists('#fxa-confirm-header'))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(this, email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-up-complete-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-up-complete-header'))
        .then(noSuchBrowserNotification(this, 'fxaccounts:login'));
    },

    'signin, cancel merge warning': function () {
      return this.remote
        .then(setupTest(this, true, { canLinkAccountResponse: false }))

        .then(noSuchBrowserNotification(this, 'fxaccounts:login'))

        // user should not transition to the next screen
        .then(noPageTransition('#fxa-signin-header'));
    }
  });
});

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
  var NO_REDIRECT_URL = PAGE_URL + '&haltAfterSignIn=true';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
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
      email = TestHelpers.createEmail();

      return this.remote
        .then(clearBrowserState(this, {
          force: true
        }));
    },

    'verified': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(testElementExists('#fxa-settings-header'))
        // the user should be unable to sign out.
        .then(noSuchElement(this, '#signout'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(testElementExists('#fxa-confirm-header'));
    },

    'with an existing account with the `haltAfterSignIn=true` query parameter': function () {
      return this.remote
        .then(setupTest(this, true, { pageUrl: NO_REDIRECT_URL }))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(noPageTransition('#fxa-signin-header'));
    },

    'signin, cancel merge warning': function () {
      return this.remote
        .then(setupTest(this, true, { canLinkAccountResponse: false }))

        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(noSuchBrowserNotification(this, 'fxaccounts:login'))

        // user should not transition to the next screen
        .then(noPageTransition('#fxa-signin-header'));
    }
  });
});

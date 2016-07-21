/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite,
  TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_ios_v1&service=sync';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfMessage);
  var testIsBrowserNotifiedOfLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (context, preVerified) {

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: preVerified }))
      .then(openPage(context, PAGE_URL, '#fxa-signin-header'))
      .execute(listenForFxaCommands)
      .then(fillOutSignIn(context, email, PASSWORD))
      .then(testIsBrowserNotified(context, 'can_link_account'))
      .then(testIsBrowserNotifiedOfLogin(context, email, { checkVerified: false }))
      .then(testElementExists(preVerified ? '#fxa-confirm-signin-header' : '#fxa-confirm-header'));
  });

  registerSuite({
    name: 'FxiOS v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState(this));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(this, email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-up-complete-header'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-header'));
    },

    'signup link is enabled': function () {
      return this.remote
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .then(testElementExists('a[href="/signup"]'));
    },

    'signin with an unknown account does not allow the user to sign up': function () {
      return this.remote
        .then(openPage(this, PAGE_URL, '#fxa-signin-header'))
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(this, email, PASSWORD))

        .then(visibleByQSA('.error'));
    }
  });
});

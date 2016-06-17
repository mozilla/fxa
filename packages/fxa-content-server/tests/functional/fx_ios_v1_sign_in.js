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
  var EXCLUDE_SIGNUP_PAGE_URL = PAGE_URL + '&exclude_signup=1';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfMessage);
  var testIsBrowserNotifiedOfLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (context, preVerified, options) {
    options = options || {};

    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: preVerified }))
      .then(openPage(context, options.pageUrl || PAGE_URL, '#fxa-signin-header'))
      .execute(listenForFxaCommands)
      .then(fillOutSignIn(context, email, PASSWORD))
      .then(testIsBrowserNotified(context, 'can_link_account'));
  });

  registerSuite({
    name: 'FxiOS v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState(this));
    },

    'verified': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(noPageTransition('#fxa-signin-header'))
        .then(testIsBrowserNotifiedOfLogin(this, email, { checkVerified: true }));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotifiedOfLogin(this, email, { checkVerified: false }));
    },

    'signup link is disabled': function () {
      return this.remote
        .then(openPage(this, EXCLUDE_SIGNUP_PAGE_URL, '#fxa-signin-header'))
        .then(noSuchElement(this, 'a[href="/signup"]'));
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

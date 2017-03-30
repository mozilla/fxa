/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'app/scripts/lib/constants',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, Constants, restmail, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_COMPLETE_SIGNIN_URL = config.fxaContentRoot + 'complete_signin';
  var PAGE_SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var PASSWORD = 'password';
  var user;
  var email;
  var code;
  var uid;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FxDesktopHelpers.testIsBrowserNotifiedOfMessage;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  var createRandomHexString = TestHelpers.createRandomHexString;

  registerSuite({
    name: 'complete_sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
      user = TestHelpers.emailToUser(email);
      return this.remote
        .then(clearBrowserState())
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(PAGE_SIGNIN_URL, '#fxa-signin-header'))
        .execute(listenForFxaCommands)
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotified('can_link_account'))
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))
        .then(restmail(EMAIL_SERVER_ROOT + '/mail/' + user))
        .then((emails) => {
          code = emails[0].headers['x-verify-code'];
          uid = emails[0].headers['x-uid'];
        });
    },

    'open verification link with malformed code': function () {
      code = createRandomHexString(Constants.CODE_LENGTH - 1);
      var url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-verification-link-damaged-header'))

        // a successful user is immediately redirected to the
        // sign-in-complete page.
        .then(testElementExists('#fxa-verification-link-damaged-header'))
        .then(noSuchElement('#resend'));
    },

    'open verification link with server reported bad code': function () {
      var code = createRandomHexString(Constants.CODE_LENGTH);
      var url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-verification-link-reused-header'))

        // Ensure that a link expired error message is displayed
        // rather than a damaged link error
        .then(testElementExists('#fxa-verification-link-reused-header'))
        .then(noSuchElement('#resend'));
    },

    'open verification link with malformed uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH - 1);
      var url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-verification-link-damaged-header'))

        // a successful user is immediately redirected to the
        // sign-in-complete page.
        .then(testElementExists('#fxa-verification-link-damaged-header'))
        .then(noSuchElement('#resend'));
    },

    'open verification link with server reported bad uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH);
      var url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-verification-link-expired-header'))

        // Ensure that a link expired error message is displayed
        // rather than a damaged link error
        .then(testElementExists('#fxa-verification-link-expired-header'))
        .then(noSuchElement('#resend'));
    },

    'open valid email verification link': function () {
      var url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-settings-profile-header'))

        // a successful user is immediately redirected to the
        // sign-in-complete page.
        .then(testElementExists('#fxa-settings-profile-header'));
    }
  });
});

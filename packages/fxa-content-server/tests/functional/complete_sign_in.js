/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'app/scripts/lib/constants',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, Constants, TestHelpers, FunctionalHelpers, FxDesktopHelpers, selectors) {
  const config = intern.config;
  const PAGE_COMPLETE_SIGNIN_URL = config.fxaContentRoot + 'complete_signin';
  const PAGE_SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  const PASSWORD = 'password';

  let code;
  let email;
  let uid;
  let user;

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const getEmailHeaders = FunctionalHelpers.getEmailHeaders;
  const listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  const noSuchElement = FunctionalHelpers.noSuchElement;
  const openPage = FunctionalHelpers.openPage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testIsBrowserNotified = FxDesktopHelpers.testIsBrowserNotifiedOfMessage;
  const testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  const createRandomHexString = TestHelpers.createRandomHexString;

  registerSuite({
    name: 'complete_sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
      user = TestHelpers.emailToUser(email);
      return this.remote
        .then(clearBrowserState())
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(PAGE_SIGNIN_URL, selectors.SIGNIN.HEADER))
        .execute(listenForFxaCommands)
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('can_link_account'))
        .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))
        .then(getEmailHeaders(user, 0))
        .then((headers) => {
          code = headers['x-verify-code'];
          uid = headers['x-uid'];
        });
    },

    'open verification link with malformed code': function () {
      code = createRandomHexString(Constants.CODE_LENGTH - 1);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_DAMAGED))
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with server reported bad code': function () {
      const code = createRandomHexString(Constants.CODE_LENGTH);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_REUSED))
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with malformed uid': function () {
      const uid = createRandomHexString(Constants.UID_LENGTH - 1);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_DAMAGED))
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with server reported bad uid': function () {
      const uid = createRandomHexString(Constants.UID_LENGTH);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_EXPIRED))
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    }
  });
});

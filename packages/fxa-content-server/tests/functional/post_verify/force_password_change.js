/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const FunctionalHelpers = require('./../lib/helpers');
const selectors = require('./../lib/selectors');
const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const ForceChangePassword =
  config.fxaContentRoot + 'post_verify/password/force_password_change';

const ENTER_EMAIL_SYNC_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;

const OAUTH_APP = config.fxaOAuthApp;

const PASSWORD = 'password1234567';
const NEW_PASSWORD = '1234zxcvasdf';
let email;

const {
  clearBrowserState,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutForceChangePassword,
  fillOutSignInTokenCode,
  openFxaFromRp,
  openPage,
  testElementExists,
  testIsBrowserNotified,
  thenify,
} = FunctionalHelpers;

const testAtOAuthApp = thenify(function () {
  return this.parent
    .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

    .getCurrentUrl()
    .then(function (url) {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

registerSuite('post_verify_force_password_change', {
  beforeEach: function () {
    email = createEmail('forcepwdchange{id}');

    return this.remote
      .then(clearBrowserState({ forceAll: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'navigate to page directly and can change password': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(fillOutSignInTokenCode(email, 0))
        .then(
          testElementExists(selectors.POST_VERIFY_FORCE_PASSWORD_CHANGE.HEADER)
        )

        .then(
          openPage(
            ForceChangePassword,
            selectors.POST_VERIFY_FORCE_PASSWORD_CHANGE.HEADER
          )
        )

        .then(fillOutForceChangePassword(PASSWORD, NEW_PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },
    'force change password on login - sync': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_SYNC_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(fillOutSignInTokenCode(email, 0))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(
          testElementExists(selectors.POST_VERIFY_FORCE_PASSWORD_CHANGE.HEADER)
        )

        .then(fillOutForceChangePassword(PASSWORD, NEW_PASSWORD))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },
    'force change password on login - oauth': function () {
      return this.remote
        .then(openFxaFromRp('enter-email'))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(fillOutSignInTokenCode(email, 0))

        .then(
          testElementExists(selectors.POST_VERIFY_FORCE_PASSWORD_CHANGE.HEADER)
        )

        .then(fillOutForceChangePassword(PASSWORD, NEW_PASSWORD))
        .then(testAtOAuthApp());
    },
  },
});

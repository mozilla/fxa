/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./../lib/helpers');
const selectors = require('./../lib/selectors');
const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const ACCOUNT_RECOVERY_URL =
  config.fxaContentRoot + 'post_verify/account_recovery/add_recovery_key';

const PASSWORD = 'password1234567';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
  testElementTextInclude,
  testElementTextNotEmpty,
  type,
} = FunctionalHelpers;

registerSuite('post_verify_account_recovery', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'create account recovery': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(
            ACCOUNT_RECOVERY_URL,
            selectors.POST_VERIFY_ADD_RECOVERY_KEY.HEADER
          )
        )

        .then(click(selectors.POST_VERIFY_ADD_RECOVERY_KEY.SUBMIT))

        .then(
          type(
            selectors.POST_VERIFY_CONFIRM_PASSWORD.PASSWORD,
            'invalidPassword'
          )
        )

        .then(click(selectors.POST_VERIFY_CONFIRM_PASSWORD.SUBMIT))

        .then(
          testElementTextInclude(
            selectors.POST_VERIFY_CONFIRM_PASSWORD.TOOLTIP,
            'incorrect password'
          )
        )

        .then(type(selectors.POST_VERIFY_CONFIRM_PASSWORD.PASSWORD, PASSWORD))

        .then(click(selectors.POST_VERIFY_CONFIRM_PASSWORD.SUBMIT))

        .then(testElementExists(selectors.POST_VERIFY_SAVE_RECOVERY_KEY.HEADER))

        .then(
          testElementTextNotEmpty(
            selectors.POST_VERIFY_SAVE_RECOVERY_KEY.RECOVERY_KEY
          )
        )

        .then(click(selectors.POST_VERIFY_SAVE_RECOVERY_KEY.DONE))

        .then(
          testElementExists(selectors.POST_VERIFY_RECOVERY_KEY_VERIFIED.HEADER)
        );
    },
  },
});

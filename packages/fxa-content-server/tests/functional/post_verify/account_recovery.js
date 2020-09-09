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
let email, recoveryKey;

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
  testSuccessWasShown,
  testSuccessWasNotShown,
  thenify,
  type,
} = FunctionalHelpers;

const getRecoveryKey = thenify(function () {
  return (
    this.parent
      // Extract the recovery key from form
      .findByCssSelector(selectors.POST_VERIFY_SAVE_RECOVERY_KEY.RECOVERY_KEY)
      .getVisibleText()
      .then((key) => {
        recoveryKey = key;
      })
  );
});

registerSuite('post_verify_account_recovery', {
  beforeEach: function () {
    email = createEmail();

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'create account recovery': function () {
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
        .then(testElementExists(selectors.POST_VERIFY_CONFIRM_PASSWORD.HEADER))

        .then(type(selectors.POST_VERIFY_CONFIRM_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.POST_VERIFY_CONFIRM_PASSWORD.SUBMIT))
        .then(testElementExists(selectors.POST_VERIFY_SAVE_RECOVERY_KEY.HEADER))
        .then(
          testElementTextNotEmpty(
            selectors.POST_VERIFY_SAVE_RECOVERY_KEY.RECOVERY_KEY
          )
        )
        .then(getRecoveryKey())
        .then(() => {
          return this.remote
            .then(click(selectors.POST_VERIFY_SAVE_RECOVERY_KEY.DONE))
            .then(
              testElementExists(
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.HEADER
              )
            )
            .then(
              type(
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.RECOVERY_KEY,
                'INVALIDKEY'
              )
            )
            .then(
              click(
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.SUBMIT,
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.TOOLTIP
              )
            )
            .then(
              testElementTextInclude(
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.TOOLTIP,
                'Invalid recovery key'
              )
            )
            .then(
              type(
                selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.RECOVERY_KEY,
                recoveryKey
              )
            )
            .then(click(selectors.POST_VERIFY_CONFIRM_RECOVERY_KEY.SUBMIT))
            .then(
              testElementExists(
                selectors.POST_VERIFY_RECOVERY_KEY_VERIFIED.HEADER
              )
            )
            .then(click(selectors.POST_VERIFY_RECOVERY_KEY_VERIFIED.SUBMIT))
            .then(testSuccessWasShown('Account recovery enabled'));
        });
    },
    'abort account recovery at add_recovery_key': function () {
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
        .then(click(selectors.POST_VERIFY_ADD_RECOVERY_KEY.MAYBE_LATER))
        .then(testSuccessWasNotShown());
    },
    'abort account recovery at confirm_password': function () {
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
        .then(click(selectors.POST_VERIFY_CONFIRM_PASSWORD.MAYBE_LATER))
        .then(testSuccessWasNotShown());
    },
  },
});

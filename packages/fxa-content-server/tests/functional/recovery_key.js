/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const RESET_PASSWORD_URL =
  config.fxaContentRoot + 'reset_password?context=fx_desktop_v3&service=sync';
const PASSWORD = 'passwordzxcv';
const NEW_PASSWORD = '()()():|';
let email, recoveryKey;

const {
  createEmail,
  createUser,
  clearBrowserState,
  click,
  fillOutCompleteResetPassword,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutRecoveryKey,
  fillOutResetPassword,
  fillOutSignUpCode,
  fillOutVerificationCode,
  openPage,
  openVerificationLinkInSameTab,
  testIsBrowserNotified,
  testElementExists,
  testElementTextInclude,
  type,
} = FunctionalHelpers;

registerSuite('Recovery key', {
  beforeEach: function () {
    email = createEmail('sync{id}');
    const remote = this.remote;

    return (
      this.remote
        .then(clearBrowserState({ forceAll: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testElementTextInclude(selectors.RECOVERY_KEY.STATUS, 'Not set'))

        // Complete the steps to add an account recovery key
        .then(
          click(
            selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON,
            selectors.RECOVERY_KEY.PASSWORD_INPUT_LABEL
          )
        ) // recovery-key-unit-row-rouote
        // Once again, click the label first to get it out of the way
        .then(
          click(
            selectors.RECOVERY_KEY.PASSWORD_INPUT_LABEL,
            selectors.RECOVERY_KEY.PASSWORD_INPUT
          )
        )
        .then(click(selectors.RECOVERY_KEY.PASSWORD_INPUT))
        .then(type(selectors.RECOVERY_KEY.PASSWORD_INPUT, PASSWORD))
        .then(
          click(
            selectors.RECOVERY_KEY.CONFIRM_PASSWORD_CONTINUE,
            selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT
          )
        ) // continue-button
        .then(testElementExists(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT))

        // Store the key to be used later
        .findByCssSelector(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT)
        .getVisibleText()
        .then((key) => {
          recoveryKey = key;
          return remote.then(
            click(
              selectors.RECOVERY_KEY.RECOVERY_KEY_DONE_BUTTON,
              selectors.RECOVERY_KEY.STATUS
            )
          );
        })
        .end()
        .then(testElementTextInclude(selectors.RECOVERY_KEY.STATUS, 'Enabled'))
    );
  },

  tests: {
    'can revoke recovery key': function () {
      const remote = this.remote;
      let secondKey;
      return (
        this.remote
          .then(
            click(
              selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.REMOVE_RECOVERY_KEY,
              selectors.RECOVERY_KEY.CONFIRM_REVOKE_DESCRIPTION
            )
          )
          .then(
            testElementExists(selectors.RECOVERY_KEY.CONFIRM_REVOKE_DESCRIPTION)
          )
          .then(
            click(
              selectors.RECOVERY_KEY.CONFIRM_REVOKE_OK,
              selectors.RECOVERY_KEY.STATUS
            )
          )

          // Unfortunately need a delay here because no elements are added/removed that we can
          // wait on to check the text.
          .sleep(1000)
          .then(
            testElementTextInclude(selectors.RECOVERY_KEY.STATUS, 'Not set')
          )

          // create a new recovery key
          .then(click(selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON))
          .then(click(selectors.RECOVERY_KEY.PASSWORD_INPUT_LABEL))
          .then(type(selectors.RECOVERY_KEY.PASSWORD_INPUT, PASSWORD))
          .then(click(selectors.RECOVERY_KEY.CONFIRM_PASSWORD_CONTINUE))
          .then(testElementExists(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT))
          .findByCssSelector(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT)
          .getVisibleText()
          .then((key) => {
            secondKey = key;
            return remote.then(
              click(selectors.RECOVERY_KEY.RECOVERY_KEY_DONE_BUTTON)
            );
          })
          .end()
          .then(
            testElementTextInclude(selectors.RECOVERY_KEY.STATUS, 'Enabled')
          )
          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInSameTab(email, 4))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER
            )
          )

          // enter old key and check for error tooltip
          .then(fillOutRecoveryKey(recoveryKey))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.TOOLTIP
            )
          )

          // enter the new key
          .then(() => {
            return remote.then(fillOutRecoveryKey(secondKey));
          })
          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          // For good measure, lets re-login with new password
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can reset password with recovery key': function () {
      return (
        this.remote
          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInSameTab(email, 2))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER
            )
          )

          // enter invalid recovery key
          .then(fillOutRecoveryKey('N8TVALID'))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.TOOLTIP
            )
          )

          .then(fillOutRecoveryKey(recoveryKey))

          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

          .then(testIsBrowserNotified('fxaccounts:login'))

          // For good measure, lets re-login with new password
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can reset password when forgot recovery key': function () {
      return (
        this.remote
          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInSameTab(email, 2))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER
            )
          )

          .then(click(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.LOST_KEY))

          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

          .then(testIsBrowserNotified('fxaccounts:login'))

          // For good measure, lets re-login with new password
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can not re-use recovery key': function () {
      return (
        this.remote
          .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInSameTab(email, 2))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER
            )
          )

          .then(fillOutRecoveryKey(recoveryKey))

          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

          .then(testIsBrowserNotified('fxaccounts:login'))

          // Attempt to re-use reset link, shows expired link
          .then(openVerificationLinkInSameTab(email, 2))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD.EXPIRED_LINK_HEADER
            )
          )
      );
    },
  },
});

registerSuite('Recovery key - unverified session', {
  beforeEach: function () {
    email = createEmail('sync{id}');

    return (
      this.remote
        .then(clearBrowserState({ force: true }))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        // when an account is created, the original session is verified
        // re-login to destroy original session and created an unverified one
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
    );
  },

  tests: {
    'gated in unverified session open verification same tab': function () {
      return (
        this.remote
          // send and open verification in same tab
          .then(click(selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON))
          // if the session is unverified, then the modal will be shown.
          .then(testElementExists('[data-testid=modal-verify-session]'))
          .then(fillOutVerificationCode(email, 0))
          .then(
            testElementExists(
              selectors.SETTINGS_V2.SECURITY.RECOVERY_KEY.PASSWORD_TEXTBOX_LABEL
            )
          )
      );
    },
  },
});

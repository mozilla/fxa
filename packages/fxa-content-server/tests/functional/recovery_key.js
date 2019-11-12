/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const SETTINGS_URL = `${config.fxaContentRoot}settings`;
const RESET_PASSWORD_URL =
  config.fxaContentRoot +
  'reset_password?context=fx_desktop_v3&service=sync&automatedBrowser=true&forceAboutAccounts=true';
const PASSWORD = 'passwordzxcv';
const NEW_PASSWORD = '()()():|';
let email, recoveryKey;

const {
  createUser,
  clearBrowserState,
  click,
  closeCurrentWindow,
  fillOutRecoveryKey,
  fillOutCompleteResetPassword,
  fillOutResetPassword,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testIsBrowserNotified,
  testElementExists,
  testElementTextInclude,
  type,
} = FunctionalHelpers;

registerSuite('Recovery key', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
    const remote = this.remote;

    return (
      this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))

        .then(click(selectors.RECOVERY_KEY.MENU_BUTTON))
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))

        // Complete the steps to add an account recovery key
        .then(click(selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON))
        .then(type(selectors.RECOVERY_KEY.PASSWORD_INPUT, PASSWORD))
        .then(click(selectors.RECOVERY_KEY.CONFIRM_PASSWORD_CONTINUE))
        .then(testElementExists(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT))

        // Store the key to be used later
        .findByCssSelector(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT)
        .getVisibleText()
        .then(key => {
          recoveryKey = key;
          return remote.then(
            click(selectors.RECOVERY_KEY.RECOVERY_KEY_DONE_BUTTON)
          );
        })
        .end()
    );
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can add recovery key': function() {
      return this.remote
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
        .end();
    },

    'can revoke recovery key': function() {
      return this.remote
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
        .then(click(selectors.RECOVERY_KEY.CONFIRM_REVOKE))
        .then(
          testElementExists(selectors.RECOVERY_KEY.CONFIRM_REVOKE_DESCRIPTION)
        )

        .then(click(selectors.RECOVERY_KEY.CONFIRM_REVOKE_OK))
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))
        .end();
    },

    'can reset password with recovery key': function() {
      return (
        this.remote
          .then(
            openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutResetPassword(email))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInSameTab(email, 2))
          .then(
            testElementExists(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER
            )
          )

          .then(fillOutRecoveryKey('N8TVALID'))
          .then(
            testElementTextInclude(
              selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.TOOLTIP,
              'invalid'
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

    'can reset password when forgot recovery key': function() {
      return (
        this.remote
          .then(
            openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
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

    'can not re-use recovery key': function() {
      return (
        this.remote
          .then(
            openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
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
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');

    return (
      this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        // when an account is created, the original session is verified
        // re-login to destroy original session and created an unverified one
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        // unlock panel
        .then(click(selectors.RECOVERY_KEY.UNLOCK_BUTTON))
    );
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'gated in unverified session open verification same tab': function() {
      return (
        this.remote
          // send and open verification in same tab
          .then(click(selectors.RECOVERY_KEY.UNLOCK_SEND_VERIFY))
          .then(openVerificationLinkInSameTab(email, 0))

          // panel becomes verified and can be opened
          .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
      );
    },

    'gated in unverified session open verification new tab': function() {
      return (
        this.remote
          // send and open verification in new tab
          .then(click(selectors.RECOVERY_KEY.UNLOCK_SEND_VERIFY))
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))

          // panel becomes verified and can be opened
          .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
          .then(closeCurrentWindow())
          .then(switchToWindow(0))
          .then(click(selectors.RECOVERY_KEY.UNLOCK_REFRESH_BUTTON))
          .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))
      );
    },

    'gated in unverified session open verification different browser': function() {
      return (
        this.remote
          // send and open verification in different browser
          .then(click(selectors.RECOVERY_KEY.UNLOCK_SEND_VERIFY))
          .then(openVerificationLinkInDifferentBrowser(email, 0))
          .then(click(selectors.RECOVERY_KEY.UNLOCK_REFRESH_BUTTON))
          .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))
      );
    },
  },
});

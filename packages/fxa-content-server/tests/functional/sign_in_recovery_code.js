/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;
const SETTINGS_URL = `${config.fxaContentRoot}settings`;
const PASSWORD = 'passwordzxcv';
const SYNC_ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;

let email;
let recoveryCode, recoveryCode2;
let secret;

const {
  clearBrowserState,
  click,
  createEmail,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  generateTotpCode,
  getEmail,
  openPage,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('backup authentication code', {
  beforeEach: function () {
    email = createEmail();
    const self = this;
    return (
      this.remote
        .then(clearBrowserState({ force: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.TOTP.MENU_BUTTON))

        .then(click(selectors.TOTP.MENU_BUTTON))

        .then(testElementExists(selectors.TOTP.QR_CODE))
        .then(testElementExists(selectors.TOTP.SHOW_CODE_LINK))

        .then(click(selectors.TOTP.SHOW_CODE_LINK))
        .then(testElementExists(selectors.TOTP.MANUAL_CODE))

        // Store the secret key to recalculate the code later
        .findByCssSelector(selectors.TOTP.MANUAL_CODE)
        .getVisibleText()
        .then((secretKey) => {
          secret = secretKey;
          return (
            self.remote
              .then(
                click(
                  selectors.SETTINGS.SECURITY.TFA.SECURITY_CODE_TEXTBOX_LABEL
                )
              )
              .then(
                type(
                  selectors.TOTP.CONFIRM_CODE_INPUT,
                  generateTotpCode(secret)
                )
              )
              .then(click(selectors.TOTP.CONFIRM_CODE_BUTTON))

              // Store a backup authentication code
              .findByCssSelector(
                selectors.SETTINGS.SECURITY.TFA.FIRST_RECOVERY_CODE
              )
              .getVisibleText()
              .then((code) => {
                recoveryCode = code;
                return self.remote
                  .findByCssSelector(
                    selectors.SETTINGS.SECURITY.TFA.SECOND_RECOVERY_CODE
                  )
                  .getVisibleText()
                  .then((code) => {
                    recoveryCode2 = code;
                  });
              })
              .then(() => {
                return self.remote
                  .then(
                    click(selectors.SETTINGS.SECURITY.TFA.CONTINUE_RECOVERY_KEY)
                  )
                  .then(
                    type(selectors.TOTP.CONFIRM_RECOVERY_INPUT, recoveryCode)
                  )
                  .then(click(selectors.TOTP.CONFIRM_RECOVERY_BUTTON));
              })
          );
        })
        .end()
    );
  },

  tests: {
    'can sign-in with backup authentication code - sync': function () {
      return (
        this.remote
          .then(
            click(
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(
            openPage(SYNC_ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {},
            })
          )

          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          // Fails for invalid code
          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, 'invalid!!!!'))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))
          .then(visibleByQSA('.tooltip'))
          .then(testElementTextInclude('.tooltip', 'invalid'))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          .then(testIsBrowserNotified('fxaccounts:login'))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'can regenerate backup authentication code when low': function () {
      return (
        this.remote
          .then(
            click(
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(
            openPage(SYNC_ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {},
            })
          )

          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          .then(testIsBrowserNotified('fxaccounts:login'))

          // Next attempt to use backup authentication code will redirect to
          // page where user can generate more backup authentication codes
          .then(clearBrowserState({ force: true }))

          .then(
            openPage(SYNC_ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {},
            })
          )

          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.LINK))

          .then(type(selectors.SIGNIN_RECOVERY_CODE.INPUT, recoveryCode2))
          .then(click(selectors.SIGNIN_RECOVERY_CODE.SUBMIT))

          .then(testIsBrowserNotified('fxaccounts:login'))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

          // User gets an email notifying them to generate new backup authentication codes.
          // Clicking the link in email opens the security page
          .then(getEmail(email, 3))
          .then((emailData) => {
            return openPage(
              emailData.headers['x-link'],
              selectors.SETTINGS.SECURITY.TFA.CHANGE_TFA
            );
          })
      );
    },
  },
});

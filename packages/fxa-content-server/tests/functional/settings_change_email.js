/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'passwordzxcv';
const NEW_PASSWORD = 'passwordzxcv1';

let email;
let secondaryEmail;
let newPrimaryEmail;

const {
  clearBrowserState,
  click,
  createEmail,
  fillOutChangePassword,
  fillOutEmailFirstSignUp,
  fillOutEmailFirstSignIn,
  fillOutSignInUnblock,
  fillOutSignUpCode,
  getEmailCode,
  openPage,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testErrorTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('settings change email', {
  beforeEach: function () {
    email = createEmail();
    secondaryEmail = createEmail();
    return (
      this.remote
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))

        // add secondary email, verify
        .then(click(selectors.EMAIL.INPUT_LABEL))
        .then(type(selectors.EMAIL.INPUT, secondaryEmail))
        .then(click(selectors.EMAIL.ADD_BUTTON))
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.BACK_BUTTON))
        .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
        // Awkwardly, to get back to the secondary email code input, we need to click
        // the 'resend email' link.
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.RESEND_EMAIL))
        .then(getEmailCode(secondaryEmail, 0))
        .then((code) => {
          return this.remote
            .then(
              click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_LABEL)
            )
            .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD))
            .then(
              type(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD, code)
            )
            .then(
              click(
                selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_SUBMIT_BUTTON
              )
            );
        })
        .then(testSuccessWasShown())

        // set new primary email
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY))
        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, secondaryEmail)
        )
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))
    );
  },

  tests: {
    'can change primary email and login': function () {
      return (
        this.remote
          // sign out
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))

          // sign in with old primary email fails
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testErrorTextInclude('Primary account email required'))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          // sign in with new primary email
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))

          // shows new primary email
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )
      );
    },

    'can change primary email, change password and login': function () {
      return (
        this.remote
          // change password
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(fillOutChangePassword(PASSWORD, NEW_PASSWORD))

          // sign out and fails login with old password
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.TOOLTIP))

          // sign in with new password
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, NEW_PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )
      );
    },

    'can change primary email, change password, login, change email and login': function () {
      return (
        this.remote
          // change password
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(fillOutChangePassword(PASSWORD, NEW_PASSWORD))

          // sign out and fails login with old password
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.TOOLTIP))

          // sign in with new password
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, NEW_PASSWORD))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )

          // set primary email to original email
          .sleep(10000)
          .then(
            testElementTextEquals(
              selectors.SETTINGS_V2.SECONDARY_EMAIL.HEADER_VALUE,
              email
            )
          )
          .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))

          // sign out and login with new password
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
            )
          )
          .then(
            click(
              selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    /* Disabled - failing on CI but not locally. Followup bug #7863.
    'can change primary email, delete account': function () {
      return (
        this.remote
          // go to delete account screen
          .then(
            click(
              selectors.SETTINGS_DELETE_ACCOUNT.DELETE_ACCOUNT_BUTTON,
              selectors.SETTINGS_DELETE_ACCOUNT.DETAILS
            )
          )
          // enter correct password for deleting account
          .then(fillOutDeleteAccount(PASSWORD))

          // Try creating a new account with the same secondary email as previous account and new password
          // TODO: need to clear storage on the backbone side, #7855
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(secondaryEmail, NEW_PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(secondaryEmail, 3))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // Verify that user can add the same primary email as secondary as used in the previous account
          .then(click(selectors.EMAIL.MENU_BUTTON))
          // add secondary email, verify
          .then(click(selectors.EMAIL.INPUT_LABEL))
          .then(type(selectors.EMAIL.INPUT, email))
          .then(click(selectors.EMAIL.ADD_BUTTON))
          .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.BACK_BUTTON))
          .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
          // Awkwardly, to get back to the secondary email code input, we need to click
          // the 'resend email' link.
          .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.RESEND_EMAIL))
          .then(getEmailCode(email, 4)) // TODO: is 1 the right email index?
          .then((code) => {
            return this.remote
              .then(
                click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_LABEL)
              )
              .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD))
              .then(
                type(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD, code)
              )
              .then(
                click(
                  selectors.SETTINGS_V2.SECONDARY_EMAIL
                    .VERIFY_FORM_SUBMIT_BUTTON
                )
              );
          })
          .then(testSuccessWasShown())
      );
    },
    */
  },
});

registerSuite('settings change email - unblock', {
  beforeEach: function () {
    email = createEmail();

    // Create a new primary email that is always forced through the unblock flow
    newPrimaryEmail = createEmail('blocked{id}');
    return (
      this.remote
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))

        // add secondary email, verify
        .then(click(selectors.EMAIL.INPUT_LABEL))
        .then(type(selectors.EMAIL.INPUT, newPrimaryEmail))
        .then(click(selectors.EMAIL.ADD_BUTTON))
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.BACK_BUTTON))
        .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))

        // this may not work from the front page, so go back.
        // Awkwardly, to get back to the secondary email code input, we need to click
        // the 'resend email' link.
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.RESEND_EMAIL))
        // TODO: this might be worth moving into lib/helpers. idk.
        .then(getEmailCode(newPrimaryEmail, 0))
        .then((code) => {
          return this.remote
            .then(
              click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_LABEL)
            )
            .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD))
            .then(
              type(selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FIELD, code)
            )
            .then(
              click(
                selectors.SETTINGS_V2.SECONDARY_EMAIL.VERIFY_FORM_SUBMIT_BUTTON
              )
            );
        })
        .then(testSuccessWasShown())

        // set new primary email
        .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY))
        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, newPrimaryEmail)
        )
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))

        // sign out
        .then(
          click(
            selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.MENU_BUTTON,
            selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON
          )
        )
        .then(
          click(
            selectors.SETTINGS_V2.AVATAR_DROP_DOWN_MENU.SIGNOUT_BUTTON,
            selectors.ENTER_EMAIL.HEADER
          )
        )
        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
    );
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can change primary email, get blocked with invalid password, redirect enter password page': function () {
      return (
        this.remote
          // sign in
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(newPrimaryEmail, 'INVALID_PASSWORD'))

          // fill out unblock
          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_UNBLOCK.VERIFICATION,
              newPrimaryEmail
            )
          )
          .then(fillOutSignInUnblock(newPrimaryEmail, 3))

          // redirected to correct password
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
      );
    },

    'can change primary email, get blocked with valid password, redirect settings page': function () {
      return (
        this.remote
          // sign in
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(newPrimaryEmail, PASSWORD))

          // fill out unblock
          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_UNBLOCK.VERIFICATION,
              newPrimaryEmail
            )
          )
          .then(fillOutSignInUnblock(newPrimaryEmail, 3))

          // redirected to settings
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

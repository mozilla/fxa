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
  addAndVerifySecondaryEmail,
  clearBrowserState,
  click,
  createEmail,
  fillOutDeleteAccount,
  fillOutChangePassword,
  fillOutEmailFirstSignUp,
  fillOutEmailFirstSignIn,
  fillOutSignInUnblock,
  fillOutSignUpCode,
  openPage,
  signOut,
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

        .then(addAndVerifySecondaryEmail(secondaryEmail))
        .then(testSuccessWasShown())

        // set new primary email
        .then(
          click(
            selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY,
            selectors.EMAIL.SUCCESS
          )
        )
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))

        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, secondaryEmail)
        )
    );
  },

  tests: {
    'can change primary email and login': function () {
      return (
        this.remote
          .then(signOut())

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
          .then(signOut())
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
          .then(signOut())
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
          .then(
            testElementTextEquals(
              selectors.SETTINGS_V2.SECONDARY_EMAIL.HEADER_VALUE,
              email
            )
          )
          .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))
          .then(visibleByQSA(selectors.EMAIL.SUCCESS))

          // sign out and login with new password
          .then(signOut())
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

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
          .then(fillOutEmailFirstSignUp(secondaryEmail, NEW_PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(secondaryEmail, 3))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // Verify that user can add the same primary email as secondary as used in the previous account
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(addAndVerifySecondaryEmail(email, 3))
          .then(testSuccessWasShown())
      );
    },
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

        .then(addAndVerifySecondaryEmail(newPrimaryEmail))
        .then(testSuccessWasShown())

        // set new primary email
        .then(
          click(
            selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY,
            selectors.EMAIL.SUCCESS
          )
        )
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))

        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, newPrimaryEmail)
        )

        // sign out
        .then(signOut())
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

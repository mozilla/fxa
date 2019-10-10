/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_URL = config.fxaContentRoot + 'signup';
const SIGNIN_URL = config.fxaContentRoot + 'signin';
const SETTINGS_URL = config.fxaContentRoot + 'settings';
const PASSWORD = 'passwordzxcv';
const NEW_PASSWORD = 'passwordzxcv1';

let email;
let secondaryEmail;
let newPrimaryEmail;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  fillOutChangePassword,
  fillOutResetPassword,
  fillOutCompleteResetPassword,
  fillOutEmailFirstSignUp,
  fillOutEmailFirstSignIn,
  fillOutSignInUnblock,
  openPage,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testErrorTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('settings change email', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    secondaryEmail = TestHelpers.createEmail();
    return (
      this.remote
        .then(clearBrowserState())
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))

        // add secondary email, verify
        .then(type(selectors.EMAIL.INPUT, secondaryEmail))
        .then(click(selectors.EMAIL.ADD_BUTTON))
        .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
        .then(openVerificationLinkInSameTab(secondaryEmail, 0, {}))
        .then(testSuccessWasShown())

        // set new primary email
        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))
        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, secondaryEmail)
        )
        .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
        .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))
    );
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'can change primary email and login': function() {
      return (
        this.remote
          // sign out
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))

          // sign in with old primary email fails
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testErrorTextInclude('Primary account email required'))

          // sign in with new primary email
          .then(testElementExists(selectors.SIGNIN.HEADER))
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

    'can change primary email, change password and login': function() {
      return (
        this.remote
          // change password
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(fillOutChangePassword(PASSWORD, NEW_PASSWORD))

          // sign out and fails login with old password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))
          .then(visibleByQSA(selectors.SIGNIN.TOOLTIP))

          // sign in with new password
          .then(fillOutEmailFirstSignIn(secondaryEmail, NEW_PASSWORD))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )
      );
    },

    'can change primary email, reset password and login': function() {
      return (
        this.remote
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))

          // reset password
          .then(fillOutResetPassword(secondaryEmail))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
          .then(openVerificationLinkInNewTab(secondaryEmail, 2))

          // complete the reset password in the new tab
          .then(switchToWindow(1))
          .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )

          // sign out and fails login with old password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))
          .then(visibleByQSA(selectors.SIGNIN.TOOLTIP))

          // sign in with new password succeeds
          .then(fillOutEmailFirstSignIn(secondaryEmail, NEW_PASSWORD))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )
          .then(closeCurrentWindow())
      );
    },

    'can change primary email, change password, login, change email and login': function() {
      return (
        this.remote
          // change password
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(fillOutChangePassword(PASSWORD, NEW_PASSWORD))

          // sign out and fails login with old password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, PASSWORD))
          .then(visibleByQSA(selectors.SIGNIN.TOOLTIP))

          // sign in with new password
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, NEW_PASSWORD))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )

          // set primary email to original email
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, email))
          .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
          .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))

          // sign out and login with new password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'can change primary email, reset password, login, change email and login': function() {
      return (
        this.remote
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))

          .then(click(selectors.CHANGE_PASSWORD.LINK_RESET_PASSWORD))

          .then(fillOutResetPassword(secondaryEmail))
          .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))

          // user browses to another site.
          .then(openVerificationLinkInNewTab(secondaryEmail, 2))

          .then(switchToWindow(1))

          .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(testSuccessWasShown())

          // switch to the original window
          .then(closeCurrentWindow())

          // sign in with new password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(secondaryEmail, NEW_PASSWORD))
          .then(
            testElementTextEquals(
              selectors.SETTINGS.PROFILE_HEADER,
              secondaryEmail
            )
          )

          // set primary email to original email
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, email))
          .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
          .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))

          // sign out and login with new password
          .then(click(selectors.SETTINGS.SIGNOUT))
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(email, NEW_PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

registerSuite('settings change email - unblock', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    // Create a new primary email that is always forced through the unblock flow
    newPrimaryEmail = TestHelpers.createEmail('block{id}');
    return (
      this.remote
        .then(clearBrowserState())
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))

        // add secondary email, verify
        .then(type(selectors.EMAIL.INPUT, newPrimaryEmail))
        .then(click(selectors.EMAIL.ADD_BUTTON))
        .then(testElementExists(selectors.EMAIL.NOT_VERIFIED_LABEL))
        .then(openVerificationLinkInSameTab(newPrimaryEmail, 0, {}))
        .then(testSuccessWasShown())

        // set new primary email
        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
        .then(click(selectors.EMAIL.MENU_BUTTON))
        .then(
          testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, newPrimaryEmail)
        )
        .then(testElementExists(selectors.EMAIL.VERIFIED_LABEL))
        .then(click(selectors.EMAIL.SET_PRIMARY_EMAIL_BUTTON))
        .then(visibleByQSA(selectors.EMAIL.SUCCESS))

        // sign out
        .then(click(selectors.SETTINGS.SIGNOUT))
        .then(testElementExists(selectors.SIGNIN.HEADER))
    );
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can change primary email, get blocked with invalid password, redirect login page': function() {
      return (
        this.remote
          // sign in
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(newPrimaryEmail, 'INVALID_PASSWORD'))

          // fill out unblock
          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_UNBLOCK.VERIFICATION,
              newPrimaryEmail
            )
          )
          .then(fillOutSignInUnblock(newPrimaryEmail, 2))

          // redirected to login
          .then(testElementExists(selectors.SIGNIN.HEADER))
      );
    },

    'can change primary email, get blocked with valid password, redirect settings page': function() {
      return (
        this.remote
          // sign in
          .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
          .then(fillOutEmailFirstSignIn(newPrimaryEmail, PASSWORD))

          // fill out unblock
          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_UNBLOCK.VERIFICATION,
              newPrimaryEmail
            )
          )
          .then(fillOutSignInUnblock(newPrimaryEmail, 2))

          // redirected to settings
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

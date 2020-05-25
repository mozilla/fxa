/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;

const ANIMATION_DELAY_MS = 500;
const FIRST_PASSWORD = 'password';
const SECOND_PASSWORD = 'new_password';

let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  denormalizeStoredEmail,
  fillOutChangePassword,
  fillOutEmailFirstSignIn,
  noSuchElementDisplayed,
  noSuchElement,
  openPage,
  pollUntilHiddenByQSA,
  testElementExists,
  testElementTextEquals,
  thenify,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const setupTest = thenify(function (options = {}) {
  const signUpEmail = options.signUpEmail || email;
  const signInEmail = options.signInEmail || email;

  return this.parent
    .then(createUser(signUpEmail, FIRST_PASSWORD, { preVerified: true }))
    .then(clearBrowserState())
    .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
    .then(fillOutEmailFirstSignIn(signInEmail, FIRST_PASSWORD))

    .then(testElementExists(selectors.SETTINGS.HEADER))
    .then(
      testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, signUpEmail)
    );
});

registerSuite('change_password', {
  beforeEach: function () {
    email = createEmail();
  },

  tests: {
    'try to change password with an incorrect old password': function () {
      return (
        this.remote
          .then(setupTest())

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(
            fillOutChangePassword('INCORRECT', SECOND_PASSWORD, {
              expectSuccess: false,
            })
          )
          // the validation tooltip should be visible
          .then(visibleByQSA(selectors.CHANGE_PASSWORD.TOOLTIP))

          // click the show button, the error should not be hidden.
          .then(click(selectors.CHANGE_PASSWORD.OLD_PASSWORD_SHOW))
          .then(visibleByQSA(selectors.CHANGE_PASSWORD.TOOLTIP))

          // Change form so that it is valid, error should be hidden.
          .then(type(selectors.CHANGE_PASSWORD.OLD_PASSWORD, FIRST_PASSWORD))

          // Since the test is to see if the error is hidden,
          // .findByClass cannot be used. We want the opposite of
          // .findByClass.
          .sleep(ANIMATION_DELAY_MS)

          .then(noSuchElementDisplayed(selectors.CHANGE_PASSWORD.ERROR))
      );
    },

    'try to change password with short password, tooltip shows, cancel, try to change password again, tooltip is not shown': function () {
      return (
        this.remote
          .then(setupTest())

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(
            fillOutChangePassword('A', SECOND_PASSWORD, {
              expectSuccess: false,
            })
          )
          // the validation tooltip should be visible
          .then(visibleByQSA(selectors.CHANGE_PASSWORD.TOOLTIP))
          // click the cancel button
          .then(click(selectors.CHANGE_PASSWORD.CANCEL_BUTTON))
          .sleep(ANIMATION_DELAY_MS)
          // try to change password again
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          // check no tooltip exists
          .then(noSuchElement(selectors.CHANGE_PASSWORD.TOOLTIP))
      );
    },

    'new_password validation, balloon': function () {
      return (
        this.remote
          .then(setupTest())

          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))

          // new_password empty
          .then(type(selectors.CHANGE_PASSWORD.OLD_PASSWORD, FIRST_PASSWORD))
          // submit the form using the "enter" key, the SUBMIT button
          // is obscured on teamcity and cannot be clicked.
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, '\n'))
          .then(
            testElementExists(
              selectors.CHANGE_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
            )
          )

          // new_password too short
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, 'pass'))
          .then(
            testElementExists(
              selectors.CHANGE_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
            )
          )

          // new_password too close to the email address
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, email))
          .then(
            testElementExists(
              selectors.CHANGE_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_FAIL
            )
          )

          // new_password too common
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, 'password'))
          .then(
            testElementExists(
              selectors.CHANGE_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_FAIL
            )
          )

          // all good
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, SECOND_PASSWORD))
          .then(type(selectors.CHANGE_PASSWORD.NEW_VPASSWORD, SECOND_PASSWORD))
          .then(click(selectors.CHANGE_PASSWORD.SUBMIT))
          .then(pollUntilHiddenByQSA(selectors.CHANGE_PASSWORD.DETAILS))
      );
    },

    'new_vpassword validation, tooltip shows': function () {
      return (
        this.remote
          .then(setupTest())

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(
            fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD, {
              expectSuccess: false,
              vpassword: '',
            })
          )
          // the validation tooltip should be visible
          .then(visibleByQSA(selectors.CHANGE_PASSWORD.TOOLTIP))
          .then(
            fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD, {
              expectSuccess: false,
              vpassword: 'different',
            })
          )
          // the validation tooltip should be visible
          .then(visibleByQSA(selectors.CHANGE_PASSWORD.TOOLTIP))
      );
    },

    'change password, sign in with new password': function () {
      return (
        this.remote
          .then(setupTest())

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))

          .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))

          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, SECOND_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'sign in with an unnormalized email, change password, sign in with new password': function () {
      return (
        this.remote
          .then(
            setupTest({ signInEmail: email.toUpperCase(), signUpEmail: email })
          )

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))

          .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))

          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, SECOND_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'cached unnormalized email, change password, sign in with new password': function () {
      return (
        this.remote
          .then(setupTest())

          // synthesize a user who signed in pre #4470 with an unnormalized email
          .then(denormalizeStoredEmail(email))
          // refresh to load denormalized email from localStorage
          .refresh()
          // email should be normalized on refresh!
          .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, email))

          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))

          .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))

          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, SECOND_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'reset password via settings works': function () {
      return (
        this.remote
          .then(setupTest())

          // Go to change password screen
          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))
          .then(click(selectors.CHANGE_PASSWORD.LINK_RESET_PASSWORD))

          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
      );
    },
  },
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('../lib/helpers');
const selectors = require('../lib/selectors');

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

registerSuite('change password', {
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

          // Change form so that it is valid, error should be hidden.
          .then(type(selectors.CHANGE_PASSWORD.OLD_PASSWORD, FIRST_PASSWORD))
          .then(noSuchElement(selectors.CHANGE_PASSWORD.TOOLTIP))
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

    'new_password validation': function () {
      return (
        this.remote
          .then(setupTest())

          .then(click(selectors.CHANGE_PASSWORD.MENU_BUTTON))

          // new_password empty
          .then(click(selectors.CHANGE_PASSWORD.OLD_PASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.OLD_PASSWORD, FIRST_PASSWORD))
          .then(
            testElementExists(selectors.SETTINGS.CHANGE_PASSWORD.UNSET_LENGTH)
          )

          // new_password too short
          .then(click(selectors.CHANGE_PASSWORD.NEW_PASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, 'pass'))
          .then(
            testElementExists(selectors.SETTINGS.CHANGE_PASSWORD.INVALID_LENGTH)
          )

          // new_password too close to the email address
          .then(click(selectors.CHANGE_PASSWORD.NEW_PASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, email))
          .then(
            testElementExists(
              selectors.SETTINGS.CHANGE_PASSWORD.INVALID_SIMILAR_TO_EMAIL
            )
          )

          // new_password too common
          .then(click(selectors.CHANGE_PASSWORD.NEW_PASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, 'password'))
          .then(
            testElementExists(
              selectors.SETTINGS.CHANGE_PASSWORD.INVALID_TOO_COMMON
            )
          )

          // all good
          .then(click(selectors.CHANGE_PASSWORD.NEW_PASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.NEW_PASSWORD, SECOND_PASSWORD))
          .then(click(selectors.CHANGE_PASSWORD.NEW_VPASSWORD_LABEL))
          .then(type(selectors.CHANGE_PASSWORD.NEW_VPASSWORD, SECOND_PASSWORD))
          .then(
            testElementExists(selectors.SETTINGS.CHANGE_PASSWORD.VALID_LENGTH)
          )
          .then(
            testElementExists(
              selectors.SETTINGS.CHANGE_PASSWORD.VALID_SIMILAR_TO_EMAIL
            )
          )
          .then(
            testElementExists(
              selectors.SETTINGS.CHANGE_PASSWORD.VALID_TOO_COMMON
            )
          )
          .then(
            testElementExists(
              selectors.SETTINGS.CHANGE_PASSWORD.VALID_PASSWORD_MATCH
            )
          )
          .then(click(selectors.CHANGE_PASSWORD.SUBMIT))
          .then(pollUntilHiddenByQSA(selectors.CHANGE_PASSWORD.DETAILS))
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

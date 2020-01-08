/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./../lib/helpers');
const selectors = require('./../lib/selectors');
const config = intern._config;

const ENTER_EMAIL_SYNC_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;
const ENTER_EMAIL_WEB_URL = config.fxaContentRoot;
const ENTER_SECONDARY_EMAIL =
  config.fxaContentRoot + 'post_verify/secondary_email/add_secondary_email';

const PASSWORD = 'password1234567';
let email, secondaryEmail;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutPostVerifySecondaryEmailCode,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  openPage,
  testElementExists,
  testIsBrowserNotified,
  type,
} = FunctionalHelpers;

registerSuite('post_verify_secondary_email', {
  beforeEach: function() {
    email = createEmail();
    secondaryEmail = createEmail();

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'sync post verify - create secondary email': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_SYNC_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceExperiment: 'secondaryEmailAfterSignup',
                forceExperimentGroup: 'treatment',
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // verify the user
          .then(fillOutSignUpCode(email, 0))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(
            type(
              selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.EMAIL,
              secondaryEmail
            )
          )
          .then(click(selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.SUBMIT))

          .then(
            testElementExists(
              selectors.POST_VERIFY_CONFIRM_SECONDARY_EMAIL.HEADER
            )
          )
          .then(fillOutPostVerifySecondaryEmailCode(secondaryEmail, 0))

          .then(click(selectors.POST_VERIFY_VERIFIED.SUBMIT))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'ignore for sign-in': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(ENTER_EMAIL_SYNC_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              forceExperiment: 'secondaryEmailAfterSignup',
              forceExperimentGroup: 'treatment',
            },
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    'navigate directly to create secondary email': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_WEB_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(
            ENTER_SECONDARY_EMAIL,
            selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.HEADER
          )
        )

        .then(
          type(selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.EMAIL, secondaryEmail)
        )
        .then(click(selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.SUBMIT))

        .then(
          testElementExists(
            selectors.POST_VERIFY_CONFIRM_SECONDARY_EMAIL.HEADER
          )
        )
        .then(fillOutPostVerifySecondaryEmailCode(secondaryEmail, 0))

        .then(testElementExists(selectors.POST_VERIFY_VERIFIED.READY))
        .then(click(selectors.POST_VERIFY_VERIFIED.SUBMIT))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },
  },
});

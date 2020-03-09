/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./../lib/helpers');
const selectors = require('./../lib/selectors');
const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
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
  openPage,
  testElementExists,
  type,
} = FunctionalHelpers;

registerSuite('post_verify_secondary_email', {
  beforeEach: function() {
    email = createEmail();
    secondaryEmail = createEmail();

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'create secondary email': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(
            openPage(
              ENTER_SECONDARY_EMAIL,
              selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.HEADER
            )
          )

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

          // Click `use different email` and verify you can
          .then(
            click(
              selectors.POST_VERIFY_CONFIRM_SECONDARY_EMAIL.USE_DIFFERENT_EMAIL
            )
          )
          .then(
            testElementExists(selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.HEADER)
          )
          .then(
            type(
              selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.EMAIL,
              secondaryEmail
            )
          )
          .then(click(selectors.POST_VERIFY_ADD_SECONDARY_EMAIL.SUBMIT))

          // Complete the email verification flow
          .then(fillOutPostVerifySecondaryEmailCode(secondaryEmail, 1))

          .then(testElementExists(selectors.POST_VERIFY_VERIFIED.READY))

          .then(click(selectors.POST_VERIFY_VERIFIED.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

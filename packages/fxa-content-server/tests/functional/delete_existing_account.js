/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'password1234567';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('deleteAccountTest', {
  beforeEach: function() {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },

  tests: {
    ' delete account test': function() {
      return (
        this.remote

          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
          .then(
            click(
              selectors.SETTINGS_DELETE_ACCOUNT.MENU_BUTTON,
              selectors.SETTINGS_DELETE_ACCOUNT.DETAILS
            )
          )
          .findAllByCssSelector(selectors.SETTINGS_DELETE_ACCOUNT.CHECKBOXES)
          .then(checkboxes => checkboxes.map(checkbox => checkbox.click()))
          .end()
          .then(
            type(selectors.SETTINGS_DELETE_ACCOUNT.INPUT_PASSWORD, PASSWORD)
          )

          //Click Cancel
          .then(click(selectors.SETTINGS_DELETE_ACCOUNT.CANCEL))
          .then(
            testElementTextInclude(selectors.SETTINGS.PROFILE_HEADER, email)
          )

          //Deleting account with incorrect password
          .then(
            click(
              selectors.SETTINGS_DELETE_ACCOUNT.MENU_BUTTON,
              selectors.SETTINGS_DELETE_ACCOUNT.DETAILS
            )
          )
          .findAllByCssSelector(selectors.SETTINGS_DELETE_ACCOUNT.CHECKBOXES)
          .then(checkboxes => checkboxes.map(checkbox => checkbox.click()))
          .end()
          .then(
            type(selectors.SETTINGS_DELETE_ACCOUNT.INPUT_PASSWORD, 'PASSWORD')
          )
          .then(click(selectors.SETTINGS_DELETE_ACCOUNT.SUBMIT))
          .then(
            visibleByQSA(
              selectors.SETTINGS_DELETE_ACCOUNT.TOOLTIP_INCORRECT_PASSWORD
            )
          )

          //Deleting account
          .then(
            type(selectors.SETTINGS_DELETE_ACCOUNT.INPUT_PASSWORD, PASSWORD)
          )
          .then(click(selectors.SETTINGS_DELETE_ACCOUNT.SUBMIT))
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(testSuccessWasShown())
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(click(selectors.ENTER_EMAIL.SUBMIT))
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.HEADER))
      );
    },
  },
});

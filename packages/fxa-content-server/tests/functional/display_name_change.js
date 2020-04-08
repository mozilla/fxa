/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'passwordcxzv';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('displayName', {
  beforeEach: function() {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },

  tests: {
    ' change the display name': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          // success is seeing the error message.
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
          .then(
            click(
              selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON,
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME
            )
          )
          .then(
            type(
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME,
              'Test User'
            )
          )
          .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
          .then(
            testElementTextInclude(
              selectors.SETTINGS.PROFILE_HEADER,
              'Test User'
            )
          )

          //To change the Display name
          .then(
            click(
              selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON,
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME
            )
          )
          .then(
            type(
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME,
              'Test User CHANGE'
            )
          )
          .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
          .then(
            testElementTextInclude(
              selectors.SETTINGS.PROFILE_HEADER,
              'Test User CHANGE'
            )
          )
      );
    },
  },
});

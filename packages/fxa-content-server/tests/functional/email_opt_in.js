/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const PAGE_URL = intern._config.fxaContentRoot + '?action=email';

let email;
const PASSWORD = '12345678';

const {
  clearBrowserState,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testAttribute,
  testAttributeEquals,
} = FunctionalHelpers;

// okay, not remote so run these for real.
registerSuite('communication preferences', {
  beforeEach: function() {
    // The plus sign is to ensure the email address is URI-encoded when
    // passed to basket. See a43061d3
    email = createEmail('signup{id}+extra');
    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState());
  },

  tests: {
    'manage link': function() {
      return (
        this.remote
          .then(openPage(PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // The manage link is not clicked because basket is not
          // hooked up to latest, and the teamcity test runner
          // gets redirected to a random allizom.org page.
          // Check the link is formed as we expect it to be.
          .then(
            testAttribute(
              selectors.SETTINGS_COMMUNICATION.BUTTON_MANAGE,
              'href',
              'include',
              `email=${encodeURIComponent(email)}`
            )
          )
          .then(
            testAttributeEquals(
              selectors.SETTINGS_COMMUNICATION.BUTTON_MANAGE,
              'target',
              '_blank'
            )
          )
      );
    },
  },
});

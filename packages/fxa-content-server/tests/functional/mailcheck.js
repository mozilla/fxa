/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const ENTER_EMAIL_URL =
  intern._config.fxaContentRoot + '?automatedBrowser=true&action=email';

const {
  clearBrowserState,
  click,
  openPage,
  testElementValueEquals,
  type,
} = FunctionalHelpers;

registerSuite('mailcheck', {
  beforeEach() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'tooltip works': function() {
      var BAD_EMAIL = 'something@gnail.com';
      var CORRECTED_EMAIL = 'something@gmail.com';

      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, BAD_EMAIL))
        .then(
          click(
            selectors.ENTER_EMAIL.SUBMIT,
            selectors.ENTER_EMAIL.SUGGEST_EMAIL_DOMAIN_CORRECTION
          )
        )
        .then(click(selectors.ENTER_EMAIL.LINK_SUGGEST_EMAIL_DOMAIN_CORRECTION))

        .then(
          testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, CORRECTED_EMAIL)
        );
    },

    'submitting a 2nd time w/o change is allowed': function() {
      var BAD_EMAIL = 'something@gnail.com';

      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, BAD_EMAIL))
        .then(
          click(
            selectors.ENTER_EMAIL.SUBMIT,
            selectors.ENTER_EMAIL.SUGGEST_EMAIL_DOMAIN_CORRECTION
          )
        )
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        );
    },
  },
});

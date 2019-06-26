/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
var EXP_MAILCHECK_URL =
  intern._config.fxaContentRoot + 'signup?automatedBrowser=true';

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var click = FunctionalHelpers.click;
var openPage = FunctionalHelpers.openPage;
var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
var type = FunctionalHelpers.type;

registerSuite('mailcheck', {
  beforeEach() {
    return this.remote.then(clearBrowserState());
  },

  afterEach() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'tooltip works': function() {
      var BAD_EMAIL = 'something@gnail.com';
      var CORRECTED_EMAIL = 'something@gmail.com';

      return this.remote
        .then(openPage(EXP_MAILCHECK_URL, selectors.SIGNUP.HEADER))
        .then(type(selectors.SIGNUP.EMAIL, BAD_EMAIL))
        .then(
          click(
            selectors.SIGNUP.PASSWORD,
            selectors.SIGNUP.SUGGEST_EMAIL_DOMAIN_CORRECTION
          )
        )
        .then(click(selectors.SIGNUP.LINK_SUGGEST_EMAIL_DOMAIN_CORRECTION))

        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, CORRECTED_EMAIL));
    },
  },
});

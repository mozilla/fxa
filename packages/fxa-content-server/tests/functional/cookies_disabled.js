/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
// there is no way to disable cookies using wd. Add `disable_cookies`
// to the URL to synthesize cookies being disabled.
var config = intern._config;
var SIGNUP_COOKIES_DISABLED_URL =
  config.fxaContentRoot + 'signup?disable_local_storage=1';
var SIGNUP_COOKIES_ENABLED_URL = config.fxaContentRoot + 'signup';

// Use fake, but real looking uid & code
var VERIFY_COOKIES_DISABLED_URL =
  config.fxaContentRoot +
  'verify_email?disable_local_storage=1&uid=240103bbecd645848103021e7d245bcb&code=fc46f44802b2a2ce979f39b2187aa1c0';

var COOKIES_DISABLED_URL = config.fxaContentRoot + 'cookies_disabled';

var openPage = FunctionalHelpers.openPage;
var testErrorWasShown = FunctionalHelpers.testErrorWasShown;

registerSuite('cookies_disabled', {
  'visit signup page with localStorage disabled': function() {
    return (
      this.remote
        .then(
          openPage(SIGNUP_COOKIES_DISABLED_URL, '#fxa-cookies-disabled-header')
        )
        // try again, cookies are still disabled.
        .findById('submit-btn')
        .click()
        .end()

        // show an error message after second try
        .then(testErrorWasShown())
    );
  },

  'synthesize enabling cookies by visiting the sign up page, then cookies_disabled, then clicking "try again"': function() {
    // wd has no way of disabling/enabling cookies, so we have to
    // manually seed history.
    return (
      this.remote
        .then(openPage(SIGNUP_COOKIES_ENABLED_URL, '#fxa-signup-header'))

        .then(openPage(COOKIES_DISABLED_URL, '#fxa-cookies-disabled-header'))

        // try again, cookies are enabled.
        .findById('submit-btn')
        .click()
        .end()

        // Should be redirected back to the signup page.
        .findById('fxa-signup-header')
        .end()
    );
  },

  'visit verify page with localStorage disabled': function() {
    return this.remote.then(
      openPage(VERIFY_COOKIES_DISABLED_URL, '#fxa-cookies-disabled-header')
    );
  },
});

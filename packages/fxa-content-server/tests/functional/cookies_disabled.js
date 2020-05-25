/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const {
  clearBrowserState,
  click,
  openPage,
  testElementExists,
  testErrorWasShown,
} = require('./lib/helpers');
const selectors = require('./lib/selectors');

// there is no way to disable cookies using wd. Add `disable_cookies`
// to the URL to synthesize cookies being disabled.
var config = intern._config;
var ENTER_EMAIL_COOKIES_DISABLED_URL =
  config.fxaContentRoot + '?disable_local_storage=1';
var ENTER_EMAIL_COOKIES_ENABLED_URL = config.fxaContentRoot;

// Use fake, but real looking uid & code
const VERIFY_COOKIES_DISABLED_URL =
  config.fxaContentRoot +
  'verify_email?disable_local_storage=1&uid=240103bbecd645848103021e7d245bcb&code=fc46f44802b2a2ce979f39b2187aa1c0';

const COOKIES_DISABLED_URL = config.fxaContentRoot + 'cookies_disabled';

registerSuite('cookies_disabled', {
  beforeEach() {
    return this.remote.then(clearBrowserState());
  },

  'visit signup page with localStorage disabled': function () {
    return (
      this.remote
        .then(
          openPage(
            ENTER_EMAIL_COOKIES_DISABLED_URL,
            selectors.COOKIES_DISABLED.HEADER
          )
        )
        // try again, cookies are still disabled.
        .then(click(selectors.COOKIES_DISABLED.RETRY))

        // show an error message after second try
        .then(testErrorWasShown())
    );
  },

  'synthesize enabling cookies by visiting the enter email page, then cookies_disabled, then clicking "try again"': function () {
    // wd has no way of disabling/enabling cookies, so we have to
    // manually seed history.
    return (
      this.remote
        .then(
          openPage(
            ENTER_EMAIL_COOKIES_ENABLED_URL,
            selectors.ENTER_EMAIL.HEADER
          )
        )

        .then(openPage(COOKIES_DISABLED_URL, selectors.COOKIES_DISABLED.HEADER))

        // try again, cookies are enabled.
        .then(click(selectors.COOKIES_DISABLED.RETRY))

        // Should be redirected back to the signup page.
        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
    );
  },

  'visit verify page with localStorage disabled': function () {
    return this.remote.then(
      openPage(VERIFY_COOKIES_DISABLED_URL, selectors.COOKIES_DISABLED.HEADER)
    );
  },
});

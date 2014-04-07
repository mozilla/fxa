/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  // there is no way to disable cookies using wd. Add `disable_cookies`
  // to the URL to synthesize cookies being disabled.
  var SIGNUP_COOKIES_DISABLED_URL = 'http://localhost:3030/signup?disable_cookies=1';
  var SIGNUP_COOKIES_ENABLED_URL = 'http://localhost:3030/signup';
  var COOKIES_DISABLED_URL = 'http://localhost:3030/cookies_disabled';

  registerSuite({
    name: 'cookies_disabled',

    'visit signup page with cookies disabled': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNUP_COOKIES_DISABLED_URL))

        .waitForElementById('fxa-cookies-disabled-header')
        .end()

        // try again, cookies are still disabled.
        .elementById('submit-btn')
          .click()
        .end()

        // show an error message after second try
        .waitForVisibleByCssSelector('#stage .error')
        .elementByCssSelector('#stage .error').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'synthesize enabling cookies by visiting the sign up page, then cookies_disabled, then clicking "try again"': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNUP_COOKIES_ENABLED_URL))
        // wd has no way of disabling/enabling cookies, so we have to
        // manually seed history.
        .waitForElementById('fxa-signup-header')
        .end()

        .get(require.toUrl(COOKIES_DISABLED_URL))

        .waitForElementById('fxa-cookies-disabled-header')
        .end()

        // try again, cookies are enabled.
        .elementById('submit-btn')
          .click()
        .end()

        // Should be redirected back to the signup page.
        .waitForElementById('fxa-signup-header');
    }
  });
});

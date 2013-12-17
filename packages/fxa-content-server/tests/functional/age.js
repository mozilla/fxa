/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var FIND_ELEMENT_TIMEOUT = 5000;

  var url = 'http://localhost:3030/age';
  var VERIFICATION_AGE = 13;
  var VERIFICATION_YEAR = new Date().getFullYear() - VERIFICATION_AGE;

  registerSuite({
    name: 'age',

    setup: function () {
    },

    'select the 1990s': function () {

      return this.get('remote')
        .setImplicitWaitTimeout(FIND_ELEMENT_TIMEOUT)
        .get(require.toUrl(url))
        .waitForElementById('fxa-age-header')

        .elementById('fxa-age-year')
          .click()
        .end()

        .elementById('fxa-1990')
          // buttonDown & buttonUp are required for Firefox to select the
          // item. This causes safari to blow its lid.
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementById('fxa-age-submit')
          .click()
        .end()

        // Success is being redirected to the create account screen.
        .waitForElementById('fxa-create-account-header')
        .end();
    },

    'select the age that requires further verification': function () {

      return this.get('remote')
        .setImplicitWaitTimeout(FIND_ELEMENT_TIMEOUT)
        .get(require.toUrl(url))
        .waitForElementById('fxa-age-header')

        .elementById('fxa-age-year')
          .click()
        .end()

        .elementById('fxa-' + VERIFICATION_YEAR)
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementById('fxa-age-submit')
          .click()
        .end()

        // Success is being redirected to the birthday screen.
        .waitForElementById('fxa-birthday-header')
        .end();
    },

    'select an age that is too young': function () {
      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-age-header')

        .elementById('fxa-age-year')
          .click()
        .end()

        .elementById('fxa-' + (VERIFICATION_YEAR + 1))
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementById('fxa-age-submit')
          .click()
        .end()

        // Success is being redirected to the cannot create screen.
        .waitForElementById('fxa-cannot-create-account-header')
        .end();
    }
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/birthday';

  var ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
  var NOW = new Date();
  var YESTERDAY = new Date();
  YESTERDAY.setTime(NOW.getTime() - ONE_DAY_IN_MS);

  var TOMORROW = new Date();
  TOMORROW.setTime(NOW.getTime() + ONE_DAY_IN_MS);

  var MONTHS = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  registerSuite({
    name: 'sign_up',

    'pick a day that is before today - user can register': function () {
      var month = MONTHS[YESTERDAY.getMonth()];
      var day = YESTERDAY.getDate();

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-birthday-header')

        .elementById('fxa-month-' + month)
          .click()
        .end()

        .elementById('fxa-day-' + day)
          .click()
        .end()

        .elementById('fxa-birthday-submit')
          .click()
        .end()

        // Success is being redirected to the create account screen.
        .waitForElementById('fxa-create-account-header')
        .end();
    },

    'pick today - user can register': function () {
      var month = MONTHS[NOW.getMonth()];
      var day = NOW.getDate();

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-birthday-header')

        .elementById('fxa-month-' + month)
          .click()
        .end()

        .elementById('fxa-day-' + day)
          .click()
        .end()

        .elementById('fxa-birthday-submit')
          .click()
        .end()

        // Success is being redirected to the create account screen.
        .waitForElementById('fxa-create-account-header')
        .end();
    },

    'pick a day that is after today - user is too young': function () {
      var month = MONTHS[TOMORROW.getMonth()];
      var day = TOMORROW.getDate();

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-birthday-header')

        .elementById('fxa-month-' + month)
          .click()
        .end()

        .elementById('fxa-day-' + day)
          .click()
        .end()

        .elementById('fxa-birthday-submit')
          .click()
        .end()

        // Success is being redirected to the cannot create account screen.
        .waitForElementById('fxa-cannot-create-account-header')
        .end();
    }
  });
});

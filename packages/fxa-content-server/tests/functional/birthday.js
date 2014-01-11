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
  var MONTHS = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  registerSuite({
    name: 'birthday',

    'pick a day that is before today - user can register': function () {
      var month;
      var day;

      var remote = this.get('remote')
        .eval("{ day: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getDate(), month: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getMonth() }")
        .then(function (result) {
          day = result.day;
          month = MONTHS[result.month];

          remote.get(require.toUrl(url + '#yesterday'))
            .waitForElementById('fxa-birthday-header')
            .elementById('fxa-month-' + month)
            .click()
            .end()

            .elementById('fxa-day-' + day)
            .click()
            .wait(1000)
            .end()

            .elementById('fxa-birthday-submit')
            .submit()
            .end()

            // Success is being redirected to the create account screen.
            .waitForElementById('fxa-create-account-header')
            .end();
        })
        .end();

      return remote;
    },

    'pick today - user can register': function () {
      var month;
      var day;

      var remote = this.get('remote')
        // Get client current date, we cannot use the date of the test runner.
        .eval("{ day: new Date().getDate(), month: new Date().getMonth() }")
        .then(function (result) {
          day = result.day;
          month = MONTHS[result.month];

          remote.get(require.toUrl(url + '#today'))
            .waitForElementById('fxa-birthday-header')

            .elementById('fxa-month-' + month)
            .click()
            .end()

            .elementById('fxa-day-' + day)
            .click()
            .wait(1000)
            .end()

            .elementById('fxa-birthday-submit')
            .submit()
            .end()

            // Success is being redirected to the create account screen.
            .waitForElementById('fxa-create-account-header')
            .end();
        })
        .end();


      return remote;
    },

    'pick a day that is after today - user is too young': function () {
      var month;
      var day;

      var remote = this.get('remote')
        .eval("{ day: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getDate(), month: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getMonth() }")
        .then(function (result) {
          day = result.day;
          month = MONTHS[result.month];

          remote.get(require.toUrl(url + '#tomorrow'))
            .waitForElementById('fxa-birthday-header')
            .elementById('fxa-month-' + month)
            .click()
            .end()

            .elementById('fxa-day-' + day)
            .click()
            .wait(1000)
            .end()

            .elementById('fxa-birthday-submit')
            .submit()
            .end()

            // Success is being redirected to the cannot create account screen.
            .waitForElementById('fxa-cannot-create-account-header')
            .end();
        })
        .end();


      return remote;
    }
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;

const {
  clearBrowserState,
  click,
  createEmail,
  mousedown,
  noSuchAttribute,
  openPage,
  testAttributeEquals,
  testElementExists,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('password visibility', {
  beforeEach: function () {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'show password ended with second mousedown': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, createEmail()))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, 'p'))
          .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))

          // turn password field into a text field
          .then(mousedown(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))

          .then(
            testAttributeEquals(
              selectors.SIGNUP_PASSWORD.PASSWORD,
              'type',
              'text'
            )
          )
          .then(
            testAttributeEquals(
              selectors.SIGNUP_PASSWORD.PASSWORD,
              'autocomplete',
              'off'
            )
          )

          // turn text field back into a password field
          .then(mousedown(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))

          .then(
            testAttributeEquals(
              selectors.SIGNUP_PASSWORD.PASSWORD,
              'type',
              'password'
            )
          )
          .then(
            noSuchAttribute(selectors.SIGNUP_PASSWORD.PASSWORD, 'autocomplete')
          )

          // \u0008 is unicode for backspace char. By default `type` clears the
          // element value before typing, we want the character to do so.
          .then(
            type(selectors.SIGNUP_PASSWORD.PASSWORD, '\u0008', {
              clearValue: true,
            })
          )
          // give a short pause to clear the input
          .sleep(1000)
          // element still exists
          .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))
      );
    },
  },
});

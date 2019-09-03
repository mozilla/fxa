/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const PAGE_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&action=email`; //eslint-disable-line max-len

let email;

const {
  clearBrowserState,
  click,
  openPage,
  testElementExists,
  type,
} = FunctionalHelpers;

registerSuite('password strength balloon', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(
        openPage(PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': { ok: true },
          },
        })
      )
      .then(type(selectors.ENTER_EMAIL.EMAIL, email))
      .then(
        click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
      );
  },

  tests: {
    'submit w/o a password': function() {
      return this.remote
        .then(click(selectors.SIGNUP_PASSWORD.SUBMIT))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_UNMET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_UNMET
          )
        );
    },

    'too short of a password': function() {
      return this.remote
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, 'p'))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_UNMET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_UNMET
          )
        );
    },

    'password is too common': function() {
      return this.remote
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, 'password'))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_FAIL
          )
        );
    },

    'password is the same as the full email': function() {
      return this.remote
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, email))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_FAIL
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_UNMET
          )
        );
    },

    'password is same as the local part of the email': function() {
      return this.remote
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, email.split('@')[0]))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_FAIL
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_UNMET
          )
        );
    },

    'good password, then back to too short': function() {
      return this.remote
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, 'password123123'))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_MET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_MET
          )
        )

        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, 'pass'))
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_UNMET
          )
        )
        .then(
          testElementExists(
            selectors.SIGNUP_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_UNMET
          )
        );
    },
  },
});

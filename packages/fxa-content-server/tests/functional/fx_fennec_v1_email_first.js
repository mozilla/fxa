/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const QUERY_PARAMS = '?context=fx_fennec_v1&service=sync&action=email';
const INDEX_PAGE_URL = `${config.fxaContentRoot}${QUERY_PARAMS}`;
const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signup${QUERY_PARAMS}`;
const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin${QUERY_PARAMS}`;

let email;
const PASSWORD = 'PASSWORD123123';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementValueEquals,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('Firefox Fennec Sync v1 email first', {
  beforeEach() {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'open directly to /signup page, refresh on the /signup page': function() {
      return (
        this.remote
          // redirected immediately to the / page
          .then(
            openPage(SIGNUP_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          .refresh()

          // refresh sends the user back to the first step
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
      );
    },

    'open directly to /signin page, refresh on the /signin page': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          // redirected immediately to the / page
          .then(
            openPage(SIGNIN_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .refresh()

          // refresh sends the user back to the first step
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
      );
    },

    signup: function() {
      return (
        this.remote
          .then(
            openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))

          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          // user thinks they mistyped their email
          .then(
            click(
              selectors.SIGNUP_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'signin verified  ': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              // Note, query not passed here or else email-first is not used.
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))

          // user thinks they mistyped their email
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(testElementExists(selectors.SIGNIN_PASSWORD.SHOW_PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.CONFIRM_SIGNIN.HEADER
            )
          )

          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },
  },
});

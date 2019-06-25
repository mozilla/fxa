/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const UA_STRINGS = require('./lib/ua-strings');

const config = intern._config;

const QUERY_PARAMS = '?context=fx_ios_v1&service=sync&action=email';
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
  type,
  visibleByQSA,
} = FunctionalHelpers;

const {
  listenForFxaCommands,
  testIsBrowserNotifiedOfMessage: testIsBrowserNotified,
  testIsBrowserNotifiedOfLogin,
} = require('./lib/fx-desktop');

registerSuite('FxiOS v1 email first', {
  beforeEach() {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'open directly to /signup page': function() {
      return (
        this.remote
          // redirected immediately to the / page
          .then(openPage(SIGNUP_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .execute(listenForFxaCommands)

          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )
      );
    },

    'open directly to /signin page': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          // redirected immediately to the / page
          .then(openPage(SIGNIN_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .execute(listenForFxaCommands)

          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
      );
    },

    signup: function() {
      const forceUA = UA_STRINGS['ios_firefox_11_0'];
      const query = { forceUA };
      return (
        this.remote
          .then(
            openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, { query })
          )
          .execute(listenForFxaCommands)

          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

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

          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )
          .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
      );
    },

    'signin verified  ': function() {
      const forceUA = UA_STRINGS['ios_firefox_11_0'];
      const query = { forceUA };

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, { query })
          )
          .execute(listenForFxaCommands)

          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(testIsBrowserNotified('can_link_account'))

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

          .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
      );
    },
  },
});

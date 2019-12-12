/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const QUERY_PARAMS = '?context=fx_desktop_v3&service=sync&action=email';
const INDEX_PAGE_URL = `${config.fxaContentRoot}${QUERY_PARAMS}`;
const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signup${QUERY_PARAMS}`;
const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin${QUERY_PARAMS}`;

let email;
const PASSWORD = 'PASSWORD123123';
const PASSWORD_WITH_TYPO = 'PASSWORD1234';

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutSignUpCode,
  fillOutSignInTokenCode,
  noSuchElement,
  openPage,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testElementValueEquals,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('Firefox Desktop Sync v3 email first', {
  beforeEach() {
    email = createEmail('sync{id}');

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

    'enter a firefox.com address': function() {
      return this.remote
        .then(
          openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
            },
          })
        )
        .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))

        .then(type(selectors.ENTER_EMAIL.EMAIL, 'testuser@firefox.com'))
        .then(click(selectors.ENTER_EMAIL.SUBMIT))
        .then(
          testElementTextInclude(
            selectors.ENTER_EMAIL.TOOLTIP,
            'firefox.com does not offer email'
          )
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
              selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT,
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

          // passwords do not match should cause an error
          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
          .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD_WITH_TYPO))
          .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_VPASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.SIGNUP_PASSWORD.ERROR_PASSWORDS_DO_NOT_MATCH
            )
          )
          .then(
            testElementTextEquals(
              selectors.SIGNUP_PASSWORD.TOOLTIP,
              'Passwords do not match'
            )
          )

          // fix the password mismatch
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(fillOutSignUpCode(email, 0))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'COPPA disabled': function() {
      return this.remote
        .then(
          openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              coppa: 'false',
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
            },
          })
        )
        .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))

        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        )
        .then(noSuchElement(selectors.SIGNUP_PASSWORD.AGE))
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNUP_PASSWORD.SUBMIT,
            selectors.CHOOSE_WHAT_TO_SYNC.HEADER
          )
        );
    },

    'merge cancelled': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: false },
            },
          })
        )

        .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT, selectors.ENTER_EMAIL.ERROR))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'));
    },

    'email specified by relier, invalid': function() {
      const invalidEmail = 'invalid@';

      return this.remote
        .then(
          openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              email: invalidEmail,
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
            },
          })
        )
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, invalidEmail))
        .then(testElementExists(selectors.ENTER_EMAIL.TOOLTIP))
        .then(
          testElementTextEquals(
            selectors.ENTER_EMAIL.TOOLTIP,
            'Valid email required'
          )
        );
    },

    'email specified by relier, empty string': function() {
      const emptyEmail = '';

      return this.remote
        .then(
          openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              email: emptyEmail,
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
            },
          })
        )
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, emptyEmail))
        .then(testElementExists(selectors.ENTER_EMAIL.TOOLTIP))
        .then(
          testElementTextEquals(
            selectors.ENTER_EMAIL.TOOLTIP,
            'Valid email required'
          )
        );
    },

    'email specified by relier, not registered': function() {
      return (
        this.remote
          .then(
            openPage(INDEX_PAGE_URL, selectors.SIGNUP_PASSWORD.HEADER, {
              query: {
                email,
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          // user realizes it's the wrong email address.
          .then(
            click(
              selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'email specified by relier, registered': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(INDEX_PAGE_URL, selectors.SIGNIN_PASSWORD.HEADER, {
              query: {
                email,
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          // user realizes it's the wrong email address.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'email specified by relier, cancel merge': function() {
      return this.remote
        .then(
          openPage(INDEX_PAGE_URL, selectors['400'].HEADER, {
            query: {
              email,
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: false },
            },
          })
        )
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'Login attempt cancelled'
          )
        );
    },

    'cached credentials': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(INDEX_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
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

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.SIGNIN_TOKEN_CODE.HEADER
            )
          )
          .then(fillOutSignInTokenCode(email, 0))

          // Use cached credentials form last time, but user must enter password
          .then(
            openPage(INDEX_PAGE_URL, selectors.SIGNIN_PASSWORD.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          // user wants to use a different email
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
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

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.SIGNIN_TOKEN_CODE.HEADER
            )
          )
      );
    },
  },
});

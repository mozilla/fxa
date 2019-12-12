/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = intern.getPlugin('chai');
const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const URL_PARAMS = 'context=fx_desktop_v3&action=email';
const EMAIL_FIRST_URL = `${config.fxaContentRoot}?${URL_PARAMS}`;
const FIREFOX_CLIENT_ID = '5882386c6d801776';
const CAPABILITIES = {
  multiService: true,
  pairing: false,
  engines: ['history'],
};

let email;
const PASSWORD = 'passwordvx2';

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  openPage,
  testElementExists,
  testIsBrowserNotified,
  type,
} = FunctionalHelpers;

registerSuite('Firefox Desktop non-sync', {
  beforeEach: function() {
    email = createEmail();
    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'signup with no service - do not sync': function() {
      return (
        this.remote
          .then(
            openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_71'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                  clientId: FIREFOX_CLIENT_ID,
                  capabilities: CAPABILITIES,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.DO_NOT_SYNC,
              selectors.CONFIRM_SIGNUP_CODE.HEADER
            )
          )
          // verify the account
          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
    'signup with no service - sync': function() {
      return (
        this.remote
          .then(
            openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_71'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                  clientId: FIREFOX_CLIENT_ID,
                  capabilities: CAPABILITIES,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // verify the account
          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
    'signin with no service - do not sync': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
            query: {
              forceUA: uaStrings['desktop_firefox_71'],
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                signedInUser: null,
                clientId: FIREFOX_CLIENT_ID,
                capabilities: CAPABILITIES,
              },
            },
          })
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNIN_PASSWORD.SUBMIT,
            selectors.WOULD_YOU_LIKE_SYNC.HEADER
          )
        )
        .then(
          click(
            selectors.WOULD_YOU_LIKE_SYNC.DO_NOT_SYNC,
            selectors.CONNECT_ANOTHER_DEVICE.HEADER
          )
        )
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
    'signin with no service - sync': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
            query: {
              forceUA: uaStrings['desktop_firefox_71'],
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                signedInUser: null,
                clientId: FIREFOX_CLIENT_ID,
                capabilities: CAPABILITIES,
              },
            },
          })
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNIN_PASSWORD.SUBMIT,
            selectors.WOULD_YOU_LIKE_SYNC.HEADER
          )
        )
        .then(
          click(
            selectors.WOULD_YOU_LIKE_SYNC.SUBMIT,
            selectors.CONNECT_ANOTHER_DEVICE.HEADER
          )
        )
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});

registerSuite('Firefox Desktop non-sync - CWTS on signup', {
  beforeEach: function() {
    email = createEmail('signupPasswordCWTS.treatment{id}');
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'signup with no service - do not sync': function() {
      return (
        this.remote
          .then(
            openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
              query: {
                forceExperiment: 'signupPasswordCWTS',
                forceExperimentGroup: 'treatment',
                forceUA: uaStrings['desktop_firefox_71'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                  clientId: FIREFOX_CLIENT_ID,
                  capabilities: CAPABILITIES,
                },
              },
            })
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(click(selectors.ENTER_EMAIL.SUBMIT))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))

          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
          // deselect all the sync engines
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_ADDONS))
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_BOOKMARKS))
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_HISTORY))
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_PASSWORDS))
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_PREFS))
          .then(click(selectors.SIGNUP_PASSWORD.ENGINE_TABS))
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CONFIRM_SIGNUP_CODE.HEADER
            )
          )

          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(
            testIsBrowserNotified('fxaccounts:login', event => {
              assert.deepEqual(event.data.services, {});
            })
          )
      );
    },
    'signup with no service - sync': function() {
      return this.remote
        .then(
          openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
            query: {
              forceExperiment: 'signupPasswordCWTS',
              forceExperimentGroup: 'treatment',
              forceUA: uaStrings['desktop_firefox_71'],
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                signedInUser: null,
                clientId: FIREFOX_CLIENT_ID,
                capabilities: CAPABILITIES,
              },
            },
          })
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
        .then(click(selectors.SIGNUP_PASSWORD.ENGINE_BOOKMARKS))
        .then(click(selectors.SIGNUP_PASSWORD.ENGINE_HISTORY))
        .then(
          click(
            selectors.SIGNUP_PASSWORD.SUBMIT,
            selectors.CONFIRM_SIGNUP_CODE.HEADER
          )
        )
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(
          testIsBrowserNotified('fxaccounts:login', event => {
            assert.deepEqual(event.data.services, {
              sync: {
                declinedEngines: ['bookmarks', 'history'],
                offeredEngines: [
                  'bookmarks',
                  'history',
                  'passwords',
                  'addons',
                  'tabs',
                  'prefs',
                ],
              },
            });
          })
        );
    },
  },
});

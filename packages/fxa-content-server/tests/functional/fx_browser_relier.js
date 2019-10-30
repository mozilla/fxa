/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const URL_PARAMS =
  'context=fx_desktop_v3&forceAboutAccounts=true&automatedBrowser=true&action=email';
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
  createUser,
  type,
  closeCurrentWindow,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testIsBrowserNotified,
} = FunctionalHelpers;

registerSuite('Firefox Desktop non-sync', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'signup with no service - do not sync': function() {
      return (
        this.remote
          .then(
            openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_57'],
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
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )
          // verify the account
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          // switch back to the original window, choose to "do not sync".
          .then(closeCurrentWindow())
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.DO_NOT_SYNC))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
    'signup with no service - sync': function() {
      return (
        this.remote
          .then(
            openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_57'],
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
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )
          // verify the account
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          // switch back to the original window, choose to "do not sync".
          .then(closeCurrentWindow())
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
    'signin with no service - do not sync': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
            query: {
              forceUA: uaStrings['desktop_firefox_57'],
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
        .then(click(selectors.WOULD_YOU_LIKE_SYNC.DO_NOT_SYNC))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
    'signin with no service - sync': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.SUB_HEADER, {
            query: {
              forceUA: uaStrings['desktop_firefox_57'],
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
        .then(click(selectors.WOULD_YOU_LIKE_SYNC.SUBMIT))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});

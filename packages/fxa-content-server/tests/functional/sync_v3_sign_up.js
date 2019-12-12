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
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;

let email;
const PASSWORD = 'password12345678';

const {
  clearBrowserState,
  click,
  createEmail,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  getWebChannelMessageData,
  storeWebChannelMessageData,
  noSuchElement,
  noSuchBrowserNotification,
  openPage,
  testElementExists,
  testIsBrowserNotified,
  type,
} = FunctionalHelpers;

registerSuite('Firefox Desktop Sync v3 signup', {
  beforeEach: function() {
    email = createEmail();
    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'verify at CWTS': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                  capabilities: {
                    multiService: true,
                  },
                },
              },
            })
          )
          .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
          .then(
            noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.DO_NOT_SYNC))

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(noSuchBrowserNotification('fxaccounts:login'))

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          .then(fillOutSignUpCode(email, 0))
          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'verify at /confirm_signup_code, force SMS': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                country: 'US',
                forceExperiment: 'sendSms',
                forceExperimentGroup: 'treatment',
                forceUA: uaStrings.desktop_firefox_58,
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(storeWebChannelMessageData('fxaccounts:login'))
          .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(noSuchBrowserNotification('fxaccounts:login'))

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))
          // verify the user
          .then(getWebChannelMessageData('fxaccounts:login'))
          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors.SMS_SEND.HEADER))
      );
    },

    'verify at /confirm_signup_code, SMS not supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(storeWebChannelMessageData('fxaccounts:login'))
          .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(noSuchBrowserNotification('fxaccounts:login'))

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))
          .then(fillOutSignUpCode(email, 0))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'engines not supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
          .then(
            noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )
      );
    },

    'neither `creditcards` nor `addresses` supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  capabilities: {
                    engines: [],
                  },
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
          .then(
            noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )
      );
    },

    '`creditcards` and `addresses` supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  capabilities: {
                    engines: ['creditcards', 'addresses'],
                  },
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(
            testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES)
          )
          .then(
            testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )
      );
    },
  },
});

registerSuite(
  'Firefox Desktop Sync v3 signup with code, CWTS on signup password',
  {
    beforeEach: function() {
      return this.remote.then(clearBrowserState());
    },

    tests: {
      treatment: function() {
        email = createEmail();
        return (
          this.remote
            .then(
              openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
                query: {
                  forceExperiment: 'signupPasswordCWTS',
                  forceExperimentGroup: 'treatment',
                  forceUA: uaStrings['desktop_firefox_71'],
                },
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
                selectors.SIGNUP_PASSWORD.HEADER
              )
            )

            .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
            .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
            .then(type(selectors.SIGNUP_PASSWORD.AGE, '24'))
            .then(
              testElementExists(
                selectors.SIGNUP_PASSWORD.CHOOSE_WHAT_TO_SYNC_HEADER
              )
            )
            // check all the expected fields are there, and only the expected fields
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_ADDONS))
            .then(noSuchElement(selectors.SIGNUP_PASSWORD.ENGINE_ADDRESSES))
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_BOOKMARKS))
            .then(noSuchElement(selectors.SIGNUP_PASSWORD.ENGINE_CREDIT_CARDS))
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_HISTORY))
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_PASSWORDS))
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_PREFS))
            .then(testElementExists(selectors.SIGNUP_PASSWORD.ENGINE_TABS))

            // uncheck the passwords and history engines
            .then(click(selectors.SIGNUP_PASSWORD.ENGINE_PASSWORDS))
            .then(click(selectors.SIGNUP_PASSWORD.ENGINE_HISTORY))
            .then(
              click(
                selectors.SIGNUP_PASSWORD.SUBMIT,
                selectors.CONFIRM_SIGNUP_CODE.HEADER
              )
            )

            .then(
              testIsBrowserNotified('fxaccounts:login', event => {
                assert.deepEqual(event.data.declinedSyncEngines, [
                  'history',
                  'passwords',
                ]);
                assert.deepEqual(event.data.offeredSyncEngines, [
                  'bookmarks',
                  'history',
                  'passwords',
                  'addons',
                  'tabs',
                  'prefs',
                ]);
              })
            )
            .then(fillOutSignUpCode(email, 0))

            // about:accounts does not take over, expect a screen transition.
            .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        );
      },
    },
  }
);

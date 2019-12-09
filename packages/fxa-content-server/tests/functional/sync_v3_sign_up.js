/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = intern.getPlugin('chai');
const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&automatedBrowser=true`;

let email;
const PASSWORD = 'password12345678';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  getVerificationLink,
  getWebChannelMessageData,
  storeWebChannelMessageData,
  noPageTransition,
  noSuchElement,
  noSuchBrowserNotification,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testEmailExpected,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('Firefox Desktop Sync v3 signup', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'Fx <= 57, verify at CWTS': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_57'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': { signedInUser: null },
              },
            })
          )
          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS))
          .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
          // switch back to the original window, it should transition to CAD.
          .then(closeCurrentWindow())
          // about:accounts takes over, so no screen transition
          .then(noPageTransition(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          // but the login message is sent automatically.
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'Fx >= 58, verify at CWTS': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                  capabilities: {
                    multiService: true,
                  },
                },
              },
            })
          )
          .then(visibleByQSA(selectors.ENTER_EMAIL.SUB_HEADER))

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
          .then(
            noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.DO_NOT_SYNC))

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS))
          .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
          // switch back to the original window, it should transition to CAD.
          .then(closeCurrentWindow())

          // In Fx >= 58, about:accounts does not take over.
          // Expect a screen transition.
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS))
          // but the login message is sent automatically.
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'Fx <= 55, verify at /confirm, same browser': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_55'],
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
          .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // user should be transitioned to /choose_what_to_sync
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
          .then(
            noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS)
          )

          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(noSuchBrowserNotification('fxaccounts:login'))

          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // user should be transitioned to the "go confirm your address" page
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))
          // verify the user
          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS))

          .then(closeCurrentWindow())

          // We do not expect the verification poll to occur. The poll
          // will take a few seconds to complete if it erroneously occurs.
          // Add an affordance just in case the poll happens unexpectedly.
          .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER))

          // A post-verification email should be sent, this is Sync.
          .then(testEmailExpected(email, 1))
      );
    },

    'Fx >= 55, verify at /confirm same browser, force SMS': function() {
      let accountInfo;
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_55'],
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
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // the login message is only sent after the sync preferences screen
          // has been cleared.
          .then(testIsBrowserNotified('fxaccounts:login'))
          // verify the user
          .then(getWebChannelMessageData('fxaccounts:login'))
          .then(function(message) {
            accountInfo = message.data;
          })
          .then(getVerificationLink(email, 0))
          .then(function(verificationLink) {
            return this.parent.then(
              openPage(verificationLink, selectors.SMS_SEND.HEADER, {
                query: {
                  automatedBrowser: true,
                  country: 'US',
                  forceExperiment: 'sendSms',
                  forceExperimentGroup: 'treatment',
                  forceUA: uaStrings.desktop_firefox_55,
                },
                webChannelResponses: {
                  'fxaccounts:can_link_account': {
                    ok: true,
                  },
                  'fxaccounts:fxa_status': {
                    signedInUser: {
                      email: accountInfo.email,
                      sessionToken: accountInfo.sessionToken,
                      uid: accountInfo.uid,
                      verified: accountInfo.verified,
                    },
                  },
                },
              })
            );
          })
      );
    },

    'Fx >= 56, engines not supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_56'],
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

    'Fx >= 56, neither `creditcards` nor `addresses` supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_56'],
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

    'Fx >= 56, `creditcards` and `addresses` supported': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_56'],
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

    "Fx <= 57, verify from original tab's P.O.V.": function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_57'],
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
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(openVerificationLinkInDifferentBrowser(email))

          // about:accounts takes over, no screen transition
          .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    "Fx >= 58, verify from original tab's P.O.V.": function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: uaStrings['desktop_firefox_58'],
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
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          .then(openVerificationLinkInDifferentBrowser(email))

          // about:accounts does not take over, expect a screen transition.
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },
  },
});

registerSuite('Firefox Desktop Sync v3 signup with code', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    control: function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceExperiment: 'signupCode',
                forceExperimentGroup: 'control',
                forceUA: uaStrings['desktop_firefox_58'],
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
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          .then(openVerificationLinkInDifferentBrowser(email))

          // about:accounts does not take over, expect a screen transition.
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    treatment: function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceExperiment: 'signupCode',
                forceExperimentGroup: 'treatment',
                forceUA: uaStrings['desktop_firefox_58'],
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
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          .then(fillOutSignUpCode(email, 0))

          // about:accounts does not take over, expect a screen transition.
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
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
        email = TestHelpers.createEmail();
        return (
          this.remote
            .then(
              openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
                query: {
                  forceExperiment: 'signupCode',
                  forceExperimentGroup: 'treatment',
                  forceUA: uaStrings['desktop_firefox_58'],
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

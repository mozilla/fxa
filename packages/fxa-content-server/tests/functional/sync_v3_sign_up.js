/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors, uaStrings) {
  'use strict';

  const config = intern.config;
  const SIGNUP_FX_55_PAGE_URL = `${config.fxaContentRoot}signup?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&` +
                                `forceUA=${uaStrings.desktop_firefox_55}&automatedBrowser=true`;
  const SIGNUP_FX_56_PAGE_URL = `${config.fxaContentRoot}signup?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&` +
                                `forceUA=${uaStrings.desktop_firefox_56}&automatedBrowser=true`;

  let email;
  const PASSWORD = '12345678';

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const noPageTransition = FunctionalHelpers.noPageTransition;
  const noSuchElement = FunctionalHelpers.noSuchElement;
  const noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testEmailExpected = FunctionalHelpers.testEmailExpected;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firefox Desktop Sync v3 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'Fx <= 55, verify same browser': function () {
      return this.remote
        .then(openPage(SIGNUP_FX_55_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': {
              ok: true
            },
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(noSuchElement(selectors.SIGNUP.LINK_SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))

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
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

        .then(closeCurrentWindow())

        // We do not expect the verification poll to occur. The poll
        // will take a few seconds to complete if it erroneously occurs.
        // Add an affordance just in case the poll happens unexpectedly.
        .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER, 5000))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'Fx >= 56, engines not supported': function () {
      return this.remote
        .then(openPage(SIGNUP_FX_56_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': {
              ok: true
            },
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignUp(email, PASSWORD))

        // user should be transitioned to /choose_what_to_sync
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
        .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS));
    },

    'Fx >= 56, `creditcards` not supported': function () {
      return this.remote
        .then(openPage(SIGNUP_FX_56_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': {
              ok: true
            },
            'fxaccounts:fxa_status': {
              capabilities: {
                engines: []
              },
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignUp(email, PASSWORD))

        // user should be transitioned to /choose_what_to_sync
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
        .then(noSuchElement(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS));
    },

    'Fx >= 56, `creditcards` supported': function () {
      return this.remote
        .then(openPage(SIGNUP_FX_56_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': {
              ok: true
            },
            'fxaccounts:fxa_status': {
              capabilities: {
                engines: ['creditcards', 'addresses']
              },
              signedInUser: null
            },
          }
        }))
        .then(fillOutSignUp(email, PASSWORD))

        // user should be transitioned to /choose_what_to_sync
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_ADDRESSES))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_CREDIT_CARDS));
    }
  });
});

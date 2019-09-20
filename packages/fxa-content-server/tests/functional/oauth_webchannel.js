/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = intern._config;
const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const SERVICE_NAME = '123done';
const PASSWORD = 'passwordzxcv';

let email;

const {
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignUp,
  openPage,
  openFxaFromRp,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testIsBrowserNotified,
  testUrlInclude,
} = FunctionalHelpers;

registerSuite('oauth webchannel', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote.then(
      FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true,
        force: true,
      })
    );
  },
  tests: {
    signup: function() {
      return (
        this.remote
          .then(
            openFxaFromRp('signup', {
              query: {
                context: 'oauth_webchannel_v1',
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: {
                    choose_what_to_sync: true,
                    engines: ['bookmarks', 'history'],
                  },
                  signedInUser: null,
                },
              },
            })
          )
          .then(testElementExists(selectors.SIGNUP.SUB_HEADER))
          .then(testUrlInclude('client_id='))
          .then(testUrlInclude('redirect_uri='))
          .then(testUrlInclude('state='))
          .then(testUrlInclude('context='))

          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(
            testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_BOOKMARKS)
          )
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
          // user sees the name of the RP, but cannot redirect
          .then(
            testElementTextInclude(
              selectors.SIGNUP_COMPLETE.SERVICE_NAME,
              SERVICE_NAME
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())
          .then(testIsBrowserNotified('fxaccounts:oauth_login'))
      );
    },
    signin: function() {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('signin', {
            query: {
              context: 'oauth_webchannel_v1',
            },
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                capabilities: {
                  engines: ['bookmarks', 'history'],
                },
                signedInUser: null,
              },
            },
          })
        )
        .then(testElementExists(selectors.SIGNIN.SUB_HEADER))
        .then(testUrlInclude('client_id='))
        .then(testUrlInclude('redirect_uri='))
        .then(testUrlInclude('state='))
        .then(testUrlInclude('context='))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testIsBrowserNotified('fxaccounts:oauth_login'));
    },
    settings: function() {
      const SETTINGS_PAGE_URL = `${config.fxaContentRoot}settings?automatedBrowser=true&context=oauth_webchannel_v1`;

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(result => {
          return this.remote.then(
            openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: {
                    engines: ['bookmarks', 'history'],
                  },
                  signedInUser: {
                    email,
                    uid: result.uid,
                    sessionToken: result.sessionToken,
                    verified: true,
                  },
                },
              },
            })
          );
        });
    },
  },
});

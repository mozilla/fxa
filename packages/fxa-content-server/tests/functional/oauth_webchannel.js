/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = intern._config;
const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const PASSWORD = 'passwordzxcv';

let email;

const {
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  openPage,
  openFxaFromRp,
  testElementExists,
  testIsBrowserNotified,
  testUrlInclude,
} = FunctionalHelpers;

registerSuite('oauth webchannel', {
  beforeEach: function() {
    email = createEmail();

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
            openFxaFromRp('enter-email', {
              query: {
                context: 'oauth_webchannel_v1',
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  capabilities: {
                    // eslint-disable-next-line camelcase
                    choose_what_to_sync: true,
                    engines: ['bookmarks', 'history'],
                  },
                  signedInUser: null,
                },
              },
            })
          )
          .then(testElementExists(selectors.ENTER_EMAIL.SUB_HEADER))
          .then(
            fillOutEmailFirstSignUp(email, PASSWORD, {
              disableAutoSubmit: true,
            })
          )
          // the CWTS form is on the same signup page
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(
            testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_BOOKMARKS)
          )
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
          .then(click(selectors.SIGNUP_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(email, 0))

          .then(testIsBrowserNotified('fxaccounts:oauth_login'))
      );
    },
    signin: function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('enter-email', {
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
        .then(testUrlInclude('client_id='))
        .then(testUrlInclude('redirect_uri='))
        .then(testUrlInclude('state='))
        .then(testUrlInclude('context='))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testIsBrowserNotified('fxaccounts:oauth_login'));
    },
    settings: function() {
      const SETTINGS_PAGE_URL = `${config.fxaContentRoot}settings?context=oauth_webchannel_v1`;

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

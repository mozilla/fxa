/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const SIGNIN_ROOT = config.fxaContentRoot + 'oauth/signin';
const selectors = require('./lib/selectors');

const PASSWORD = 'passwordzxcv';

let email;
let secret;

const thenify = FunctionalHelpers.thenify;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  confirmTotpCode,
  createUser,
  destroySessionForEmail,
  fillOutSignIn,
  fillOutSignInUnblock,
  fillOutSignUp,
  generateTotpCode,
  noSuchElement,
  openFxaFromRp,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  reOpenWithAdditionalQueryParams,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testSuccessWasShown,
  testUrlInclude,
  testUrlPathnameEquals,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const testAtOAuthApp = thenify(function() {
  return this.parent
    .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

    .getCurrentUrl()
    .then(function(url) {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

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
    'signup, verify same browser': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('signup', {
              query: {
                context: 'oauth_webchannel_v1',
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
          .then(testElementExists('#fxa-signup-header .service'))
          .then(testUrlInclude('client_id='))
          .then(testUrlInclude('redirect_uri='))
          .then(testUrlInclude('state='))
          .then(testUrlInclude('context='))

          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists('#fxa-confirm-header'))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists('#fxa-sign-up-complete-header'))
          // user sees the name of the RP, but cannot redirect
          .then(testElementTextInclude('.account-ready-service', '123done'))

          // switch to the original window
          .then(closeCurrentWindow())
          .then(testElementExists('#loggedin'))
      );
    },
  },
});

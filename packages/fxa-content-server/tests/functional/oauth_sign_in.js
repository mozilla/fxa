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
const otplib = require('otplib');
const selectors = require('./lib/selectors');

// Default options for TOTP
otplib.authenticator.options = {encoding: 'hex'};

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const SETTINGS_URL = `${config.fxaContentRoot}settings?showTwoStepAuthentication=true`;

const PASSWORD = 'password';
let authenticator, email, secret, code;

const thenify = FunctionalHelpers.thenify;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  confirmTotpCode,
  createUser,
  fillOutSignIn,
  fillOutSignInUnblock,
  fillOutSignUp,
  noSuchElement,
  openFxaFromRp,
  openPage,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  reOpenWithAdditionalQueryParams,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
  testUrlInclude,
  testUrlPathnameEquals,
  type,
  visibleByQSA
} = FunctionalHelpers;

const testAtOAuthApp = thenify(function () {
  return this.parent
    .then(testElementExists('#loggedin'))

    .getCurrentUrl()
    .then(function (url) {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

const generateCode = (secret) => {
  secret = secret.replace(/[- ]*/g, '');
  authenticator = new otplib.authenticator.Authenticator();
  authenticator.options = otplib.authenticator.options;
  code = authenticator.generate(secret);
  return code;
};

registerSuite('oauth signin', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote
      .then(FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true
      }));
  },
  tests: {
    'with missing client_id': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?scope=profile', '#fxa-400-header'));
    },

    'with missing scope': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?client_id=client_id', '#fxa-400-header'));
    },

    'with invalid client_id': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?client_id=invalid_client_id&scope=profile', '#fxa-400-header'));
    },

    'with service=sync specified': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(reOpenWithAdditionalQueryParams({
          service: 'sync'
        }, '#fxa-400-header'));
    },

    'verified': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, {preVerified: true}))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },

    'verified using a cached login': function () {
      // verify account
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, {preVerified: true}))

        // sign in with a verified account to cache credentials
        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp())
        .then(click('#logout'))

        .then(visibleByQSA('.ready #splash .signin'))
        // round 2 - with the cached credentials
        .then(click('.ready #splash .signin'))

        .then(testElementExists('#fxa-signin-header'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type="submit"]'))

        .then(testAtOAuthApp());
    },

    'unverified, acts like signup': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, {preVerified: false}))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // get the second email, the first was sent on client.signUp w/
        // preVerified: false above. The second email has the `service` and
        // `resume` parameters.
        .then(openVerificationLinkInSameTab(email, 1))
        // user verifies in the same tab, so they are logged in to the RP.
        .then(testElementExists('#loggedin'));

    },

    'unverified with a cached login': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(testElementExists('#fxa-signup-header'))

        // first, sign the user up to cache the login
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // round 2 - try to sign in with the unverified user.
        .then(openFxaFromRp('signin'))

        .then(testElementExists('#fxa-signin-header .service'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type="submit"]'))

        // success is using a cached login and being redirected
        // to a confirmation screen
        .then(testElementExists('#fxa-confirm-header'));
    },

    'oauth endpoint chooses the right auth flows': function () {
      return this.remote
        .then(openPage(OAUTH_APP, '.ready #splash'))

        // use the 'Choose my sign-in flow for me' button
        .then(click('.ready #splash .sign-choose'))

        .then(testElementExists('#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // go back to the OAuth app, the /oauth flow should
        // now suggest a cached login
        .get(OAUTH_APP)
        // again, use the 'Choose my sign-in flow for me' button
        .then(click('.ready #splash .sign-choose'))

        .then(testElementExists('#fxa-signin-header'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, {preVerified: true}))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 0))

        .then(testAtOAuthApp());
    },

    'verified, blocked, incorrect password': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, {preVerified: true}))

        .then(fillOutSignIn(email, 'bad' + PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 0))

        // wait until at the signin page to check the URL to
        // avoid latency problems with submitting the unblock code.
        // w/o the wait, the URL can be checked before
        // the submit completes.
        .then(testElementExists('#fxa-signin-header'))
        .then(testUrlPathnameEquals('/oauth/signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 1))

        .then(testAtOAuthApp());
    },

    'signin in Chrome for Android, verify same browser': function () {
      // The `sync` prefix is needed to force signin confirmation.
      email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(createUser(email, PASSWORD, {preVerified: true}))
        .then(openFxaFromRp('signin', {
          query: {
            client_id: '7f368c6886429f19', // eslint-disable-line camelcase
            forceUA: 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
            // eslint-disable-next-line camelcase
            keys_jwk: 'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
            'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
            'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
            redirect_uri: 'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
            scope: 'profile https://identity.mozilla.com/apps/notes'
          }
        }))
        .then(testElementTextInclude(selectors.SIGNIN.SUB_HEADER, 'notes'))
        .then(testUrlInclude('client_id='))
        .then(testUrlInclude('state='))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(openVerificationLinkInNewTab(email, 0))

        .then(switchToWindow(1))
        // wait for the verified window in the new tab
        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
        .then(noSuchElement(selectors.SIGNIN_COMPLETE.CONTINUE_BUTTON))
        // user sees the name of the RP, but cannot redirect
        .then(testElementTextInclude(selectors.SIGNIN_COMPLETE.SERVICE_NAME, 'notes'))

        // switch to the original window
        .then(closeCurrentWindow())

        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
        .then(click(selectors.SIGNIN_COMPLETE.CONTINUE_BUTTON));
    },


  }
});

registerSuite('oauth - TOTP', {
  beforeEach: function () {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState())
      .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
      .then(fillOutSignUp(email, PASSWORD))
      .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      .then(openVerificationLinkInSameTab(email, 0))
      .then(testElementExists(selectors.SETTINGS.HEADER))

      .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
      .then(testElementExists(selectors.SETTINGS.HEADER))
      .then(testElementExists(selectors.TOTP.MENU_BUTTON))

      .then(click(selectors.TOTP.MENU_BUTTON))

      .then(testElementExists(selectors.TOTP.QR_CODE))
      .then(testElementExists(selectors.TOTP.SHOW_CODE_LINK))

      .then(click(selectors.TOTP.SHOW_CODE_LINK))
      .then(testElementExists(selectors.TOTP.MANUAL_CODE))

      // Store the secret key to recalculate the code later
      .findByCssSelector(selectors.TOTP.MANUAL_CODE)
      .getVisibleText()
      .then((secretKey) => {
        secret = secretKey;
      })
      .end();
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can add TOTP to account and confirm oauth signin': function () {
      return this.remote
        .then(confirmTotpCode(secret))

        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))

        .then(openFxaFromRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        // Correctly submits the totp code and navigates to oauth page
        .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
        .then(type(selectors.TOTP_SIGNIN.INPUT, generateCode(secret)))
        .then(click(selectors.TOTP_SIGNIN.SUBMIT))

        .then(testAtOAuthApp());
    },

    'can remove TOTP from account and skip confirmation': function () {
      return this.remote
        .then(confirmTotpCode(secret))

        // Remove token
        .then(click(selectors.TOTP.DELETE_BUTTON))
        .then(testSuccessWasShown)
        .then(testElementExists(selectors.TOTP.MENU_BUTTON))

        // Does not prompt for code
        .then(click(selectors.SETTINGS.SIGNOUT))

        .then(clearBrowserState({
          '123done': true,
          contentServer: true
        }))
        .then(openFxaFromRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },
  }
});

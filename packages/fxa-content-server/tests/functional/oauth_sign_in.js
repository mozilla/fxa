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
otplib.authenticator.options = { encoding: 'hex' };

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const EMAIL_FIRST_SYNC_DESKTOP_URL = `${SIGNUP_URL}?context=fx_desktop_v3&service=sync&action=email`;
const SETTINGS_URL = `${config.fxaContentRoot}settings`;

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

registerSuite('oauth signin', {
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
    'with missing client_id': function() {
      return this.remote.then(
        openPage(SIGNIN_ROOT + '?scope=profile', selectors['400'].HEADER)
      );
    },

    'with missing scope': function() {
      return this.remote.then(
        openPage(SIGNIN_ROOT + '?client_id=client_id', selectors['400'].HEADER)
      );
    },

    'with invalid client_id': function() {
      return this.remote.then(
        openPage(
          SIGNIN_ROOT + '?client_id=invalid_client_id&scope=profile',
          selectors['400'].HEADER
        )
      );
    },

    'with service=sync specified': function() {
      return this.remote.then(openFxaFromRp('signin')).then(
        reOpenWithAdditionalQueryParams(
          {
            service: 'sync',
          },
          selectors['400'].HEADER
        )
      );
    },

    verified: function() {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },

    'verified using a cached OAuth login': function() {
      // verify account
      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(createUser(email, PASSWORD, { preVerified: true }))

          // sign in with a verified account to cache credentials
          .then(fillOutSignIn(email, PASSWORD))

          .then(testAtOAuthApp())
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))
          // round 2 - with the cached credentials
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'verified using a cached Sync login': function() {
      return this.remote
        .then(
          openPage(EMAIL_FIRST_SYNC_DESKTOP_URL, selectors.ENTER_EMAIL.HEADER, {
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
            },
          })
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(click(selectors.ENTER_EMAIL.SUBMIT))

        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
        .then(click(selectors.SIGNUP_PASSWORD.SUBMIT))

        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

        .then(openFxaFromRp('signin'))
        .then(
          testElementTextInclude(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email)
        )
        .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))

        .then(testAtOAuthApp());
    },

    'verified using a cached expired Sync login': function() {
      return (
        this.remote
          .then(
            openPage(
              EMAIL_FIRST_SYNC_DESKTOP_URL,
              selectors.ENTER_EMAIL.HEADER,
              {
                webChannelResponses: {
                  'fxaccounts:can_link_account': { ok: true },
                },
              }
            )
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(click(selectors.ENTER_EMAIL.SUBMIT))

          .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
          .then(click(selectors.SIGNUP_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInDifferentBrowser(email, 0))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(destroySessionForEmail(email))

          // we only know the sessionToken is expired once the
          // user submits the form.
          .then(openFxaFromRp('signin'))
          .then(
            testElementTextInclude(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email)
          )
          .then(click(selectors.SIGNIN.SUBMIT))

          // we now know the sessionToken is expired. Allow the user to sign in
          // with their password.
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'unverified, acts like signup': function() {
      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(createUser(email, PASSWORD, { preVerified: false }))

          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          .then(openVerificationLinkInSameTab(email, 1))
          // user verifies in the same tab, so they are logged in to the RP.
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'unverified with a cached login': function() {
      return (
        this.remote
          .then(openFxaFromRp('signup'))
          .then(testElementExists(selectors.SIGNUP.HEADER))

          // first, sign the user up to cache the login
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // round 2 - try to sign in with the unverified user.
          .then(openFxaFromRp('signin'))

          .then(testElementExists(selectors.SIGNIN.SUB_HEADER))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          // success is using a cached login and being redirected
          // to a confirmation screen
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'oauth endpoint chooses the right auth flows': function() {
      return (
        this.remote
          .then(openPage(OAUTH_APP, '.ready #splash'))

          // use the 'Choose my sign-in flow for me' button
          .then(click(selectors['123DONE'].BUTTON_SIGNIN_CHOOSE_FLOW_FOR_ME))

          .then(testElementExists(selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          // go back to the OAuth app, the /oauth flow should
          // now suggest a cached login
          .get(OAUTH_APP)
          // again, use the 'Choose my sign-in flow for me' button
          .then(click(selectors['123DONE'].BUTTON_SIGNIN_CHOOSE_FLOW_FOR_ME))

          .then(testElementExists(selectors.SIGNIN.HEADER))
      );
    },

    'verified, blocked': function() {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(fillOutSignInUnblock(email, 0))

        .then(testAtOAuthApp());
    },

    'verified, blocked, incorrect password': function() {
      email = TestHelpers.createEmail('blocked{id}');

      return (
        this.remote
          .then(openFxaFromRp('signin'))
          .then(createUser(email, PASSWORD, { preVerified: true }))

          .then(fillOutSignIn(email, 'bad' + PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(fillOutSignInUnblock(email, 0))

          // wait until at the signin page to check the URL to
          // avoid latency problems with submitting the unblock code.
          // w/o the wait, the URL can be checked before
          // the submit completes.
          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(testUrlPathnameEquals('/oauth/signin'))
          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(fillOutSignInUnblock(email, 1))

          .then(testAtOAuthApp())
      );
    },

    'signin in Chrome for Android, verify same browser': function() {
      // The `sync` prefix is needed to force signin confirmation.
      email = TestHelpers.createEmail('sync{id}');
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('signin', {
              query: {
                client_id: '7f368c6886429f19', // eslint-disable-line camelcase
                forceUA:
                  'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
                // eslint-disable-next-line camelcase
                keys_jwk:
                  'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
                  'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
                  'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
                redirect_uri:
                  'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
                scope: 'profile https://identity.mozilla.com/apps/notes',
              },
            })
          )
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
          .then(
            testElementTextInclude(
              selectors.SIGNIN_COMPLETE.SERVICE_NAME,
              'notes'
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(click(selectors.SIGNIN_COMPLETE.CONTINUE_BUTTON))
      );
    },
  },
});

registerSuite('oauth - TOTP', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return (
      this.remote
        .then(clearBrowserState())
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
        .then(secretKey => {
          secret = secretKey;
        })
        .end()
    );
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can add TOTP to account and confirm oauth signin': function() {
      return (
        this.remote
          .then(confirmTotpCode(secret))

          .then(
            clearBrowserState({
              '123done': true,
              contentServer: true,
            })
          )

          .then(openFxaFromRp('signin'))
          .then(fillOutSignIn(email, PASSWORD))

          // Correctly submits the totp code and navigates to oauth page
          .then(testElementExists(selectors.TOTP_SIGNIN.HEADER))
          .then(type(selectors.TOTP_SIGNIN.INPUT, generateTotpCode(secret)))
          .then(click(selectors.TOTP_SIGNIN.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'can remove TOTP from account and skip confirmation': function() {
      return (
        this.remote
          .then(confirmTotpCode(secret))

          // Remove token
          .then(click(selectors.TOTP.DELETE_BUTTON))
          .then(testSuccessWasShown)
          .then(testElementExists(selectors.TOTP.MENU_BUTTON))

          // Does not prompt for code
          .then(click(selectors.SETTINGS.SIGNOUT))

          .then(
            clearBrowserState({
              '123done': true,
              contentServer: true,
            })
          )
          .then(openFxaFromRp('signin'))
          .then(fillOutSignIn(email, PASSWORD))

          .then(testAtOAuthApp())
      );
    },
  },
});

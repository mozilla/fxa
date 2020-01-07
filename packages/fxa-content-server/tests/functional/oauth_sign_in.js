/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;
const otplib = require('otplib');
const selectors = require('./lib/selectors');

// Default options for TOTP
otplib.authenticator.options = { encoding: 'hex' };

const SETTINGS_URL = `${config.fxaContentRoot}settings`;

const PASSWORD = 'passwordzxcv';
const CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const CODE_CHALLENGE_METHOD = 'S256';

let email;
let secret;

const thenify = FunctionalHelpers.thenify;

const {
  clearBrowserState,
  click,
  confirmTotpCode,
  createEmail,
  createUser,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignInUnblock,
  fillOutSignInTokenCode,
  fillOutSignUpCode,
  generateTotpCode,
  openFxaFromRp,
  openPage,
  testElementExists,
  testElementTextEquals,
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
    verified: function() {
      return this.remote
        .then(openFxaFromRp('enter-email'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },

    'verified using a cached login': function() {
      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(createUser(email, PASSWORD, { preVerified: true }))

          // sign in with a verified account to cache credentials
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testAtOAuthApp())
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))
          // round 2 - with the cached credentials
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testAtOAuthApp())
      );
    },

    'verified using a cached expired login': function() {
      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(createUser(email, PASSWORD, { preVerified: true }))

          // sign in with a verified account to cache credentials
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testAtOAuthApp())
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))
          // round 2 - with the cached credentials
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(destroySessionForEmail(email))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )
          // we only know the sessionToken is expired once the
          // user submits the form.
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))
          // we now know the sessionToken is expired. Allow the user to sign in
          // with their password.
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'cached credentials that expire while on page': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.ENTER_EMAIL.HEADER,
            })
          )

          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))
          .then(testAtOAuthApp())
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          // user is signed in, use cached credentials no password is needed
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )
          .then(destroySessionForEmail(email))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))
          // Session expired error should show.
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.ERROR))

          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.ERROR))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'unverified, acts like signup': function() {
      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(createUser(email, PASSWORD, { preVerified: false }))

          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          .then(fillOutSignInTokenCode(email, 1))
          // user verifies in the same tab, so they are logged in to the RP.
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'unverified with a cached login': function() {
      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))

          // first, sign the user up to cache the login
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // round 2 - try to sign in with the unverified user.
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )

          .then(testElementExists(selectors.SIGNIN_PASSWORD.SUB_HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // success is using a cached login and being redirected
          // to a confirmation screen
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          // get the second email, the first was sent via fillOutEmailFirstSignUp above.
          .then(fillOutSignInTokenCode(email, 1))
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'oauth endpoint chooses the right auth flows': function() {
      return (
        this.remote
          .then(openPage(OAUTH_APP, '.ready'))

          // use the 'Choose my sign-in flow for me' button
          .then(click(selectors['123DONE'].BUTTON_SIGNIN_CHOOSE_FLOW_FOR_ME))

          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          // go back to the OAuth app, the /oauth flow should
          // now suggest a cached login
          .get(OAUTH_APP)
          // again, use the 'Choose my sign-in flow for me' button
          .then(click(selectors['123DONE'].BUTTON_SIGNIN_CHOOSE_FLOW_FOR_ME))

          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
      );
    },

    'email specified by relier, invalid': function() {
      const invalidEmail = 'invalid@';

      return this.remote
        .then(
          openFxaFromRp('enter-email', {
            header: selectors.ENTER_EMAIL.HEADER,
            query: {
              email: invalidEmail,
            },
          })
        )
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, invalidEmail))
        .then(testElementExists(selectors.ENTER_EMAIL.TOOLTIP))
        .then(
          testElementTextEquals(
            selectors.ENTER_EMAIL.TOOLTIP,
            'Valid email required'
          )
        );
    },

    'email specified by relier, not registered': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: {
                email,
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          // user realizes it's the wrong email address.
          .then(
            click(
              selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'login_hint specified by relier, not registered': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: {
                login_hint: email,
              },
            })
          )

          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          // user realizes it's the wrong email address.
          .then(
            click(
              selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'email specified by relier, registered': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                email,
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          // user realizes it's the wrong email address.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'login_hint specified by relier, registered': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('enter-email', {
            header: selectors.SIGNIN_PASSWORD.HEADER,
            query: {
              login_hint: email,
            },
          })
        )
        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email));
    },

    'cached credentials, login_hint specified by relier': function() {
      const loginHintEmail = createEmail();
      const oAuthEmail = createEmail();

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(createUser(oAuthEmail, PASSWORD, { preVerified: true }))
          .then(createUser(loginHintEmail, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('email-first', {
              header: selectors.ENTER_EMAIL.HEADER,
            })
          )

          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))
          .then(testAtOAuthApp())
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          // login_hint takes precedence over the signed in user
          .then(
            openFxaFromRp('email-first', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                login_hint: loginHintEmail,
              },
            })
          )

          .then(
            testElementValueEquals(
              selectors.SIGNIN_PASSWORD.EMAIL,
              loginHintEmail
            )
          )
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'login_hint specified by relier, registered, user changes email': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                login_hint: email,
              },
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))

          // user realizes they want to use a different account.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'verified, blocked': function() {
      email = createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('enter-email'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(fillOutSignInUnblock(email, 0))

        .then(testAtOAuthApp());
    },

    'verified, blocked, incorrect password': function() {
      email = createEmail('blocked{id}');

      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(createUser(email, PASSWORD, { preVerified: true }))

          .then(fillOutEmailFirstSignIn(email, 'bad' + PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(fillOutSignInUnblock(email, 0))

          // wait until at the signin page to check the URL to
          // avoid latency problems with submitting the unblock code.
          // w/o the wait, the URL can be checked before
          // the submit completes.
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(testUrlPathnameEquals('/oauth/signin'))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.SIGNIN_UNBLOCK.HEADER
            )
          )

          .then(fillOutSignInUnblock(email, 1))

          .then(testAtOAuthApp())
      );
    },

    'signin in Chrome for Android, verify same browser': function() {
      // The `sync` prefix is needed to force signin confirmation.
      email = createEmail('sync{id}');
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('enter-email', {
            query: {
              client_id: '7f368c6886429f19', // eslint-disable-line camelcase
              code_challenge: CODE_CHALLENGE,
              code_challenge_method: CODE_CHALLENGE_METHOD,
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
        .then(testElementTextInclude(selectors.ENTER_EMAIL.SUB_HEADER, 'notes'))
        .then(testUrlInclude('client_id='))
        .then(testUrlInclude('state='))

        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(fillOutSignInTokenCode(email, 0))

        .then(testElementExists(selectors.FIREFOX_NOTES.HEADER));
    },
  },
});

registerSuite('oauth signin - TOTP', {
  beforeEach: function() {
    email = createEmail();
    return (
      this.remote
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
        .then(fillOutSignUpCode(email, 0))
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
        .then(() => this.remote.then(click(selectors.TOTP.KEY_OK_BUTTON)))
    );
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

          .then(openFxaFromRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

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
          .then(openFxaFromRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testAtOAuthApp())
      );
    },
  },
});

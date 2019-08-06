/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const { createEmail } = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const selectors = require('./lib/selectors');

const SYNC_SIGNIN_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync&action=email`;

const PASSWORD = 'passwordzxcv';
let email;

const {
  clearBrowserState,
  click,
  createUser,
  noSuchElement,
  openFxaFromRp,
  openPage,
  openVerificationLinkInSameTab,
  testElementExists,
  testElementTextEquals,
  testElementValueEquals,
  thenify,
  type,
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

registerSuite('oauth email first', {
  beforeEach: function() {
    email = createEmail();

    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  afterEach: function() {
    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  tests: {
    signup: function() {
      return this.remote
        .then(
          openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER })
        )

        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        )

        .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_PASSWORD))

        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(testElementExists(selectors.SIGNUP_PASSWORD.SHOW_VPASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.AGE, 21))
        .then(
          click(
            selectors.SIGNUP_PASSWORD.SUBMIT,
            selectors.CONFIRM_SIGNUP.HEADER
          )
        )

        .then(openVerificationLinkInSameTab(email, 0))

        .then(testAtOAuthApp());
    },

    'signin verified': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER })
        )

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )

        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(testElementExists(selectors.SIGNIN_PASSWORD.SHOW_PASSWORD))

        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(testAtOAuthApp());
    },

    'signin unverified': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(
          openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER })
        )

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )

        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNIN_PASSWORD.SUBMIT,
            selectors.CONFIRM_SIGNUP.HEADER
          )
        )

        .then(openVerificationLinkInSameTab(email, 1))

        .then(testAtOAuthApp());
    },

    'email specified by relier, invalid': function() {
      const invalidEmail = 'invalid@';

      return this.remote
        .then(
          openFxaFromRp('email-first', {
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
            openFxaFromRp('email-first', {
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
              selectors.SIGNUP_PASSWORD.LINK_MISTYPED_EMAIL,
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
            openFxaFromRp('email-first', {
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
              selectors.SIGNUP_PASSWORD.LINK_MISTYPED_EMAIL,
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
            openFxaFromRp('email-first', {
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
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
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
          openFxaFromRp('email-first', {
            header: selectors.SIGNIN_PASSWORD.HEADER,
            query: {
              login_hint: email,
            },
          })
        )
        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email));
    },

    'login_hint specified by relier, registered, user changes email': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromRp('email-first', {
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
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
      );
    },

    'cached Sync credentials': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(SYNC_SIGNIN_URL, selectors.ENTER_EMAIL.HEADER, {
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
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.CONNECT_ANOTHER_DEVICE.HEADER
            )
          )

          // user is signed into Sync, now try to sign into OAuth w/o entering password.
          .then(
            openFxaFromRp('email-first', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          .then(noSuchElement(selectors.SIGNIN_PASSWORD.PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'cached Sync credentials, user changes email': function() {
      const oAuthEmail = createEmail();
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(createUser(oAuthEmail, PASSWORD, { preVerified: true }))
          .then(
            openPage(SYNC_SIGNIN_URL, selectors.ENTER_EMAIL.HEADER, {
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
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.CONNECT_ANOTHER_DEVICE.HEADER
            )
          )

          .then(
            openFxaFromRp('email-first', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))

          // user realizes they want to use a different account.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(type(selectors.ENTER_EMAIL.EMAIL, oAuthEmail))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'cached Sync credentials, login_hint specified by relier': function() {
      const loginHintEmail = createEmail();

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(createUser(loginHintEmail, PASSWORD, { preVerified: true }))
        .then(
          openPage(SYNC_SIGNIN_URL, selectors.ENTER_EMAIL.HEADER, {
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
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )

        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(
          click(
            selectors.SIGNIN_PASSWORD.SUBMIT,
            selectors.CONNECT_ANOTHER_DEVICE.HEADER
          )
        )

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

        .then(testAtOAuthApp());
    },

    'cached Sync credentials, login_hint specified by relier, user changes email': function() {
      const loginHintEmail = createEmail();
      const oAuthEmail = createEmail();

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(createUser(oAuthEmail, PASSWORD, { preVerified: true }))
          .then(createUser(loginHintEmail, PASSWORD, { preVerified: true }))
          .then(
            openPage(SYNC_SIGNIN_URL, selectors.ENTER_EMAIL.HEADER, {
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
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT,
              selectors.CONNECT_ANOTHER_DEVICE.HEADER
            )
          )

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

          // user realizes they want to use a different account.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(type(selectors.ENTER_EMAIL.EMAIL, oAuthEmail))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'cached OAuth credentials': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
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

          // user is signed in, use cached credentials but a password is needed
          .then(
            openFxaFromRp('email-first', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },

    'cached OAuth credentials, login_hint specified by relier': function() {
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

          // user is signed in, use cached credentials but a password is needed
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

    'cached OAuth credentials, login_hint specified by relier, user changes email': function() {
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
          // user realizes they want to use a different account.
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_MISTYPED_EMAIL,
              selectors.ENTER_EMAIL.HEADER
            )
          )

          .then(type(selectors.ENTER_EMAIL.EMAIL, oAuthEmail))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testAtOAuthApp())
      );
    },
  },
});

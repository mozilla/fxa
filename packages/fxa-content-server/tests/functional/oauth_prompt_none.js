/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const selectors = require('./lib/selectors');

const EMAIL_FIRST_URL = `${config.fxaContentRoot}?action=email`;

const PASSWORD = 'passwordzxcv';

let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  openPage,
  openRP,
  testElementExists,
  testElementTextInclude,
} = FunctionalHelpers;

registerSuite('oauth prompt=none', {
  beforeEach: function () {
    email = createEmail();

    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  afterEach: function () {
    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  tests: {
    'fails RP that is not allowed': function () {
      return this.remote
        .then(
          openRP({
            untrusted: true,
            query: { login_hint: email, return_on_error: false },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'prompt=none is not enabled for this client'
          )
        );
    },

    'fails if requesting keys': function () {
      return this.remote
        .then(
          openRP({
            query: {
              client_id: '7f368c6886429f19', // eslint-disable-line camelcase
              forceUA:
                'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
              keys_jwk:
                'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
                'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
                'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
              login_hint: email,
              redirect_uri:
                'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
              return_on_error: false,
              scope: 'profile https://identity.mozilla.com/apps/notes',
            },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'prompt=none cannot be used when requesting keys'
          )
        );
    },

    'fails if no login_hint': function () {
      const email = createEmail();
      // We do the session check before the login_hint/id_token_hint check,
      // so need a session to generate this error.
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(
          openRP({
            query: { return_on_error: false },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'missing oauth parameter'
          )
        );
    },

    'fails if no user logged in': function () {
      return this.remote
        .then(
          openRP({
            query: {
              login_hint: email,
              return_on_error: false,
            },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'User is not signed in'
          )
        );
    },

    'fails if account is not verified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))

        .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

        .then(openRP({ query: { login_hint: email, return_on_error: false } }))
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'Unverified user or session'
          )
        );
    },

    'fails if login_hint is different to logged in user': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openRP({
            query: { login_hint: createEmail(), return_on_error: false },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'a different user is signed in'
          )
        );
    },

    'fails if session is no longer valid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(destroySessionForEmail(email))
        .then(
          openRP({
            query: { login_hint: email, return_on_error: false },
          })
        )
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['400'].HEADER))
        .then(
          testElementTextInclude(
            selectors['400'].ERROR,
            'User is not signed in'
          )
        );
    },

    'succeeds if login_hint same as logged in user': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(openPage(EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openRP({ query: { login_hint: email } }))
        .then(click(selectors['123DONE'].BUTTON_PROMPT_NONE))
        .then(testElementExists(selectors['123DONE'].AUTHENTICATED));
    },
  },
});

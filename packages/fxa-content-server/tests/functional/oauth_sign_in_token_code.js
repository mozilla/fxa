/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = intern.getPlugin('chai').assert;
const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const PASSWORD = 'passwordzxcv';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  fillOutSignInTokenCode,
  openFxaFromRp,
  testElementExists,
  testElementTextInclude,
  getEmailHeaders,
  type,
} = FunctionalHelpers;

const NOTES_REDIRECT_PAGE_SELECTOR = '#notes-by-firefox';
const NOTES_PAGE_TEXT_SELECTOR = 'Notes by Firefox';
const experimentParams = {
  query: {
    client_id: '7f368c6886429f19', // eslint-disable-line camelcase
    code_challenge: 'aSOwsmuRBE1ZIVtiW6bzKMaf47kCFl7duD6ZWAXdnJo', // eslint-disable-line camelcase
    code_challenge_method: 'S256', // eslint-disable-line camelcase
    forceUA:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
    // eslint-disable-next-line camelcase
    keys_jwk:
      'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
      'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
      'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
    redirect_uri: 'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
    scope: 'profile https://identity.mozilla.com/apps/notes',
  },
};

registerSuite('OAuth signin token code', {
  beforeEach: function () {
    // The `sync` prefix is needed to force confirmation.
    email = createEmail('sync{id}');

    return this.remote
      .then(
        clearBrowserState({
          contentServer: true,
          force: true,
        })
      )
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'verified - - bounce': function () {
      experimentParams.query.forceExperiment = 'tokenCode';
      experimentParams.query.forceExperimentGroup = 'treatment-code';

      return this.remote
        .then(openFxaFromRp('enter-email', experimentParams))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(destroySessionForEmail(email))
        .then(testElementExists(selectors.SIGNIN_BOUNCED.HEADER))
        .then(testElementExists(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
        .then(testElementExists(selectors.SIGNIN_BOUNCED.BACK))
        .then(testElementExists(selectors.SIGNIN_BOUNCED.SUPPORT));
    },

    'verified - valid code': function () {
      return (
        this.remote
          .then(openFxaFromRp('enter-email', experimentParams))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // Displays invalid code errors
          .then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, '000000'))
          .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_TOKEN_CODE.TOOLTIP,
              'Invalid or expired'
            )
          )
          // Can resend code
          .then(click(selectors.SIGNIN_TOKEN_CODE.LINK_RESEND))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_TOKEN_CODE.SUCCESS,
              'Email resent.'
            )
          )

          // Correctly submits the token code and navigates to oauth page
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(getEmailHeaders(email, 1))
          .then((headers) => {
            assert.equal(headers['x-template-name'], 'verifyLoginCode');
          })
          .then(fillOutSignInTokenCode(email, 1))

          .then(
            testElementTextInclude(
              NOTES_REDIRECT_PAGE_SELECTOR,
              NOTES_PAGE_TEXT_SELECTOR
            )
          )
      );
    },

    'verified - valid code then click back': function () {
      return (
        this.remote
          .then(openFxaFromRp('enter-email', experimentParams))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // Correctly submits the token code and navigates to oauth page
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(fillOutSignInTokenCode(email, 0))

          .then(
            testElementTextInclude(
              NOTES_REDIRECT_PAGE_SELECTOR,
              NOTES_PAGE_TEXT_SELECTOR
            )
          )

          .goBack()
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
      );
    },
  },
});

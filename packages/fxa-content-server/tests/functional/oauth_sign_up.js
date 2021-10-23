/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const PASSWORD = 'password12345678';
const SUCCESS_URL = config.fxaContentRoot + 'oauth/success/dcdb5ae7add825d2';
let email;
let bouncedEmail;

const {
  clearBrowserState,
  createEmail,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  getFxaClient,
  noEmailExpected,
  openFxaFromRp,
  openPage,
  testElementExists,
  testUrlInclude,
  visibleByQSA,
} = FunctionalHelpers;
const {
  openFxaFromRp: openFxaFromRpRm,
  testElementExists: testElementExistsRm,
  fillOutEmailFirstSignUp: fillOutEmailFirstSignUpRm,
  fillOutEmailFirstEmail,
} = FunctionalHelpers.helpersRemoteWrapped;

registerSuite('oauth signup', {
  beforeEach: function () {
    email = createEmail();
    bouncedEmail = createEmail();

    // clear localStorage to avoid polluting other tests.
    // Without the clear, /signup tests fail because of the info stored
    // in prefillEmail
    return this.remote.then(
      clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  tests: {
    signup: function () {
      return (
        this.remote
          .then(openFxaFromRp('enter-email'))
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(testUrlInclude('client_id='))
          .then(testUrlInclude('redirect_uri='))
          .then(testUrlInclude('state='))

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(fillOutSignUpCode(email, 0))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))

          // Do not expect a post-verification email, those are for Sync.
          .then(noEmailExpected(email, 1))
      );
    },

    'signup, bounce email, allow user to restart flow but force a different email':
      function () {
        return (
          this.remote
            .then(openFxaFromRp('enter-email'))
            .then(fillOutEmailFirstSignUp(bouncedEmail, PASSWORD))

            .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
            .then(function () {
              return getFxaClient().accountDestroy(bouncedEmail, PASSWORD);
            })

            .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
            // expect an error message to already be present on redirect
            .then(visibleByQSA(selectors.ENTER_EMAIL.TOOLTIP_BOUNCED_EMAIL))

            .then(fillOutEmailFirstSignUp(email, PASSWORD))

            .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
            .then(fillOutSignUpCode(email, 0))

            .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
        );
      },

    'a success screen is available': function () {
      return this.remote.then(
        openPage(SUCCESS_URL, '#fxa-oauth-success-header')
      );
    },

    'in pocket migration experiment': async ({ remote }) => {
      await openFxaFromRpRm(
        'enter-email',
        {
          query: {
            forceExperiment: 'pocketMigration',
            forceExperimentGroup: 'treatment',
          },
        },
        remote
      );

      await testElementExistsRm(selectors.POCKET_OAUTH.LOGO_IMG, remote);
      await testElementExistsRm(selectors.POCKET_OAUTH.SERVICE_TILE, remote);
      await testElementExistsRm(selectors.POCKET_OAUTH.ALL_SERVICES, remote);

      await fillOutEmailFirstEmail(
        email,
        selectors.SIGNUP_PASSWORD.HEADER,
        remote
      );
      await testElementExistsRm(selectors.POCKET_OAUTH.LOGO_IMG, remote);
      await testElementExistsRm(selectors.POCKET_OAUTH.TOS, remote);
      await testElementExistsRm(selectors.POCKET_OAUTH.PP, remote);

      await fillOutEmailFirstSignUpRm(
        email,
        PASSWORD,
        { enterEmail: false },
        remote
      );

      await testElementExistsRm(selectors.POCKET_OAUTH.LOGO_IMG, remote);
    },
  },
});

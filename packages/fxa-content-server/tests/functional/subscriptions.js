/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
/*eslint-disable camelcase */
const productIdNameMap = {
  prod_GqM9ToKK62qjkK: '123Done Pro',
  prod_FiJ42WCzZNRSbS: 'mozilla vpn',
};
/*eslint-enable camelcase*/

const {
  clearBrowserState,
  click,
  createEmail,
  createUserAndLoadSettings,
  fillOutFinishAccountSetup,
  fillOutEmailFirstSignIn,
  getTestProductSubscriptionUrl,
  openPage,
  openRP,
  openVerificationLinkInSameTab,
  signInToTestProduct,
  subscribeAndSigninToRp,
  subscribeToTestProductWithCardNumber,
  subscribeToTestProductWithPasswordlessAccount,
  testElementExists,
  testElementTextInclude,
  visibleByQSA,
} = FunctionalHelpers;

const config = intern.config;
const ENTER_EMAIL_PAGE_URL = config.fxaContentRoot;

registerSuite('subscriptions', {
  tests: {
    'visit product page without signing in, expect to see product name displayed in sub-header':
      function () {
        if (
          process.env.CIRCLECI === 'true' &&
          !process.env.SUBHUB_STRIPE_APIKEY
        ) {
          this.skip('missing Stripe API key in CircleCI run');
        }
        return this.remote
          .then(
            clearBrowserState({
              '123done': true,
              force: true,
            })
          )
          .then(
            openPage(
              getTestProductSubscriptionUrl(),
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(
            testElementTextInclude(
              selectors.ENTER_EMAIL.SUB_HEADER,
              `Continue to ${productIdNameMap[intern.config.testProductId]}`
            )
          );
      },

    'sign up, subscribe, sign in to verify subscription': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote.then(subscribeAndSigninToRp(email));
    },
    'sign up, failed to subscribe due to expired CC': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote
        .then(
          clearBrowserState({
            '123done': true,
            force: true,
          })
        )
        .then(createUserAndLoadSettings(email))
        .then(signInToTestProduct())

        .then(click(selectors['123DONE'].LINK_LOGOUT))
        .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))

        .then(subscribeToTestProductWithCardNumber('4000000000000069'))

        .then(testElementTextInclude('.payment-error', 'expired'));
    },
    'sign up, failed to subscribe with mismatching currency': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote
        .then(
          clearBrowserState({
            '123done': true,
            force: true,
          })
        )
        .then(createUserAndLoadSettings(email))
        .then(
          subscribeToTestProductWithCardNumber(
            '4000000000000069',
            getTestProductSubscriptionUrl('myr')
          )
        )
        .then(
          testElementTextInclude(
            '.payment-error',
            'It looks like your credit card has expired.'
          )
        );
    },
    'sign up for subscription with password less account': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      const PASSWORD = 'passwordzxcv';
      return (
        this.remote
          .then(
            clearBrowserState({
              '123done': true,
              force: true,
            })
          )
          .then(openRP())
          .then(
            click(
              selectors['123DONE'].BUTTON_SUBSCRIBE_PASSWORDLESS,
              '.new-user-email-form'
            )
          )
          .then(
            subscribeToTestProductWithPasswordlessAccount(
              '4242424242424242',
              email
            )
          )
          .then(testElementExists('.payment-confirmation'))

          // Set password on passwordless account
          .then(openVerificationLinkInSameTab(email, 0))
          .then(fillOutFinishAccountSetup(PASSWORD))
          .then(testElementExists('#splash-logo'))
          .then(
            clearBrowserState({
              '123done': true,
              force: true,
            })
          )
          .then(openPage(ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

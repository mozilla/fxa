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
  getTestProductSubscriptionUrl,
  openPage,
  signInToTestProduct,
  subscribeAndSigninToRp,
  subscribeToTestProductWithCardNumber,
  testElementTextInclude,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('subscriptions', {
  tests: {
    'visit product page without signing in, expect to see product name displayed in sub-header': function () {
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
  },
});

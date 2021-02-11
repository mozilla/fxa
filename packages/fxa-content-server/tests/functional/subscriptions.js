/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

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
            'Continue to 123Done Pro'
          )
        );
    },

    'sign up, subscribe for 123Done Pro, sign into 123Done to verify subscription': function () {
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

        .then(testElementTextInclude('.error-message-container', 'expired'));
    },
    'sign up, failed to subscribe with mismatching currency': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return (
        this.remote
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
          // TODO - This will change to a more helpful error message when https://github.com/mozilla/fxa/issues/7467 lands.
          .then(
            testElementTextInclude(
              '.error-message-container',
              'something went wrong. please try again later.'
            )
          )
      );
    },
  },
});

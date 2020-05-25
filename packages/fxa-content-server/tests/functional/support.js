/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const SUPPORT_URL = config.fxaContentRoot + 'support';
const PASSWORD = 'amazingpassword';

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  subscribeToTestProduct,
  testUrlPathnameEquals,
  testElementExists,
  type,
} = FunctionalHelpers;

registerSuite('support form without valid session', {
  tests: {
    'go to support form, redirects to index': function () {
      return this.remote
        .then(clearBrowserState({ force: true }))
        .then(openPage(SUPPORT_URL, selectors.ENTER_EMAIL.HEADER));
    },
  },
});

registerSuite('support form without active subscriptions', {
  tests: {
    'go to support form, redirects to subscription management, then back to settings': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openPage(SUPPORT_URL, selectors.SETTINGS.SUB_PANELS))
        .then(testUrlPathnameEquals('/settings'));
    },
  },
});

registerSuite('support form with an active subscription', {
  tests: {
    'go to support form, submits the form': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(subscribeToTestProduct())
        .then(openPage(SUPPORT_URL, 'div.support'))
        .then(click('#product_chosen a.chosen-single'))
        .then(
          click(
            '#product_chosen ul.chosen-results li[data-option-array-index="1"]'
          )
        )
        .then(click('#topic_chosen a.chosen-single'))
        .then(
          click(
            '#topic_chosen ul.chosen-results li[data-option-array-index="1"]'
          )
        )
        .then(type('textarea[name=message]', 'please send halp'))
        .then(click('button[type=submit]'));
      // Since we don't have proper Zendesk config in CircleCI, the form
      // cannot be successfully submitted.
      // .then(testElementExists('.subscription-management'));
    },

    'go to support form, cancel, redirects to subscription management': function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      const email = createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(subscribeToTestProduct())
        .then(openPage(SUPPORT_URL, 'div.support'))
        .then(click('button.cancel', '.subscription-management'));
    },
  },
});

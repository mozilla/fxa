/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const SIGNIN_URL = config.fxaContentRoot + 'signin';
const SUPPORT_URL = config.fxaContentRoot + 'support';
const PASSWORD = 'amazingpassword';
const email = TestHelpers.createEmail();

const {
  clearBrowserState,
  click,
  createUser,
  fillOutSignIn,
  openPage,
  subscribeToTestProduct,
  testElementExists,
  type,
} = FunctionalHelpers;

registerSuite('support form without valid session', {
  tests: {
    'go to support form, redirects to signin': function() {
      return this.remote.then(openPage(SUPPORT_URL, selectors.SIGNIN.HEADER));
    },
  },
});

registerSuite('support form without active subscriptions', {
  tests: {
    'go to support form without active subscriptions, redirects to subscription management': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openPage(SUPPORT_URL, '.subscription-management'));
    },

    'go to support form with an active subscription, successfully submits the form': function() {
      return this.remote
        .then(subscribeToTestProduct())
        .then(openPage(SUPPORT_URL, 'div.support'))
        .then(click('a.chosen-single'))
        .then(click('ul.chosen-results li[data-option-array-index="1"]'))
        .then(type('textarea[name=message]', 'please send halp'))
        .then(click('button[type=submit]'));
      // Since we don't have proper Zendesk config in CircleCI, the form
      // cannot be successfully submitted.
      // .then(testElementExists('.subscription-management'));
    },
  },
});

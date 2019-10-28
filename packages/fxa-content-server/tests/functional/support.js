/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const { assert } = require('chai');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const SIGNIN_URL = config.fxaContentRoot + 'signin';
const SUPPORT_URL = config.fxaContentRoot + 'support';
const PASSWORD = 'amazingpassword';

const {
  clearBrowserState,
  click,
  createUser,
  fillOutSignIn,
  getQueryParamValue,
  openPage,
  subscribeToTestProduct,
  testElementExists,
  type,
} = FunctionalHelpers;

registerSuite('support form without valid session', {
  tests: {
    'go to support form, redirects to signin': function() {
      return this.remote
        .then(clearBrowserState({ force: true }))
        .then(openPage(SUPPORT_URL, selectors.SIGNIN.HEADER));
    },
  },
});

registerSuite('support form without active subscriptions', {
  tests: {
    'go to support form, redirects to subscription management, then back to settings': function() {
      const email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(openPage(SUPPORT_URL, '.subscription-management'))
        .then(getQueryParamValue('device_id'))
        .then(deviceId => assert.ok(deviceId))
        .then(getQueryParamValue('flow_begin_time'))
        .then(flowBeginTime => assert.ok(flowBeginTime))
        .then(getQueryParamValue('flow_id'))
        .then(flowId => assert.ok(flowId))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },
  },
});

registerSuite('support form with an active subscription', {
  tests: {
    'go to support form, submits the form': function() {
      const email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(subscribeToTestProduct())
        .then(openPage(SUPPORT_URL, 'div.support'))
        .then(click('#plan_chosen a.chosen-single'))
        .then(
          click(
            '#plan_chosen ul.chosen-results li[data-option-array-index="1"]'
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

    'go to support form, cancel, redirects to subscription management': function() {
      const email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(subscribeToTestProduct())
        .then(openPage(SUPPORT_URL, 'div.support'))
        .then(click('button.cancel', '.subscription-management'));
    },
  },
});

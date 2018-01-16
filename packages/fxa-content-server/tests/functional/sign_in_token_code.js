/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const config = intern._config;
const OAUTH_APP = config.fxaOAuthApp;
const selectors = require('./lib/selectors');

const PASSWORD = 'password';
let email;

const thenify = FunctionalHelpers.thenify;
const click = FunctionalHelpers.click;
const createUser = FunctionalHelpers.createUser;
const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
const fillOutSignInTokenCode = FunctionalHelpers.fillOutSignInTokenCode;
const openFxaFromRp = FunctionalHelpers.openFxaFromRp;
const testElementExists = FunctionalHelpers.testElementExists;
const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
const type = FunctionalHelpers.type;
const visibleByQSA = FunctionalHelpers.visibleByQSA;

const testAtOAuthApp = thenify(function () {
  return this.parent
    .then(testElementExists('#loggedin'))

    .getCurrentUrl()
    .then((url) => {
      // redirected back to the App
      assert.ok(url.indexOf(OAUTH_APP) > -1);
    });
});

registerSuite('signin token code', {
  beforeEach: function () {
    email = TestHelpers.createEmail();

    return this.remote
      .then(FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true
      }))
      .then(createUser(email, PASSWORD, {preVerified: true}));
  },

  tests: {
    'verified - control': function () {
      const experimentParams = {query: {forceExperiment: 'tokenCode', forceExperimentGroup: 'control'}};
      return this.remote
        .then(openFxaFromRp('signin', experimentParams))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },

    'verified - treatment - valid code': function () {
      const experimentParams = {query: {forceExperiment: 'tokenCode', forceExperimentGroup: 'treatment'}};
      return this.remote
        .then(openFxaFromRp('signin', experimentParams))
        .then(fillOutSignIn(email, PASSWORD))

        // Correctly submits the token code and navigates to oauth page
        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(fillOutSignInTokenCode(email, 0))

        .then(testAtOAuthApp());
    },

    'verified - treatment - valid code then click back': function () {
      const experimentParams = {query: {forceExperiment: 'tokenCode', forceExperimentGroup: 'treatment'}};
      return this.remote
        .then(openFxaFromRp('signin', experimentParams))
        .then(fillOutSignIn(email, PASSWORD))

        // Correctly submits the token code and navigates to oauth page
        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(fillOutSignInTokenCode(email, 0))

        .then(testAtOAuthApp())

        .goBack()
        .then(testElementExists(selectors.SIGNIN.HEADER));
    },

    'verified - treatment - invalid code': function () {
      const experimentParams = {query: {forceExperiment: 'tokenCode', forceExperimentGroup: 'treatment'}};
      return this.remote
        .then(openFxaFromRp('signin', experimentParams))
        .then(fillOutSignIn(email, PASSWORD))

        // Displays invalid code errors
        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, 'INVALID'))
        .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))

        .then(visibleByQSA(selectors.SIGNUP.ERROR))
        .then(testElementTextInclude(selectors.SIGNUP.ERROR, 'invalid'));
    }
  }
});

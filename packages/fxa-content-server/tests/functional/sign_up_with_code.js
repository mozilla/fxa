/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const PASSWORD = 'passwordzxcv';
let email;

const {
  click,
  clearBrowserState,
  closeCurrentWindow,
  fillOutSignUp,
  fillOutSignUpCode,
  getSignupCode,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const experimentTreatmentParams = {
  query: {
    forceExperiment: 'signupCode',
    forceExperimentGroup: 'treatment',
  },
};

const experimentControlParams = {
  query: {
    forceExperiment: 'signupCode',
    forceExperimentGroup: 'control',
  },
};

const SIGNUP_URL = config.fxaContentRoot + 'signup';

function testAtConfirmScreen(email) {
  return function() {
    return this.parent
      .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
      .then(
        testElementTextInclude(selectors.CONFIRM_SIGNUP_CODE.EMAIL_FIELD, email)
      );
  };
}

registerSuite('signup with code', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState({ force: true }));
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    control: function() {
      return this.remote
        .then(
          openPage(SIGNUP_URL, selectors.SIGNUP.HEADER, experimentControlParams)
        )
        .then(visibleByQSA(selectors.SIGNUP.SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInNewTab(email, 0))

        .then(switchToWindow(1))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown())
        .then(closeCurrentWindow())

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown());
    },

    'treatment - valid code': function() {
      return this.remote
        .then(
          openPage(
            SIGNUP_URL,
            selectors.SIGNUP.HEADER,
            experimentTreatmentParams
          )
        )
        .then(visibleByQSA(selectors.SIGNUP.SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(fillOutSignUpCode(email, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown());
    },

    'treatment - valid code then click back': function() {
      return this.remote
        .then(
          openPage(
            SIGNUP_URL,
            selectors.SIGNUP.HEADER,
            experimentTreatmentParams
          )
        )
        .then(visibleByQSA(selectors.SIGNUP.SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(fillOutSignUpCode(email, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown())
        .goBack()
        .then(testAtConfirmScreen(email));
    },

    'treatment - invalid code': function() {
      return this.remote
        .then(
          openPage(
            SIGNUP_URL,
            selectors.SIGNUP.HEADER,
            experimentTreatmentParams
          )
        )
        .then(visibleByQSA(selectors.SIGNUP.SUGGEST_SYNC))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(getSignupCode(email, 0))
        .then(code => {
          code = code === '123123' ? '123124' : '123123';
          return this.remote.then(
            type(selectors.SIGNIN_TOKEN_CODE.INPUT, code)
          );
        })
        .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
        .then(
          testElementTextInclude(
            selectors.SIGNIN_TOKEN_CODE.TOOLTIP,
            'expired or invalid code'
          )
        );
    },
  },
});

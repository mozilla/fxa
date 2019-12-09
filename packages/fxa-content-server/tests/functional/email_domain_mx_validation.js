/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const EMAIL_FORM_TREATMENT_URL =
  intern._config.fxaContentRoot +
  '?action=email&forceExperiment=emailMxValidation&forceExperimentGroup=treatment';
const EMAIL_FORM_CONTROL_URL =
  intern._config.fxaContentRoot +
  '?action=email&forceExperiment=emailMxValidation&forceExperimentGroup=control';

const INVALID_EMAIL = 'nofxauser@asdfafexample.xyz.gd';

const {
  clearBrowserState,
  click,
  openPage,
  testElementTextInclude,
  type,
} = FunctionalHelpers;

registerSuite('email domain mx record validation', {
  beforeEach() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'no validation on a popular domain': function() {
      const email = 'coolfxauser@gmail.com';

      return this.remote
        .then(openPage(EMAIL_FORM_TREATMENT_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        );
    },

    'show validation error on invalid domain': function() {
      return this.remote
        .then(openPage(EMAIL_FORM_TREATMENT_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, INVALID_EMAIL))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, '.email.tooltip-below.invalid')
        )
        .then(
          testElementTextInclude(
            selectors.ENTER_EMAIL.TOOLTIP,
            'Mistyped email? asdfafexample.xyz.gd does not offer email.'
          )
        );
    },

    'show tooltip on domain with an A record': function() {
      const email = 'coolfxauser@mail.google.com';
      return this.remote
        .then(openPage(EMAIL_FORM_TREATMENT_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(
            selectors.ENTER_EMAIL.SUBMIT,
            selectors.ENTER_EMAIL.SUGGEST_EMAIL_DOMAIN_CORRECTION
          )
        )
        .then(
          testElementTextInclude(
            selectors.ENTER_EMAIL.SUGGEST_EMAIL_DOMAIN_CORRECTION,
            'Mistyped email?'
          )
        )
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        );
    },

    'allow submission on domain with an MX record': function() {
      const email = 'testfxauser@mozilla.com';
      return this.remote
        .then(openPage(EMAIL_FORM_TREATMENT_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        );
    },

    'user in control group of experiement proceeds to sign up password page': function() {
      return this.remote
        .then(openPage(EMAIL_FORM_CONTROL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, INVALID_EMAIL))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        );
    },
  },
});

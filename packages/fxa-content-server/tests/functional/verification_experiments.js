/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, FunctionalHelpers) {
  var EXP_MAILCHECK_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=mailcheck&automatedBrowser=true';
  var EXP_SHOWPASSWORD_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=showPassword';
  var EXP_CONTROL = '&forceExperimentGroup=control';
  var EXP_TREATMENT = '&forceExperimentGroup=treatment';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = thenify(FunctionalHelpers.openPage);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var type = FunctionalHelpers.type;

  registerSuite({
    name: 'verification_experiments - mailcheck',

    beforeEach: function () {
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'treatment works': function () {
      var BAD_EMAIL = 'something@gnail.com';
      var CORRECTED_EMAIL = 'something@gmail.com';

      return this.remote
        .then(openPage(this, EXP_MAILCHECK_URL + EXP_TREATMENT, '#fxa-signup-header'))
        .then(type('.email', BAD_EMAIL))
        .then(click('.password'))
        .then(click('.tooltip-suggest > span:nth-child(1)'))

        .then(testElementValueEquals('input[type=email]', CORRECTED_EMAIL));
    },

    'control works': function () {
      var BAD_EMAIL = 'something@gnail.com';

      return this.remote
        .then(openPage(this, EXP_MAILCHECK_URL + EXP_CONTROL, '#fxa-signup-header'))

        .then(type('.email', BAD_EMAIL))
        .then(click('.password'))
        .then(FunctionalHelpers.noSuchElement(this, '.tooltip-suggest'));
    }
  });

  registerSuite({
    name: 'verification_experiments - showPassword',

    beforeEach: function () {
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'treatment works': function () {
      return this.remote
        .then(openPage(this, EXP_SHOWPASSWORD_URL + EXP_TREATMENT, '#fxa-signup-header'))
        .then(type('#password', 'p'))
        .then(noSuchElement(this, '.show-password-label'))
        .then(click('.sign-in'))
        .then(testElementExists('#fxa-signin-header'))
        .then(type('#password', 'p'))
        .then(noSuchElement(this, '.show-password-label'));
    },

    'control works': function () {
      return this.remote
        .then(openPage(this, EXP_SHOWPASSWORD_URL + EXP_CONTROL, '#fxa-signup-header'))
        .then(type('.password', 'asdf'))
        .then(testElementExists('.show-password-label'))
        .then(click('.sign-in'))
        .then(testElementExists('#fxa-signin-header'))
        // because of form prefill, label should already be there.
        .then(testElementExists('.show-password-label'));
    }
  });
});

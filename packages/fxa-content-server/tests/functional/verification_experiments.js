/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, FunctionalHelpers) {
  var EXP_MAILCHECK_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=mailcheck&automatedBrowser=true';
  var EXP_SHOWPASSWORD_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=showPassword';
  var EXP_CONTROL = '&forceExperimentGroup=control';
  var EXP_TREATMENT = '&forceExperimentGroup=treatment';

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var testElementExists = FunctionalHelpers.testElementExists;

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
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_MAILCHECK_URL + EXP_TREATMENT))

        .findByCssSelector('.email')
          .type(BAD_EMAIL)
          .click()
        .end()

        .then(click('.password'))
        .then(click('.tooltip-suggest > span:nth-child(1)'))

        .findByCssSelector('input[type=email]')
        .getProperty('value')
        .then(function (resultText) {
          // check the email address was re-populated
          assert.equal(resultText, CORRECTED_EMAIL);
        })
        .end();
    },

    'control works': function () {
      var self = this;
      var BAD_EMAIL = 'something@gnail.com';

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_MAILCHECK_URL + EXP_CONTROL))

        .findByCssSelector('.email')
          .type(BAD_EMAIL)
          .click()
        .end()

        .then(click('.password'))
        .then(FunctionalHelpers.noSuchElement(self, '.tooltip-suggest'))
        .end();
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
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_SHOWPASSWORD_URL + EXP_TREATMENT))
        .then(FunctionalHelpers.pollUntil(function () {
          /* global $ */
          return $('.show-password-label').is(':hidden') === true ? true : null;
        }, [], 10000))

        .then(click('.sign-in'))
        .then(testElementExists('#fxa-signin-header'))

        .then(FunctionalHelpers.pollUntil(function () {
          return $('.show-password-label').is(':hidden') === true ? true : null;
        }, [], 10000));

    },

    'control works': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_SHOWPASSWORD_URL + EXP_CONTROL))
        .then(FunctionalHelpers.pollUntil(function () {
          return $('.show-password-label').is(':hidden') === false ? true : null;
        }, [], 10000))

        .then(click('.sign-in'))
        .then(testElementExists('#fxa-signin-header'))

        .then(FunctionalHelpers.pollUntil(function () {
          return $('.show-password-label').is(':hidden') === false ? true : null;
        }, [], 10000));
    }
  });
});

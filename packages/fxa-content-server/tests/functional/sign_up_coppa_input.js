/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, TestHelpers, FunctionalHelpers) {
  /* global $ */

  var PAGE_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=coppaView&forceExperimentGroup=treatment';
  var CUTOFF_AGE = 13;
  var email;
  var PASSWORD = '12345678';

  registerSuite({
    name: 'sign_up input_coppa',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign up with COPPA input properly submits if age is valid': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(PAGE_URL))

        .findByCssSelector('.email')
          .type(email)
        .end()

        .findByCssSelector('.password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#submit-btn')
          .click()
        .end()

        // error tooltip works
        .then(FunctionalHelpers.visibleByQSA('#coppa .tooltip'))
        .findByCssSelector('#coppa .tooltip')
          .getVisibleText()
          .then(function (val) {
            assert.ok(val, 'has error text');
          })
        .end()

        // input field limits to 3 characters and ignores letters
        .findByCssSelector('#age')
          .type('hello233233')
        .end()

        .then(FunctionalHelpers.pollUntil(function () { return $('#age').val() === '233'; }))

        .findByCssSelector('#age')
          .clearValue()
          .type(CUTOFF_AGE.toString())
        .end()

        // label helpers works
        .then(FunctionalHelpers.visibleByQSA('#coppa .label-helper'))
        .findByCssSelector('#coppa .label-helper')
          .getVisibleText()
          .then(function (val) {
            assert.ok(val, 'has label helper text');
          })
        .end()

        // form prefill works
        .findByCssSelector('.sign-in')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('.sign-up')
          .click()
        .end()

        .findByCssSelector('#fxa-signup-header')
        .end()

        // form submission works
        .findByCssSelector('#submit-btn')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'sign up with COPPA input blocks if age is not valid': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(PAGE_URL))

        .findByCssSelector('.email')
          .type(email)
        .end()

        .findByCssSelector('.password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#age')
          .type((CUTOFF_AGE - 1).toString())
        .end()

        .findByCssSelector('#submit-btn')
          .click()
        .end()

        .findByCssSelector('#fxa-cannot-create-account-header')
        .end();
    }
  });
});

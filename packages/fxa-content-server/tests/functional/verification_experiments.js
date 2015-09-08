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
  var EXP_OPEN_GMAIL_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=openGmail';
  var EXP_COPPA_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=coppaView';
  var EXP_MAILCHECK_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=mailcheck&automatedBrowser=true';
  var EXP_SYNCCHECKBOX_URL = intern.config.fxaContentRoot + 'signup?forceExperiment=syncCheckbox&context=fx_desktop_v1&service=sync';
  var EXP_CONTROL = '&forceExperimentGroup=control';
  var EXP_TREATMENT = '&forceExperimentGroup=treatment';

  var email;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;
  var PASSWORD = '12345678';

  registerSuite({
    name: 'verification_experiments - open gmail',

    beforeEach: function () {
      email = 'signin' + Math.random() + '@gmail.com';
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'treatment works': function () {
      var self = this;

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_OPEN_GMAIL_URL + EXP_TREATMENT))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#open-gmail')
          .click()
        .end()

        .getAllWindowHandles()
        .then(function (handles) {
          return self.remote.switchToWindow(handles[1]);
        })

        .findByCssSelector('.google-header-bar')
        .end()

        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'control works': function () {
      var self = this;

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_OPEN_GMAIL_URL + EXP_CONTROL))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#resend')
          .click()
        .end()

        .then(FunctionalHelpers.noSuchElement(self, '#open-gmail'))
        .end();

    }
  });

  registerSuite({
    name: 'verification_experiments - coppa',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'treatment works': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_COPPA_URL + EXP_TREATMENT))

        .findByCssSelector('.email')
          .type(email)
        .end()

        .findByCssSelector('.password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#age')
          // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type '2'
          .type('2')
          .type('4')
        .end()

        .findByCssSelector('#submit-btn')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'control works': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_COPPA_URL + EXP_CONTROL))

        .findByCssSelector('.email')
          .type(email)
        .end()

        .findByCssSelector('.password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-1991')
        .end();
    }
  });

  registerSuite({
    name: 'verification_experiments - mailcheck',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
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

        .findByCssSelector('.password')
          .click()
        .end()

        .findByCssSelector('.tooltip-suggest > span:nth-child(1)')
          .click()
        .end()

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

        .findByCssSelector('.password')
          .click()
        .end()

        .then(FunctionalHelpers.noSuchElement(self, '.tooltip-suggest'))
        .end();
    }
  });

  registerSuite({
    name: 'verification_experiments - syncCheckbox',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'treatment works': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_SYNCCHECKBOX_URL + EXP_TREATMENT))

        .findByCssSelector('#customize-sync.customize-sync-top')
        .end();
    },

    'control works': function () {
      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(EXP_SYNCCHECKBOX_URL + EXP_CONTROL))

        .findByCssSelector('#customize-sync.customize-sync-bottom')
        .end();
    }
  });
});

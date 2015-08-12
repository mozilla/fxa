/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/lib/basket',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, assert, require, TestHelpers, waitForBasket, FunctionalHelpers, Test) {
  var PAGE_URL = intern.config.fxaContentRoot + 'signup';
  var CUTOFF_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = CUTOFF_YEAR - 1;
  var fxaProduction = intern.config.fxaProduction;

  var email;
  var PASSWORD = '12345678';

  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;

  function testOptedIn(context) {
    return function () {
      return context.remote
        .findByCssSelector('#marketing-email-optin')
          .getVisibleText()
          .then(function (buttonText) {
            assert.equal(buttonText, 'Unsubscribe');
          })
        .end();
    };
  }

  function testNotOptedIn(context) {
    return function () {
      return context.remote
        .findByCssSelector('#marketing-email-optin')
          .getVisibleText()
          .then(function (buttonText) {
            assert.equal(buttonText, 'Subscribe');
          })
        .end();
    };
  }

  var suiteName = 'communication preferences';
  if (fxaProduction) {
    // The actual tests below depend on polling a real or mock implementation
    // of Basket. This isn't something feasible when running this server
    // against a remote server (api keys unavailable, or server only listening
    // to its localhost interface). So, we skip these tests by registering an
    // empty test suite.
    registerSuite({
      name: suiteName
    });
    return;
  }

  // okay, not remote so run these for real.
  registerSuite({
    name: suiteName,

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'opt in to the marketing email': function () {
      var self = this;
      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR, false, true);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(waitForBasket(email))

        .findByCssSelector('#communication-preferences .settings-unit-toggle')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testOptedIn(self));
    },

    'opt-in with a plus sign in the email address': function () {
      var self = this;
      email = TestHelpers.createEmail('signup{id}+extra');
      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR, false, true);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .then(waitForBasket(email))

        .findByCssSelector('#communication-preferences .settings-unit-toggle')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testOptedIn(self))

        // user signed up to basket, so has a preferences URL
        .findByCssSelector('#preferences-url')
        .end()

        // ensure the changes stick across refreshes
        .refresh()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testOptedIn(self))

        .findByCssSelector('#marketing-email-optin')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        // ensure the opt-out sticks across refreshes
        .refresh()

        .findByCssSelector('#communication-preferences .settings-unit-toggle')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testNotOptedIn(self));
    },

    'do not opt in to the marketing email': function () {
      var self = this;
      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .then(function () {
          return fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR, false, false);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .findByCssSelector('#communication-preferences .settings-unit-toggle')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testNotOptedIn(self))

        // user does not have a basket account, so the
        // manage link does not exist.

        .then(Test.noElementByCssSelector(self, '#preferences-url'))

        .findByCssSelector('#marketing-email-optin')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .then(function () {
          return waitForBasket(email);
        })

        // ensure the opt-in sticks across refreshes
        .refresh()

        .findByCssSelector('#communication-preferences .settings-unit-toggle')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testOptedIn(self))

        // user should not have a preferences URL
        .findByCssSelector('#preferences-url')
        .end();
    }
  });

});

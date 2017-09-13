/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/lib/basket',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, _waitForBasket, FunctionalHelpers) {
  var SIGNIN_PAGE_URL = intern.config.fxaContentRoot + 'signin';
  var SIGNUP_PAGE_URL = intern.config.fxaContentRoot + 'signup';
  var fxaProduction = intern.config.fxaProduction;

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testAttributeEquals = FunctionalHelpers.testAttributeEquals;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;
  var waitForBasket = _waitForBasket;

  var testOptedIn = thenify(function () {
    return this.parent
      .then(testElementTextEquals('#marketing-email-optin', 'Unsubscribe'));
  });

  var testNotOptedIn = thenify(function () {
    return this.parent
      .then(testElementTextEquals('#marketing-email-optin', 'Subscribe'));
  });

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
      return this.remote
        .then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'opt-in on signup': function () {
      // The plus sign is to ensure the email address is URI-encoded when
      // passed to basket. See a43061d3
      email = TestHelpers.createEmail('signup{id}+extra');
      return this.remote
        .then(openPage(SIGNUP_PAGE_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD, { optInToMarketingEmail: true }))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(waitForBasket(email))
        .then(click('#communication-preferences .settings-unit-toggle'))
        .then(visibleByQSA('#communication-preferences .settings-unit-details'))
        .then(testOptedIn())

        // user signed up to basket, so has a preferences URL
        .then(testElementExists('#preferences-url'))

        // ensure the changes stick across refreshes
        .refresh()

        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(visibleByQSA('#communication-preferences .settings-unit-details'))
        .then(testOptedIn())

        // preference url would open in a new tab
        .then(testAttributeEquals('#preferences-url', 'target', '_blank'))

        .then(click('#marketing-email-optin'))
        .then(testSuccessWasShown())

        // ensure the opt-out sticks across refreshes
        .refresh()

        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(click('#communication-preferences .settings-unit-toggle'))
        .then(visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testNotOptedIn());
    },

    'do not opt-in on signup': function () {
      return this.remote
        .then(openPage(SIGNUP_PAGE_URL, '#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD, { optInToMarketingEmail: false }))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInSameTab(email, 0))

        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(click('#communication-preferences .settings-unit-toggle'))

        .then(visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testNotOptedIn());
    },

    'opt in from settings after sign-in': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(SIGNIN_PAGE_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(click('#communication-preferences .settings-unit-toggle'))

        .then(visibleByQSA('#communication-preferences .settings-unit-details'))

        .then(testNotOptedIn())

        // user does not have a basket account, so the
        // manage link does not exist.

        .then(noSuchElement('#preferences-url'))
        .then(click('#marketing-email-optin'))
        .then(testSuccessWasShown())
        .then(waitForBasket(email))

        // ensure the opt-in sticks across refreshes
        .refresh()
        .then(testElementExists('#communication-preferences.basket-ready'))
        .then(click('#communication-preferences .settings-unit-toggle'))
        .then(visibleByQSA('#communication-preferences .settings-unit-details'))
        .then(testOptedIn())
        // user should now have a preferences URL
        .then(testElementExists('#preferences-url'));
    }
  });

});

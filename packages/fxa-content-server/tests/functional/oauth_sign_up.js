/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var user;
  var email;
  var bouncedEmail;
  var fxaClient;

  registerSuite({
    name: 'oauth sign up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      bouncedEmail = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      fxaClient = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },

    'signup, verify same browser': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/123done/i.test(text));
        })
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(fxaClient, email);
        })

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening link in a new browser
          return FunctionalHelpers.clearBrowserState(self, {
            contentServer: true,
            '123done': true
          });
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the rp,
          // but cannot redirect
          assert.isTrue(/123done/i.test(text));
        })
        .end();
    },

    'sign up, bounce email, allow user to restart flow but force a different email': function () {
      var self = this;
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('form input.email')
          .click()
          .type(bouncedEmail)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return client.accountDestroy(bouncedEmail, PASSWORD);
        })

        .findById('fxa-signup-header')
        .end()

        // expect an error message to already be present on redirect
        .then(FunctionalHelpers.visibleByQSA('.tooltip'))

        // submit button should be disabled.
        .findByCssSelector('button[type="submit"].disabled')
        .end()

        .findByCssSelector('input[type="email"]')
          .clearValue()
          .click()
          .type(email)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/123done/i.test(text));
        })
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    }
  });

});

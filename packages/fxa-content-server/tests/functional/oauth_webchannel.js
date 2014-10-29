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
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var user;
  var email;
  var client;
  var ANIMATION_DELAY_MS = 1000;
  /* global window, addEventListener */

  /**
   * This suite tests the WebChannel functionality in the OAuth signin and
   * signup cases. It uses a CustomEvent "WebChannelMessageToChrome" to
   * finish OAuth flows
   */

  function redirectToRpOnWebChannelMessage(OAUTH_APP) {
    // this event will fire once the account is confirmed, helping it
    // redirect to the application. If the window redirect does not
    // happen then the sign in page will hang on the confirmation screen
    addEventListener('WebChannelMessageToChrome', function (e) {
      if (e.detail.message.command === 'oauth_complete') {
        window.location.href = OAUTH_APP + 'api/oauth?' +
          'state=' + e.detail.message.data.state + '&code=' + e.detail.message.data.code;
      }
    });

    return true;
  }

  function openFxaFromRp(context, page) {
    return FunctionalHelpers.openFxaFromRp(context, page, '&webChannelId=test');
  }


  registerSuite({
    name: 'oauth web channel',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },

    'signin an unverified account using an oauth app': function () {
      var self = this;

      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .findByCssSelector('form input.email')
          .clearValue()
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // wah wah, user has to verify.
        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'signin a verified account using an oauth app': function () {
      var self = this;

      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
          .clearValue()
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // user should be redirected back to 123done

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify same browser': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
          .clearValue()
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

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
          .clearValue()
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
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signup')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
          .clearValue()
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
          // clear browser state to simulate opening the link
          // in the same browser
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        // new browser dead ends at the 'account verified' screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end();
    },

    'password reset, verify same browser': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .findByCssSelector('input[type=email]')
          .type(email)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        // Complete the password reset in the new tab
        .switchToWindow('newwindow')

        .findById('fxa-complete-reset-password-header')
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#vpassword')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .sleep(ANIMATION_DELAY_MS)

        .findByCssSelector('.error').isDisplayed()
        .then(function (isDisplayed) {
          assert.isFalse(isDisplayed);
        })
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        // the original tab should automatically sign in
        .findByCssSelector('#loggedin')
        .end();
    },

    'password reset, verify in different browser, from the original tab\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .findByCssSelector('input[type=email]')
          .type(email)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
              client, email, PASSWORD);
        })

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // user is redirected to RP
        .findByCssSelector('#loggedin')
        .end();
    },

    'password reset, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return openFxaFromRp(self, 'signin')
        .execute(redirectToRpOnWebChannelMessage, [ OAUTH_APP ])

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .findByCssSelector('input[type=email]')
          .type(email)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          // clear browser state to simulate opening the link
          // in the same browser
          return FunctionalHelpers.clearBrowserState(self);
        })

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        .findById('fxa-complete-reset-password-header')
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('#vpassword')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    }
  });

});

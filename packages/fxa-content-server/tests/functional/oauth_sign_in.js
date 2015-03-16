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
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_ROOT = config.fxaContentRoot + 'oauth/signin';

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;
  var user;
  var email;

  var client;

  function initiateLockedAccountSignIn(context) {
    return FunctionalHelpers.openFxaFromRp(context, 'signin')
      .then(function () {
        return client.signUp(email, PASSWORD, { preVerified: true });
      })
      .then(function () {
        return client.accountLock(email, PASSWORD);
      })

      .findByCssSelector('#fxa-signin-header')
      .end()

      .then(function () {
        return FunctionalHelpers.fillOutSignIn(context, email, PASSWORD);
      })

      .then(FunctionalHelpers.visibleByQSA('.error'))
      .end()

      .findByCssSelector('a[href="/confirm_account_unlock"]')
        .click()
      .end()

      .findByCssSelector('#fxa-confirm-account-unlock-header')
      .end();
  }

  registerSuite({
    name: 'oauth sign in',

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

    'with missing client_id': function () {
      return this.get('remote').get(require.toUrl(SIGNIN_ROOT + '?scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with missing scope': function () {
      return this.get('remote').get(require.toUrl(SIGNIN_ROOT + '?client_id=client_id'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with invalid client_id': function () {
      return this.get('remote').get(require.toUrl(SIGNIN_ROOT + '?client_id=invalid_client_id&scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'verified': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    },

    'verified using a cached login': function () {
      var self = this;
      // verify account
      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        // sign in with a verified account to cache credentials
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end()

        // let items load
        .findByCssSelector('#logout')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#splash .signin'))
        .end()

        // round 2 - with the cached credentials
        .findByCssSelector('#splash .signin')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    },

    'unverified, acts like signup': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          return FunctionalHelpers.getVerificationLink(user, 1);
        })
        .then(function (verifyUrl) {
          return self.get('remote')
            // user verifies in the same tab, so they are logged in to the RP.
            .get(require.toUrl(verifyUrl))

            .findByCssSelector('#loggedin')
            .end();
        });

    },

    'unverified with a cached login': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header')
        .end()

        // first, sign the user up to cache the login
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR );
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // round 2 - try to sign in with the unverified user.
        .then(function () {
          return FunctionalHelpers.openFxaFromRp(self, 'signin');
        })

        .findByCssSelector('#fxa-signin-header .service')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // success is using a cached login and being redirected
        // to a confirmation screen
        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'locked account, verify same browser': function () {
      var self = this;
      return initiateLockedAccountSignIn(self)
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-account-unlock-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/123done/i.test(text));
        })
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'locked account, verify same browser with original tab closed': function () {
      var self = this;
      return initiateLockedAccountSignIn(self)
        // user browses to another site.
        .switchToFrame(null)

        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('');
    },

    'locked account, verify same browser by replacing original tab': function () {
      var self = this;
      return initiateLockedAccountSignIn(self)
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.get('remote').get(require.toUrl(verificationLink));
        })

        .findByCssSelector('#fxa-account-unlock-complete-header')
        // TODO -- replace the above line with the below line when we figure
        // out how to pull that off.
        //.findByCssSelector('#loggedin')
        .end();
    },

    'locked account, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountSignIn(self)
        .then(function () {
          return FunctionalHelpers.openUnlockLinkDifferentBrowser(client, email, 'x-unlock-code');
        })

        // original tab redirects back to 123done
        .findByCssSelector('#loggedin')
        .end();
    },

    'locked account, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;
      return initiateLockedAccountSignIn(self)
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
        .findByCssSelector('#fxa-account-unlock-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the rp,
          // but cannot redirect
          assert.isTrue(/123done/i.test(text));
        })
        .end();
    }
  });

});

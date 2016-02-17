/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var OAUTH_APP = config.fxaUntrustedOauthApp;
  var PASSWORD = 'password';

  var email;
  var user;

  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var getVerificationLink = thenify(FunctionalHelpers.getVerificationLink);
  var openFxaFromUntrustedRp = FunctionalHelpers.openFxaFromUntrustedRp;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var testUrlEquals = FunctionalHelpers.testUrlEquals;
  var type = FunctionalHelpers.type;

  registerSuite({
    name: 'oauth permissions',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return FunctionalHelpers.clearBrowserState(this, {
        '321done': true,
        contentServer: true
      });
    },

    'signin verified': function () {
      var self = this;

      return openFxaFromUntrustedRp(self, 'signin')
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(self, email, PASSWORD))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#loggedin')

        .then(testUrlEquals(OAUTH_APP));
    },

    're-signin verified': function () {
      var self = this;

      return openFxaFromUntrustedRp(self, 'signin')
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(self, email, PASSWORD))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#loggedin')
        .end()

        .then(testUrlEquals(OAUTH_APP))

        .then(click('#logout'))
        .then(click('.signin'))

        // user signed in previously and should not need to enter
        // their email address.
        .then(type('input[type=password]', PASSWORD))

        .then(click('button[type=submit]'))

        .findByCssSelector('#loggedin')

        // redirected back to the App without seeing the permissions screen.
        .then(testUrlEquals(OAUTH_APP));
    },

    'signin unverified, acts like signup': function () {
      var self = this;

      return openFxaFromUntrustedRp(self, 'signin')
        .then(createUser(email, PASSWORD, { preVerified: false }))

        .then(fillOutSignIn(self, email, PASSWORD))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // get the second email, the first was sent on client.signUp w/
        // preVerified: false above. The second email has the `service` and
        // `resume` parameters.
        .then(getVerificationLink(user, 1))

        .then(function (verifyUrl) {
          // user verifies in the same tab, so they are logged in to the RP.
          return openPage(self, verifyUrl, '#loggedin');
        });
    },


    'signup, verify same browser': function () {
      var self = this;
      return openFxaFromUntrustedRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInNewTab(self, email, 0))

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .sleep(5000)
        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/321done Untrusted/i.test(text));
        })
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'preverified signup': function () {
      var self = this;
      var SIGNUP_URL = OAUTH_APP + 'api/preverified-signup?' +
                        'email=' + encodeURIComponent(email);

      return openPage(self, SIGNUP_URL, '#fxa-signup-header')

        .then(type('input[type=password]', PASSWORD))
        .then(type('#age', 24))
        .then(click('button[type="submit"]'))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        // user is redirected to 123done, wait for the footer first,
        // and then for the loggedin user to be visible. If we go
        // straight for the loggedin user, visibleByQSA blows up
        // because 123done isn't loaded yet and it complains about
        // the unload event of the content server.
        .findByCssSelector('#footer-main')
        .end()

        // user is pre-verified and sent directly to the RP.
        .then(FunctionalHelpers.visibleByQSA('#loggedin'))
        .end()

        .findByCssSelector('#loggedin')
        .getVisibleText()
        .then(function (text) {
          // user is signed in as pre-verified email
          assert.equal(text, email);
        })
        .end();
    },

    'signup, then signin': function () {
      var self = this;
      return openFxaFromUntrustedRp(self, 'signup')
        .then(fillOutSignUp(self, email, PASSWORD))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(openVerificationLinkInNewTab(self, email, 0))

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .sleep(5000)
        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/321done Untrusted/i.test(text));
        })
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end()

        .then(click('#logout'))

        .then(click('.signin'))

        // user signed in previously and should not need to enter
        // their email address.
        .then(type('input[type=password]', PASSWORD))

        .then(click('button[type=submit]'))

        .findByCssSelector('#loggedin')
        .end()

        .then(testUrlEquals(OAUTH_APP));
    },

    'signin from signup page': function () {
      var self = this;

      return openFxaFromUntrustedRp(self, 'signup')
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(type('input[type=email]', email))
        .then(type('input[type=password]', PASSWORD))
        // age not filled in, submit works anyways.
        .then(click('button[type=submit]'))

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .then(click('#accept'))

        .findByCssSelector('#loggedin')
        .end()

        .then(testUrlEquals(OAUTH_APP));
    },
  });

});

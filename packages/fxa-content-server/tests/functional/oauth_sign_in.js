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
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var SIGNIN_ROOT = config.fxaContentRoot + 'oauth/signin';

  var PASSWORD = 'password';
  var user;
  var email;

  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  var openPage = FunctionalHelpers.openPage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testUrlPathnameEquals = FunctionalHelpers.testUrlPathnameEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var testAtOAuthApp = thenify(function () {
    return this.parent
      .findByCssSelector('#loggedin')
      .end()

      .getCurrentUrl()
      .then(function (url) {
        // redirected back to the App
        assert.ok(url.indexOf(OAUTH_APP) > -1);
      });
  });

  registerSuite({
    name: 'oauth sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return this.remote
        .then(FunctionalHelpers.clearBrowserState({
          '123done': true,
          contentServer: true
        }));
    },

    'with missing client_id': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?scope=profile', '#fxa-400-header'));
    },

    'with missing scope': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?client_id=client_id', '#fxa-400-header'));
    },

    'with invalid client_id': function () {
      return this.remote
        .then(openPage(SIGNIN_ROOT + '?client_id=invalid_client_id&scope=profile', '#fxa-400-header'));
    },

    'verified': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp());
    },

    'verified using a cached login': function () {
      // verify account
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        // sign in with a verified account to cache credentials
        .then(fillOutSignIn(email, PASSWORD))

        .then(testAtOAuthApp())
        .then(click('#logout'))

        .then(visibleByQSA('.ready #splash .signin'))
        // round 2 - with the cached credentials
        .then(click('.ready #splash .signin'))

        .then(testElementExists('#fxa-signin-header'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type="submit"]'))

        .then(testAtOAuthApp());
    },

    'unverified, acts like signup': function () {
      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: false }))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        .then(function () {
          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          return FunctionalHelpers.getVerificationLink(user, 1);
        })
        .then(function (verifyUrl) {
          return this.parent
            // user verifies in the same tab, so they are logged in to the RP.
            .then(openPage(verifyUrl, '#loggedin'));
        });

    },

    'unverified with a cached login': function () {
      return this.remote
        .then(openFxaFromRp('signup'))
        .then(testElementExists('#fxa-signup-header'))

        // first, sign the user up to cache the login
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // round 2 - try to sign in with the unverified user.
        .then(openFxaFromRp('signin'))

        .then(testElementExists('#fxa-signin-header .service'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type="submit"]'))

        // success is using a cached login and being redirected
        // to a confirmation screen
        .then(testElementExists('#fxa-confirm-header'));
    },

    'oauth endpoint chooses the right auth flows': function () {
      return this.remote
        .then(openPage(OAUTH_APP, '.ready #splash'))

        // use the 'Choose my sign-in flow for me' button
        .then(click('.ready #splash .sign-choose'))

        .then(testElementExists('#fxa-signup-header'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))

        // go back to the OAuth app, the /oauth flow should
        // now suggest a cached login
        .get(require.toUrl(OAUTH_APP))
        // again, use the 'Choose my sign-in flow for me' button
        .then(click('.ready #splash .sign-choose'))

        .then(testElementExists('#fxa-signin-header'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 0))

        .then(testAtOAuthApp());
    },

    'verified, blocked, incorrect password': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(openFxaFromRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(fillOutSignIn(email, 'bad' + PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 0))

        // wait until at the signin page to check the URL to
        // avoid latency problems with submitting the unblock code.
        // w/o the wait, the URL can be checked before
        // the submit completes.
        .then(testElementExists('#fxa-signin-header'))
        .then(testUrlPathnameEquals('/oauth/signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(fillOutSignInUnblock(email, 1))

        .then(testAtOAuthApp());
    }
  });

});

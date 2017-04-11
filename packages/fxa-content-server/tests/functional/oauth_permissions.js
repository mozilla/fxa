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

  var TIMEOUT = 90 * 1000;

  var TRUSTED_OAUTH_APP = config.fxaOauthApp;
  var UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;
  var PASSWORD = 'password';

  var email;

  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var openFxaFromTrustedRp = FunctionalHelpers.openFxaFromRp;
  var openFxaFromUntrustedRp = FunctionalHelpers.openFxaFromUntrustedRp;
  var openSettingsInNewTab = FunctionalHelpers.openSettingsInNewTab;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var openVerificationLinkInSameTab = FunctionalHelpers.openVerificationLinkInSameTab;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testUrlEquals = FunctionalHelpers.testUrlEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'oauth permissions for untrusted reliers',

    beforeEach: function () {
      this.timeout = TIMEOUT;
      email = TestHelpers.createEmail();

      return this.remote
        .then(FunctionalHelpers.clearBrowserState({
          '321done': true,
          contentServer: true
        }));
    },

    'signin verified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromUntrustedRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP));
    },

    're-signin verified, no additional permissions': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromUntrustedRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

        .then(click('#logout'))
        .then(click('.signin'))

        // user signed in previously and should not need to enter
        // their email address.
        .then(testElementExists('#fxa-signin-header'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type=submit]'))

        // no permissions additional asked for
        .then(testElementExists('#loggedin'))
        // redirected back to the App without seeing the permissions screen.
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP));
    },

    'signin unverified, acts like signup': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openFxaFromUntrustedRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#fxa-confirm-header'))

        // get the second email, the first was sent on client.signUp w/
        // preVerified: false above. The second email has the `service` and
        // `resume` parameters.
        .then(openVerificationLinkInSameTab(email, 1))
        // user verifies in the same tab, so they are logged in to the RP.
        .then(testElementExists('#loggedin'));
    },

    'signup, verify same browser': function () {
      return this.remote
        .then(openFxaFromUntrustedRp('signup'))
        .then(testElementExists('#fxa-signup-header .service'))
        .getCurrentUrl()
          .then(function (url) {
            assert.ok(url.indexOf('client_id=') > -1);
            assert.ok(url.indexOf('redirect_uri=') > -1);
            assert.ok(url.indexOf('state=') > -1);
          })
        .end()

        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#fxa-confirm-header'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .then(testElementExists('#fxa-sign-up-complete-header'))
        .sleep(5000)

        // user sees the name of the RP,
        // but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '321done Untrusted'))

        // switch to the original window
        .then(closeCurrentWindow())

        .then(testElementExists('#loggedin'));
    },

    'signup, then signin with no additional permissions': function () {
      return this.remote
        .then(openFxaFromUntrustedRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#fxa-confirm-header'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .then(testElementExists('#fxa-sign-up-complete-header'))

        .sleep(5000)
        // user sees the name of the RP,
        // but cannot redirect
        .then(testElementTextInclude('.account-ready-service', '321done Untrusted'))

        // switch to the original window
        .then(closeCurrentWindow())

        .then(testElementExists('#loggedin'))
        .then(click('#logout'))
        .then(click('.signin'))

        // user signed in previously and should not need to enter
        // their email address.
        .then(testElementExists('#fxa-signin-header'))
        .then(type('input[type=password]', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP));
    },

    'signin from signup page': function () {
      return this.remote
        .then(openFxaFromUntrustedRp('signup'))
        .then(createUser(email, PASSWORD, { preVerified: true }))

        .then(type('input[type=email]', email))
        .then(type('input[type=password]', PASSWORD))
        // age not filled in, submit works anyways.
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP));
    },

    'signin with new permission available b/c of new account information': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromUntrustedRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-permissions-header'))
        // display name is not available because user has not set their name
        .then(noSuchElement('input[name="profile:display_name"]'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

        .then(click('#logout'))

        .then(openSettingsInNewTab('settings', 'display_name'))
        .switchToWindow('settings')

        .then(type('#display-name input[type=text]', 'test user'))
        .then(click('#display-name button[type=submit]'))
        .then(visibleByQSA('.settings-success'))

        .then(closeCurrentWindow())

        .then(click('.signin'))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        // display name is now available
        .then(testElementExists('input[name="profile:display_name"]'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'));
    },

    'signin with additional requested permission': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))

        // make display_name available from the start
        .then(click('#display-name button.settings-unit-toggle'))
        .then(type('#display-name input[type=text]', 'test user'))
        .then(click('#display-name button[type=submit]'))
        .then(visibleByQSA('.settings-success'))

        // the first time through, only request email and uid
        .then(openFxaFromUntrustedRp('signin', { query: {
          scope: 'profile:email profile:uid'
        }}))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testElementExists('#fxa-permissions-header'))
        // display name is not available because it's not requested
        .then(noSuchElement('input[name="profile:display_name"]'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

        .then(click('#logout'))
        .then(click('.signin'))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        // the second time through, profile:email, profile:uid, and
        // profile:display_name will be asked for, so display_name is
        // available
        .then(testElementExists('input[name="profile:display_name"]'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'));
    },

    'signin after de-selecting a requested permission': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))

        // make display_name available from the start
        .then(click('#display-name button.settings-unit-toggle'))
        .then(type('#display-name input[type=text]', 'test user'))
        .then(click('#display-name button[type=submit]'))
        .then(visibleByQSA('.settings-success'))

        .then(openFxaFromUntrustedRp('signin'))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testElementExists('input[name="profile:display_name"]'))
        // deselect display name to ensure permission state is
        // saved correctly.
        .then(click('input[name="profile:display_name"]'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'))
        .then(click('#logout'))
        // signin again, no permissions should be asked for even though
        // display_name was de-selected last time.
        .then(click('.signin'))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        .then(testElementExists('#loggedin'));
    }
  });

  registerSuite({
    name: 'oauth permissions for trusted reliers',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(FunctionalHelpers.clearBrowserState({
          '123done': true,
          contentServer: true
        }));
    },

    'signup without `prompt=consent`': function () {
      return this.remote
        .then(openFxaFromTrustedRp('signup'))
        .then(fillOutSignUp(email, PASSWORD))

        // no permissions asked for, straight to confirm
        .then(testElementExists('#fxa-confirm-header'));
    },

    'signup with `prompt=consent`': function () {
      return this.remote
        .then(openFxaFromTrustedRp('signup', { query: { prompt: 'consent' }}))
        .then(fillOutSignUp(email, PASSWORD))

        // permissions are asked for with `prompt=consent`
        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#fxa-confirm-header'));
    },

    'signin without `prompt=consent`': function () {
      return this.remote
        .then(openFxaFromTrustedRp('signin'))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))

        // no permissions asked for, straight to relier
        .then(testElementExists('#loggedin'));
    },

    'signin with `prompt=consent`': function () {
      return this.remote
        .then(openFxaFromTrustedRp('signin', { query: { prompt: 'consent' }}))
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))

        // permissions are asked for with `prompt=consent`
        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'));
    },

    'signin without `prompt=consent`, then re-signin with `prompt=consent`': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromTrustedRp('signin'))
        .then(fillOutSignIn(email, PASSWORD))

        // no permissions asked for, straight to relier
        .then(testElementExists('#loggedin'))
        .then(testUrlEquals(TRUSTED_OAUTH_APP))
        .then(click('#logout'))
        // currently there is no way to tell when 123done fully logged out
        // give the logout request some time to complete
        .sleep(1000)
        .then(visibleByQSA('#splash .signup'))

        // relier changes to request consent
        .then(openFxaFromTrustedRp('signin', { query: { prompt: 'consent' }}))

        .then(type('input[type=password', PASSWORD))
        .then(click('button[type=submit]'))

        // since consent is now requested, user should see prompt
        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'));
    },


    'force_auth without `prompt=consent`': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromTrustedRp('force_auth', { query: { email: email }}))
        .then(fillOutForceAuth(PASSWORD))

        // no permissions asked for, straight to relier
        .then(testElementExists('#loggedin'));
    },

    'force_auth with `prompt=consent`': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromTrustedRp('force_auth', { query: {
          email: email,
          prompt: 'consent'
        }}))
        .then(fillOutForceAuth(PASSWORD))

        // permissions are asked for with `prompt=consent`
        .then(testElementExists('#fxa-permissions-header'))
        .then(click('#accept'))

        .then(testElementExists('#loggedin'));
    }
  });
});

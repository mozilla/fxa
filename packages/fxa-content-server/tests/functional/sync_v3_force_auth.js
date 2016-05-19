/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignUp = thenify(FunctionalHelpers.fillOutSignUp);
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementDisabled = FunctionalHelpers.testElementDisabled;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'Firefox Desktop Sync v3 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    'with a registered email, no uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              service: 'sync'
            }
          }).call(this);
        })
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        // about:accounts will take over, no transition
        .then(noPageTransition('#fxa-force-auth-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'with a registered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              service: 'sync',
              uid: accountInfo.uid
            }
          }).call(this);
        })
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        // about:accounts will take over, no transition
        .then(noPageTransition('#fxa-force-auth-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'with a registered email, unregistered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({
          query: {
            context: 'fx_desktop_v3',
            email: email,
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(noSuchBrowserNotification(this, 'fxaccounts:logout'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))
        // about:accounts will take over, no transition
        .then(noPageTransition('#fxa-force-auth-header'))
        // user is able to sign in, browser notified of new uid
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'with an unregistered email, no uid': function () {
      return this.remote
        .then(openForceAuth({
          // user should be automatically redirected to the
          // signup page where they can signup with the
          // specified email
          header: '#fxa-signup-header',
          query: {
            context: 'fx_desktop_v3',
            email: email,
            service: 'sync'
          }
        }))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))
        .then(fillOutSignUp(this, email, PASSWORD, { enterEmail: false }))

        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        // the default behavior of not transitioning to the confirm
        // screen is overridden because the user is signing up outside
        // of about:accounts.
        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'with an unregistered email, registered uid': function () {
      var unregisteredEmail = 'a' + email;
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            // user should be automatically redirected to the
            // signup page where they can signup with the
            // specified email
            header: '#fxa-signup-header',
            query: {
              context: 'fx_desktop_v3',
              email: unregisteredEmail,
              service: 'sync',
              uid: accountInfo.uid
            }
          }).call(this);
        })
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', unregisteredEmail))
        .then(testElementDisabled('input[type=email]'));
    },

    'with an unregistered email, unregistered uid': function () {
      return this.remote
        .then(openForceAuth({
          // user should be automatically redirected to the
          // signup page where they can signup with the
          // specified email
          header: '#fxa-signup-header',
          query: {
            context: 'fx_desktop_v3',
            email: email,
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'));
    }
  });
});

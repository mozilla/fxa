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

  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
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
      email = TestHelpers.createEmail('sync{id}');
    },

    'with a registered email, no uid, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              forceAboutAccounts: 'true',
              service: 'sync'
            }
          }).call(this);
        })
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'with a registered email, registered uid, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              forceAboutAccounts: 'true',
              service: 'sync',
              uid: accountInfo.uid
            }
          }).call(this);
        })
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'with a registered email, unregistered uid, verify same browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({
          query: {
            context: 'fx_desktop_v3',
            email: email,
            forceAboutAccounts: 'true',
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(noSuchBrowserNotification('fxaccounts:logout'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))


        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
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
            forceAboutAccounts: 'true',
            service: 'sync'
          }
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'))
        .then(fillOutSignUp(email, PASSWORD, { enterEmail: false }))

        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        .then(click('button[type=submit]'))

        // the default behavior of not transitioning to the confirm
        // screen is overridden because the user is signing up outside
        // of about:accounts.
        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'));
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
              forceAboutAccounts: 'true',
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
            forceAboutAccounts: 'true',
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(visibleByQSA('.error'))
        .then(testElementTextInclude('.error', 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementDisabled('input[type=email]'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({
          query: {
            context: 'fx_desktop_v3',
            email: email,
            forceAboutAccounts: 'true',
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(noSuchBrowserNotification('fxaccounts:logout'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});

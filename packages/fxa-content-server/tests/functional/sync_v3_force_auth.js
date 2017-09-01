/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  'use strict';

  let email;
  const PASSWORD = '12345678';

  const {
    click,
    closeCurrentWindow,
    createUser,
    fillOutForceAuth,
    fillOutSignInUnblock,
    fillOutSignUp,
    noPageTransition,
    noSuchBrowserNotification,
    openForceAuth,
    openVerificationLinkInNewTab,
    respondToWebChannelMessage,
    testElementDisabled,
    testElementExists,
    testElementTextInclude,
    testElementValueEquals,
    testIsBrowserNotified,
    visibleByQSA,
  } = FunctionalHelpers;

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

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
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

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
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

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))


        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'with an unregistered email, no uid': function () {
      return this.remote
        .then(openForceAuth({
          // user should be automatically redirected to the
          // signup page where they can signup with the
          // specified email
          header: selectors.SIGNUP.HEADER,
          query: {
            context: 'fx_desktop_v3',
            email: email,
            forceAboutAccounts: 'true',
            service: 'sync'
          }
        }))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(visibleByQSA(selectors.SIGNUP.ERROR))
        .then(testElementTextInclude(selectors.SIGNUP.ERROR, 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, email))
        .then(testElementDisabled(selectors.SIGNUP.EMAIL))
        .then(fillOutSignUp(email, PASSWORD, { enterEmail: false }))

        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        // the default behavior of not transitioning to the confirm
        // screen is overridden because the user is signing up outside
        // of about:accounts.
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
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
            header: selectors.SIGNUP.HEADER,
            query: {
              context: 'fx_desktop_v3',
              email: unregisteredEmail,
              forceAboutAccounts: 'true',
              service: 'sync',
              uid: accountInfo.uid
            }
          }).call(this);
        })
        .then(visibleByQSA(selectors.SIGNUP.ERROR))
        .then(testElementTextInclude(selectors.SIGNUP.ERROR, 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, unregisteredEmail))
        .then(testElementDisabled(selectors.SIGNUP.EMAIL));
    },

    'with an unregistered email, unregistered uid': function () {
      return this.remote
        .then(openForceAuth({
          // user should be automatically redirected to the
          // signup page where they can signup with the
          // specified email
          header: selectors.SIGNUP.HEADER,
          query: {
            context: 'fx_desktop_v3',
            email: email,
            forceAboutAccounts: 'true',
            service: 'sync',
            uid: TestHelpers.createUID()
          }
        }))
        .then(visibleByQSA(selectors.SIGNUP.ERROR))
        .then(testElementTextInclude(selectors.SIGNUP.ERROR, 'recreate'))
        // ensure the email is filled in, and not editible.
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, email))
        .then(testElementDisabled(selectors.SIGNUP.EMAIL));
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

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});

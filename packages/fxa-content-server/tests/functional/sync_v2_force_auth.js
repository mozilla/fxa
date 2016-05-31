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

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (context, options) {
    options = options || {};
    var forceAuthOptions = { query: {
      context: 'fx_desktop_v2',
      email: email,
      service: 'sync'
    }};

    if (options.forceAboutAccounts) {
      forceAuthOptions.query.forceAboutAccounts = 'true';
    }

    return this.parent
      .then(clearBrowserState(context))
      .then(createUser(email, PASSWORD, { preVerified: options.isUserVerified }))
      .then(openForceAuth(forceAuthOptions))
      .then(noSuchBrowserNotification(context, 'fxaccounts:logout'))
      .then(respondToWebChannelMessage(context, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutForceAuth(PASSWORD))

      .then(testIsBrowserNotified(context, 'fxaccounts:can_link_account'))
      .then(testIsBrowserNotified(context, 'fxaccounts:login'));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v2 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    'verified - about:accounts': function () {
      return this.remote
        .then(setupTest(this, {
          forceAboutAccounts: true,
          isUserVerified: true
        }))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-force-auth-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'unverified - about:accounts': function () {
      return this.remote
        .then(setupTest(this,  {
          forceAboutAccounts: true,
          isUserVerified: false
        }))
        .then(testElementExists('#fxa-confirm-header'))

        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'verified - web flow': function () {
      return this.remote
        .then(setupTest(this, {
          isUserVerified: true
        }))
        .then(testElementExists('#fxa-settings-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    },

    'unverified - web flow': function () {
      return this.remote
        .then(setupTest(this,  {
          isUserVerified: false
        }))
        .then(testElementExists('#fxa-confirm-header'))

        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    }
  });
});

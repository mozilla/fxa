/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const {
  clearBrowserState,
  closeCurrentWindow,
  createUser,
  fillOutForceAuth,
  fillOutSignInUnblock,
  openForceAuth,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testIsBrowserNotified,
  thenify,
} = FunctionalHelpers;

const PASSWORD = 'passwordzxcv';
let email;

const setupTest = thenify(function(options) {
  options = options || {};

  const successSelector = options.blocked
    ? selectors.SIGNIN_UNBLOCK.HEADER
    : options.preVerified
    ? selectors.CONFIRM_SIGNIN.HEADER
    : selectors.CONFIRM_SIGNUP.HEADER;

  return this.parent
    .then(clearBrowserState())
    .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
    .then(
      openForceAuth({
        query: {
          context: 'fx_fennec_v1',
          email: email,
          service: 'sync',
        },
      })
    )
    .then(
      respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true })
    )
    .then(fillOutForceAuth(PASSWORD))

    .then(testElementExists(successSelector))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'))
    .then(() => {
      if (!options.blocked) {
        return this.parent.then(testIsBrowserNotified('fxaccounts:login'));
      }
    });
});

registerSuite('Fx Fennec Sync v1 force_auth', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
  },
  tests: {
    'verified, verify same browser': function() {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow())

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    "verified, verify different browser - from original tab's P.O.V.": function() {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    unverified: function() {
      return this.remote.then(setupTest({ preVerified: false }));
    },

    'verified, blocked': function() {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});

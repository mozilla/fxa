/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

let email;
const PASSWORD = 'password12345678';

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  createUID,
  fillOutEmailFirstSignUp,
  fillOutForceAuth,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  noSuchBrowserNotification,
  noSuchElement,
  openForceAuth,
  testElementDisabled,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  testIsBrowserNotified,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('Firefox Desktop Sync v3 force_auth', {
  beforeEach: function () {
    email = createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'with a registered email, no uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email,
              forceUA: uaStrings['desktop_firefox_71'],
              service: 'sync',
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': {
                ok: true,
              },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          }).call(this);
        })
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(fillOutSignInTokenCode(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'with a registered email, registered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(function (accountInfo) {
          return openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              forceUA: uaStrings['desktop_firefox_71'],
              service: 'sync',
              uid: accountInfo.uid,
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': {
                ok: true,
              },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          }).call(this);
        })
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(fillOutSignInTokenCode(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'with a registered email, unregistered uid': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              forceUA: uaStrings['desktop_firefox_71'],
              service: 'sync',
              uid: createUID(),
            },
            webChannelResponses: {
              'fxaccounts:can_link_account': {
                ok: true,
              },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          })
        )
        .then(noSuchBrowserNotification('fxaccounts:logout'))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))

        .then(fillOutSignInTokenCode(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'with an unregistered email, no uid': function () {
      return (
        this.remote
          .then(
            openForceAuth({
              // user should be automatically redirected to the
              // signup page where they can signup with the
              // specified email
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: {
                context: 'fx_desktop_v3',
                email: email,
                forceUA: uaStrings['desktop_firefox_71'],
                service: 'sync',
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.ERROR))
          .then(
            testElementTextInclude(selectors.SIGNUP_PASSWORD.ERROR, 'recreate')
          )
          // ensure the email is filled in, and not editible.
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          .then(testElementDisabled(selectors.SIGNUP_PASSWORD.EMAIL))
          .then(noSuchElement(selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT))
          .then(fillOutEmailFirstSignUp(email, PASSWORD, { enterEmail: false }))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          // the default behavior of not transitioning to the confirm
          // screen is overridden because the user is signing up outside
          // of about:accounts.
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:can_link_account'))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'with an unregistered email, registered uid': function () {
      var unregisteredEmail = 'a' + email;
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(function (accountInfo) {
            return openForceAuth({
              // user should be automatically redirected to the
              // signup page where they can signup with the
              // specified email
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: {
                context: 'fx_desktop_v3',
                email: unregisteredEmail,
                service: 'sync',
                uid: accountInfo.uid,
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            }).call(this);
          })
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.ERROR))
          .then(
            testElementTextInclude(selectors.SIGNUP_PASSWORD.ERROR, 'recreate')
          )
          // ensure the email is filled in, and not editible.
          .then(
            testElementValueEquals(
              selectors.SIGNUP_PASSWORD.EMAIL,
              unregisteredEmail
            )
          )
          .then(testElementDisabled(selectors.SIGNUP_PASSWORD.EMAIL))
          .then(noSuchElement(selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT))
      );
    },

    'with an unregistered email, unregistered uid': function () {
      return (
        this.remote
          .then(
            openForceAuth({
              // user should be automatically redirected to the
              // signup page where they can signup with the
              // specified email
              header: selectors.SIGNUP_PASSWORD.HEADER,
              query: {
                context: 'fx_desktop_v3',
                email: email,
                service: 'sync',
                uid: createUID(),
              },
              webChannelResponses: {
                'fxaccounts:can_link_account': {
                  ok: true,
                },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.ERROR))
          .then(
            testElementTextInclude(selectors.SIGNUP_PASSWORD.ERROR, 'recreate')
          )
          // ensure the email is filled in, and not editible.
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
          .then(testElementDisabled(selectors.SIGNUP_PASSWORD.EMAIL))
          .then(noSuchElement(selectors.SIGNUP_PASSWORD.LINK_USE_DIFFERENT))
      );
    },

    'verified, blocked': function () {
      email = createEmail('blocked{id}');

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openForceAuth({
            query: {
              context: 'fx_desktop_v3',
              email: email,
              service: 'sync',
              uid: createUID(),
            },
          })
        )
        .then(noSuchBrowserNotification('fxaccounts:logout'))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});

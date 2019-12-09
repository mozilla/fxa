/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const userAgent = uaStrings['desktop_firefox_58'];

var browserSignedInEmail;
let browserSignedInAccount;

let otherEmail;
let otherAccount;

const PASSWORD = '12345678';

const {
  click,
  clearBrowserState,
  createUser,
  fillOutEmailFirstSignIn,
  openFxaFromRp,
  testElementTextEquals,
  thenify,
  visibleByQSA,
} = FunctionalHelpers;

const ensureUsers = thenify(function() {
  return this.parent
    .then(() => {
      if (!browserSignedInAccount) {
        browserSignedInEmail = TestHelpers.createEmail();
        return this.parent
          .then(
            createUser(browserSignedInEmail, PASSWORD, { preVerified: true })
          )
          .then(_browserSignedInAccount => {
            browserSignedInAccount = _browserSignedInAccount;
            browserSignedInAccount.email = browserSignedInEmail;
            browserSignedInAccount.verified = true;
          });
      }
    })
    .then(() => {
      if (!otherAccount) {
        otherEmail = TestHelpers.createEmail();
        return this.parent
          .then(createUser(otherEmail, PASSWORD, { preVerified: true }))
          .then(_otherAccount => {
            otherAccount = _otherAccount;
            otherAccount.email = otherEmail;
            otherAccount.verified = true;
          });
      }
    });
});

registerSuite('Firefox desktop user info handshake - OAuth flows', {
  beforeEach: function() {
    return this.remote
      .then(
        clearBrowserState({
          '123done': true,
          force: true,
        })
      )
      .then(ensureUsers());
  },

  tests: {
    'OAuth signin page - user signed into browser, no user signed in locally': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                forceUA: userAgent,
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          // User can sign in with cached credentials, no password needed.
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(
            testElementTextEquals(
              selectors['123DONE'].AUTHENTICATED,
              browserSignedInEmail
            )
          )
      );
    },

    'OAuth signin page - user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.ENTER_EMAIL.HEADER,
              query: {
                forceUA: userAgent,
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignIn(otherEmail, PASSWORD))
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          // Wait for the signin button to be visible before
          // attempting to refresh the page. If the refresh is
          // done before signout has completed, 123done shows
          // an alert box which blocks the rest of the text.
          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))

          // Then, sign in the user again, synthesizing the user having signed
          // into Sync after the initial sign in.
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                forceUA: userAgent,
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          // browser's view of the world takes precedence, it signed in last.
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          // User can sign in with cached credentials, no password needed.
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(
            testElementTextEquals(
              selectors['123DONE'].AUTHENTICATED,
              browserSignedInEmail
            )
          )
      );
    },
  },
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const userAgent = uaStrings['desktop_firefox_55'];

var browserSignedInEmail;
let browserSignedInAccount;

let otherEmail;
let otherAccount;

const PASSWORD = '12345678';

const {
  click,
  clearBrowserState,
  createUser,
  fillOutSignIn,
  openFxaFromRp,
  noSuchElement,
  testElementExists,
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

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'OAuth signin page - user signed into browser, no user signed in locally': function() {
      return (
        this.remote
          .then(
            openFxaFromRp('signin', {
              header: selectors.SIGNIN.HEADER,
              query: {
                automatedBrowser: true,
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
              selectors.SIGNIN.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          // User can sign in with cached credentials, no password needed.
          .then(noSuchElement(selectors.SIGNIN.PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'OAuth signin page - user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(
            openFxaFromRp('signin', {
              header: selectors.SIGNIN.HEADER,
              query: {
                automatedBrowser: true,
                forceUA: userAgent,
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutSignIn(otherEmail, PASSWORD))
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          // Wait for the signin button to be visible before
          // attempting to refresh the page. If the refresh is
          // done before signout has completed, 123done shows
          // an alert box which blocks the rest of the text.
          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))

          // Then, sign in the user again, synthesizing the user having signed
          // into Sync after the initial sign in.
          .then(
            openFxaFromRp('signin', {
              header: selectors.SIGNIN.HEADER,
              query: {
                automatedBrowser: true,
                forceUA: userAgent,
              },
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          // browsers version of the world is ignored for non-Sync signins if another
          // user has already signed in.
          .then(
            testElementTextEquals(
              selectors.SIGNIN.EMAIL_NOT_EDITABLE,
              otherEmail
            )
          )
          // User can sign in with cached credentials, no password needed.
          .then(noSuchElement(selectors.SIGNIN.PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },
  },
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (registerSuite, TestHelpers, FunctionalHelpers, selectors, uaStrings) {
  'use strict';

  const userAgent = uaStrings['desktop_firefox_55'];

  var browserSignedInEmail;
  let browserSignedInAccount;

  let otherEmail;
  let otherAccount;

  const PASSWORD = '12345678';

  const click = FunctionalHelpers.click;
  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const openFxaFromRp = FunctionalHelpers.openFxaFromRp;
  const noSuchElement = FunctionalHelpers.noSuchElement;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  const thenify = FunctionalHelpers.thenify;

  const ensureUsers = thenify(function () {
    return this.parent
      .then(() => {
        if (! browserSignedInAccount) {
          browserSignedInEmail = TestHelpers.createEmail();
          return this.parent
            .then(createUser(browserSignedInEmail, PASSWORD, { preVerified: true }))
            .then((_browserSignedInAccount) => {
              browserSignedInAccount = _browserSignedInAccount;
              browserSignedInAccount.email = browserSignedInEmail;
              browserSignedInAccount.verified = true;
            });
        }
      })
      .then(() => {
        if (! otherAccount) {
          otherEmail = TestHelpers.createEmail();
          return this.parent
            .then(createUser(otherEmail, PASSWORD, { preVerified: true }))
            .then((_otherAccount) => {
              otherAccount = _otherAccount;
              otherAccount.email = otherEmail;
              otherAccount.verified = true;
            });
        }
      });
  });

  registerSuite({
    name: 'Firefox desktop user info handshake - OAuth flows',

    beforeEach: function () {
      return this.remote.then(clearBrowserState())
        .then(ensureUsers());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'OAuth signin page - user signed into browser, no user signed in locally': function () {
      return this.remote
        .then(openFxaFromRp('signin', {
          header: selectors.SIGNIN.HEADER,
          query: {
            automatedBrowser: true,
            forceUA: userAgent
          },
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, browserSignedInEmail))
        // User can sign in with cached credentials, no password needed.
        .then(noSuchElement(selectors.SIGNIN.PASSWORD));
    },

    'OAuth signin page - user signed into browser, user signed in locally': function () {
      return this.remote
        // First, sign in the user to populate localStorage
        .then(openFxaFromRp('signin', {
          header: selectors.SIGNIN.HEADER,
          query: {
            automatedBrowser: true,
            forceUA: userAgent
          },
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignIn(otherEmail, PASSWORD))
        .then(click(selectors['123DONE'].LOGOUT))

        // Then, sign in the user again, synthesizing the user having signed
        // into Sync after the initial sign in.
        .then(openFxaFromRp('signin', {
          header: selectors.SIGNIN.HEADER,
          query: {
            automatedBrowser: true,
            forceUA: userAgent
          },
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        // browsers version of the world is ignored for non-Sync signins if another
        // user has already signed in.
        .then(testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, otherEmail))
        // normal email element is in the DOM to help password managers.
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, otherEmail))
        .then(testElementExists(selectors.SIGNIN.PASSWORD));
    }
  });
});

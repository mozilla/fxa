/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors, uaStrings) {
  'use strict';

  const config = intern.config;

  const userAgent = uaStrings['desktop_firefox_55'];

  const FORCE_AUTH_PAGE_URL = `${config.fxaContentRoot}force_auth?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
  const SYNC_FORCE_AUTH_PAGE_URL = `${FORCE_AUTH_PAGE_URL}&service=sync`;

  const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
  const SYNC_SIGNIN_PAGE_URL = `${SIGNIN_PAGE_URL}&service=sync`;

  const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signup?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
  const SYNC_SIGNUP_PAGE_URL = `${SIGNUP_PAGE_URL}&service=sync`;

  const SETTINGS_PAGE_URL = `${config.fxaContentRoot}settings?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
  const SYNC_SETTINGS_PAGE_URL = `${SETTINGS_PAGE_URL}&service=sync`;

  var browserSignedInEmail;
  let browserSignedInAccount;

  let otherEmail;
  let otherAccount;

  const PASSWORD = '12345678';

  const click = FunctionalHelpers.click;
  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const openPage = FunctionalHelpers.openPage;
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
    name: 'Firefox desktop user info handshake',

    beforeEach: function () {
      return this.remote.then(clearBrowserState())
        .then(ensureUsers());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'Sync signup page - user signed into browser': function () {
      return this.remote
        .then(openPage(SYNC_SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        // browserSignedInEmail not prefilled on signup page
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
        .then(click(selectors.SIGNUP.LINK_SIGN_IN))


        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, browserSignedInEmail));
    },

    'Non-Sync signup page - user signed into browser': function () {
      return this.remote
        .then(openPage(SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        // browserSignedInEmail not prefilled on signup page
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
        .then(click(selectors.SIGNUP.LINK_SIGN_IN))

        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, browserSignedInEmail))
        .then(noSuchElement(selectors.SIGNIN.PASSWORD));
    },

    'Sync signin page - user signed into browser': function () {
      return this.remote
        .then(openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, browserSignedInEmail));
    },

    'Non-Sync signin page - user signed into browser, no user signed in locally': function () {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
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

    'Non-Sync signin page - user signed into browser, user signed in locally': function () {
      return this.remote
        // First, sign in the user to populate localStorage
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignIn(otherEmail, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        // Then, sign in the user again, synthesizing the user having signed
        // into Sync after the initial sign in.
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
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
    },

    'Sync signin page - no user signed into browser': function () {
      return this.remote
        .then(openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''));
    },

    'Sync signin page - no user signed into browser, user signed in locally': function () {
      return this.remote
        // First, sign in the user to populate localStorage
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignIn(otherEmail, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))

        // unfortunately, this is one hole in our implementation. localStorage
        // is totally ignored for Sync.
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''));
    },

    'Non-Sync signin page - no user signed into browser': function () {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''));
    },

    'Sync force_auth page - user signed into browser is different to requested user': function () {
      return this.remote
        .then(openPage(`${SYNC_FORCE_AUTH_PAGE_URL}&email=${encodeURIComponent(otherEmail)}`, selectors.FORCE_AUTH.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, otherEmail));
    },

    'Non-Sync force_auth page - user signed into browser is different to requested user': function () {
      return this.remote
        .then(openPage(`${FORCE_AUTH_PAGE_URL}&email=${encodeURIComponent(otherEmail)}`, selectors.FORCE_AUTH.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, otherEmail));
    },

    'Sync settings page - user signed into browser': function () {
      return this.remote
        .then(openPage(SYNC_SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, browserSignedInEmail));
    },

    'Non-Sync settings page - user signed into browser': function () {
      return this.remote
        .then(openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: browserSignedInAccount
            }
          }
        }))
        .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, browserSignedInEmail));
    },

    'Sync settings page - no user signed into browser': function () {
      return this.remote
        .then(openPage(SYNC_SETTINGS_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }));
    },

    'Non-Sync settings page - no user signed into browser, no user signed in locally': function () {
      return this.remote
        .then(openPage(SETTINGS_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }));
    },

    'Non-Sync settings page - no user signed into browser, user signed in locally': function () {
      return this.remote
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))
        .then(fillOutSignIn(otherEmail, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null
            }
          }
        }))

        .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, otherEmail));
    }
  });
});

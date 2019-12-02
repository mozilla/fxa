/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;

const userAgent = uaStrings['desktop_firefox_58'];

const FORCE_AUTH_PAGE_URL = `${
  config.fxaContentRoot
}force_auth?forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_FORCE_AUTH_PAGE_URL = `${FORCE_AUTH_PAGE_URL}&service=sync`;

const ENTER_EMAIL_PAGE_URL = `${
  config.fxaContentRoot
}?forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_ENTER_EMAIL_PAGE_URL = `${ENTER_EMAIL_PAGE_URL}&service=sync`;

const SETTINGS_PAGE_URL = `${
  config.fxaContentRoot
}settings?forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_SETTINGS_PAGE_URL = `${SETTINGS_PAGE_URL}&service=sync`;

const SYNC_SMS_PAGE_URL = `${
  config.fxaContentRoot
}sms?service=sync&forceExperiment=sendSms&forceExperimentGroup=signinCodes&forceUA=${encodeURIComponent(
  userAgent
)}`; //eslint-disable-line max-len

var browserSignedInEmail;
let browserSignedInAccount;

let otherEmail;
let otherAccount;

const PASSWORD = '12345678';

const {
  click,
  clearBrowserState,
  createEmail,
  createPhoneNumber,
  createUser,
  deleteAllSms,
  disableInProd,
  fillOutEmailFirstSignIn,
  getSmsSigninCode,
  openPage,
  testElementExists,
  testElementTextEquals,
  testElementValueEquals,
  thenify,
  type,
} = FunctionalHelpers;

const ensureUsers = thenify(function() {
  return this.parent
    .then(() => {
      if (!browserSignedInAccount) {
        browserSignedInEmail = createEmail();
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
        otherEmail = createEmail();
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

registerSuite('Firefox desktop user info handshake', {
  beforeEach: function() {
    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(ensureUsers());
  },

  tests: {
    'Sync - user signed into browser, no user signed in locally': function() {
      return this.remote
        .then(
          openPage(
            SYNC_ENTER_EMAIL_PAGE_URL,
            selectors.SIGNIN_PASSWORD.HEADER,
            {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            }
          )
        )
        .then(
          testElementValueEquals(
            selectors.SIGNIN_PASSWORD.EMAIL,
            browserSignedInEmail
          )
        );
    },

    'Non-Sync - user signed into browser, no user signed in locally': function() {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_PAGE_URL, selectors.SIGNIN_PASSWORD.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: browserSignedInAccount,
              },
            },
          })
        )
        .then(
          testElementValueEquals(
            selectors.SIGNIN_PASSWORD.EMAIL,
            browserSignedInEmail
          )
        )
        .then(
          testElementTextEquals(
            selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
            browserSignedInEmail
          )
        )
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'Non-Sync - user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(
            openPage(ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutEmailFirstSignIn(otherEmail, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // Then, sign in the user again, synthesizing the user having signed
          // into Sync after the initial sign in.
          .then(
            openPage(ENTER_EMAIL_PAGE_URL, selectors.SIGNIN_PASSWORD.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          // browser's view of the world takes precedence, it signed in last
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'Sync - user signed into browser, signin code': disableInProd(function() {
      const testPhoneNumber = createPhoneNumber();
      let signinUrlWithSigninCode;

      return (
        this.remote
          // The phoneNumber can be reused by different tests, delete all
          // of its SMS messages to ensure a clean slate.
          .then(deleteAllSms(testPhoneNumber))

          .then(
            openPage(SYNC_SMS_PAGE_URL, selectors.SMS_SEND.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          .then(type(selectors.SMS_SEND.PHONE_NUMBER, testPhoneNumber))
          .then(click(selectors.SMS_SEND.SUBMIT))

          .then(testElementExists(selectors.SMS_SENT.HEADER))
          .then(getSmsSigninCode(testPhoneNumber, 0))
          .then(function(signinCode) {
            signinUrlWithSigninCode = `${SYNC_ENTER_EMAIL_PAGE_URL}&signin=${signinCode}`;
            return (
              this.parent
                .then(clearBrowserState())
                // Synthesize opening the SMS message in a browser where another
                // user is already signed in.
                .then(
                  openPage(
                    signinUrlWithSigninCode,
                    selectors.SIGNIN_PASSWORD.HEADER,
                    {
                      webChannelResponses: {
                        'fxaccounts:fxa_status': {
                          signedInUser: otherAccount,
                        },
                      },
                    }
                  )
                )
                // user opened an SMS w/ deferred deeplink in a browser that supports
                // fxa_status. This can't happen currently because only Fx Desktop
                // supports the query, but I want a test to ensure the behavior is
                // defined so that we are ready when Fennec or iOS adds fxa_status support.
                .then(
                  testElementTextEquals(
                    selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
                    browserSignedInEmail
                  )
                )
            );
          })
      );
    }),

    'Sync - no user signed into browser, no user signed in locally': function() {
      return this.remote
        .then(openPage(SYNC_ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, ''));
    },

    'Sync - no user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(openPage(ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(otherEmail, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(
            openPage(
              SYNC_ENTER_EMAIL_PAGE_URL,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(
            testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, otherEmail)
          )
      );
    },

    'Non-Sync - no user signed into browser, no user signed in locally': function() {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: null,
              },
            },
          })
        )
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, ''));
    },

    'Sync force_auth page - user signed into browser is different to requested user': function() {
      return this.remote
        .then(
          openPage(
            `${SYNC_FORCE_AUTH_PAGE_URL}&email=${encodeURIComponent(
              otherEmail
            )}`,
            selectors.FORCE_AUTH.HEADER,
            {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            }
          )
        )
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, otherEmail));
    },

    'Non-Sync force_auth page - user signed into browser is different to requested user': function() {
      return this.remote
        .then(
          openPage(
            `${FORCE_AUTH_PAGE_URL}&email=${encodeURIComponent(otherEmail)}`,
            selectors.FORCE_AUTH.HEADER,
            {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            }
          )
        )
        .then(testElementValueEquals(selectors.FORCE_AUTH.EMAIL, otherEmail));
    },

    'Sync settings page - user signed into browser': function() {
      return this.remote
        .then(
          openPage(SYNC_SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: browserSignedInAccount,
              },
            },
          })
        )
        .then(
          testElementTextEquals(
            selectors.SETTINGS.PROFILE_HEADER,
            browserSignedInEmail
          )
        );
    },

    'Non-Sync settings page - user signed into browser': function() {
      return this.remote
        .then(
          openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: browserSignedInAccount,
              },
            },
          })
        )
        .then(
          testElementTextEquals(
            selectors.SETTINGS.PROFILE_HEADER,
            browserSignedInEmail
          )
        );
    },

    'Sync settings page - no user signed into browser': function() {
      return this.remote.then(
        openPage(SYNC_SETTINGS_PAGE_URL, selectors.ENTER_EMAIL.HEADER)
      );
    },

    'Non-Sync settings page - no user signed into browser, no user signed in locally': function() {
      return this.remote.then(
        openPage(SETTINGS_PAGE_URL, selectors.ENTER_EMAIL.HEADER)
      );
    },

    'Non-Sync settings page - no user signed into browser, user signed in locally': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_PAGE_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(otherEmail, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER))

        .then(
          testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, otherEmail)
        );
    },
  },
});

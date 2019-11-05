/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;

const userAgent = uaStrings['desktop_firefox_55'];

const FORCE_AUTH_PAGE_URL = `${
  config.fxaContentRoot
}force_auth?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_FORCE_AUTH_PAGE_URL = `${FORCE_AUTH_PAGE_URL}&service=sync`;

const SIGNIN_PAGE_URL = `${
  config.fxaContentRoot
}signin?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_SIGNIN_PAGE_URL = `${SIGNIN_PAGE_URL}&service=sync`;

const SIGNUP_PAGE_URL = `${
  config.fxaContentRoot
}signup?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_SIGNUP_PAGE_URL = `${SIGNUP_PAGE_URL}&service=sync`;

const SETTINGS_PAGE_URL = `${
  config.fxaContentRoot
}settings?automatedBrowser=true&forceUA=${encodeURIComponent(userAgent)}`;
const SYNC_SETTINGS_PAGE_URL = `${SETTINGS_PAGE_URL}&service=sync`;

const SYNC_SMS_PAGE_URL = `${
  config.fxaContentRoot
}sms?automatedBrowser=true&service=sync&forceExperiment=sendSms&forceExperimentGroup=signinCodes&forceUA=${encodeURIComponent(
  userAgent
)}`; //eslint-disable-line max-len

var browserSignedInEmail;
let browserSignedInAccount;

let otherEmail;
let otherAccount;

const PASSWORD = '12345678';

const click = FunctionalHelpers.click;
const clearBrowserState = FunctionalHelpers.clearBrowserState;
const createUser = FunctionalHelpers.createUser;
const deleteAllSms = FunctionalHelpers.deleteAllSms;
const disableInProd = FunctionalHelpers.disableInProd;
const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
const getSmsSigninCode = FunctionalHelpers.getSmsSigninCode;
const openPage = FunctionalHelpers.openPage;
const noSuchElement = FunctionalHelpers.noSuchElement;
const testElementExists = FunctionalHelpers.testElementExists;
const testElementTextEquals = FunctionalHelpers.testElementTextEquals;
const testElementValueEquals = FunctionalHelpers.testElementValueEquals;
const thenify = FunctionalHelpers.thenify;
const type = FunctionalHelpers.type;

const ensureUsers = thenify(function() {
  return this.parent
    .then(() => {
      if (! browserSignedInAccount) {
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
      if (! otherAccount) {
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

registerSuite('Firefox desktop user info handshake', {
  beforeEach: function() {
    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(ensureUsers());
  },

  tests: {
    'Sync signup page - user signed into browser': function() {
      return (
        this.remote
          .then(
            openPage(SYNC_SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          // browserSignedInEmail not prefilled on signup page
          .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
          .then(click(selectors.SIGNUP.LINK_SIGN_IN))

          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(
            testElementValueEquals(selectors.SIGNIN.EMAIL, browserSignedInEmail)
          )
      );
    },

    'Non-Sync signup page - user signed into browser': function() {
      return (
        this.remote
          .then(
            openPage(SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: browserSignedInAccount,
                },
              },
            })
          )
          // browserSignedInEmail not prefilled on signup page
          .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
          .then(click(selectors.SIGNUP.LINK_SIGN_IN))

          .then(testElementExists(selectors.SIGNIN.HEADER))
          .then(
            testElementTextEquals(
              selectors.SIGNIN.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          .then(noSuchElement(selectors.SIGNIN.PASSWORD))
      );
    },

    'Sync signin page - user signed into browser': function() {
      return this.remote
        .then(
          openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: browserSignedInAccount,
              },
            },
          })
        )
        .then(
          testElementValueEquals(selectors.SIGNIN.EMAIL, browserSignedInEmail)
        );
    },

    'Sync signin page w/ signin code - user signed into browser': disableInProd(
      function() {
        const testPhoneNumber = TestHelpers.createPhoneNumber();
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
              signinUrlWithSigninCode = `${SYNC_SIGNIN_PAGE_URL}&signin=${signinCode}`;
              return (
                this.parent
                  .then(clearBrowserState())
                  // Synthesize opening the SMS message in a browser where another
                  // user is already signed in.
                  .then(
                    openPage(signinUrlWithSigninCode, selectors.SIGNIN.HEADER, {
                      webChannelResponses: {
                        'fxaccounts:fxa_status': {
                          signedInUser: otherAccount,
                        },
                      },
                    })
                  )
                  // user opened an SMS w/ deferred deeplink in a browser that supports
                  // fxa_status. This can't happen currently because only Fx Desktop
                  // supports the query, but I want a test to ensure the behavior is
                  // defined so that we are ready when Fennec or iOS adds fxa_status support.
                  .then(
                    testElementTextEquals(
                      selectors.SIGNIN.EMAIL_NOT_EDITABLE,
                      browserSignedInEmail
                    )
                  )
              );
            })
        );
      }
    ),

    'Non-Sync signin page - user signed into browser, no user signed in locally': function() {
      return (
        this.remote
          .then(
            openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
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
          .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'Non-Sync signin page - user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(
            openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutSignIn(otherEmail, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // Then, sign in the user again, synthesizing the user having signed
          // into Sync after the initial sign in.
          .then(
            openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
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
              selectors.SIGNIN.EMAIL_NOT_EDITABLE,
              browserSignedInEmail
            )
          )
          .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'Sync signin page - no user signed into browser': function() {
      return this.remote
        .then(
          openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: null,
              },
            },
          })
        )
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''));
    },

    'Sync signin page - no user signed into browser, user signed in locally': function() {
      return (
        this.remote
          // First, sign in the user to populate localStorage
          .then(
            openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )
          .then(fillOutSignIn(otherEmail, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(
            openPage(SYNC_SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
              webChannelResponses: {
                'fxaccounts:fxa_status': {
                  signedInUser: null,
                },
              },
            })
          )

          .then(testElementValueEquals(selectors.SIGNIN.EMAIL, otherEmail))
      );
    },

    'Non-Sync signin page - no user signed into browser': function() {
      return this.remote
        .then(
          openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: null,
              },
            },
          })
        )
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''));
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
        openPage(SYNC_SETTINGS_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null,
            },
          },
        })
      );
    },

    'Non-Sync settings page - no user signed into browser, no user signed in locally': function() {
      return this.remote.then(
        openPage(SETTINGS_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:fxa_status': {
              signedInUser: null,
            },
          },
        })
      );
    },

    'Non-Sync settings page - no user signed into browser, user signed in locally': function() {
      return this.remote
        .then(
          openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: null,
              },
            },
          })
        )
        .then(fillOutSignIn(otherEmail, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(SETTINGS_PAGE_URL, selectors.SETTINGS.HEADER, {
            webChannelResponses: {
              'fxaccounts:fxa_status': {
                signedInUser: null,
              },
            },
          })
        )

        .then(
          testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, otherEmail)
        );
    },
  },
});

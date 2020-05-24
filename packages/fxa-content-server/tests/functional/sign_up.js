/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const UA_STRINGS = require('./lib/ua-strings');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;

let email;
const PASSWORD = 'password12345678';

const {
  click,
  clearBrowserState,
  closeCurrentWindow,
  createEmail,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  noPageTransition,
  noSuchElement,
  openPage,
  openSignUpInNewTab,
  pollUntilHiddenByQSA,
  switchToWindow,
  testElementExists,
  testElementTextEquals,
  testElementTextInclude,
  testElementValueEquals,
  testErrorTextInclude,
  testSuccessWasShown,
  testUrlInclude,
  type,
  visibleByQSA,
  waitForUrl,
} = FunctionalHelpers;

const ENTER_EMAIL_ENTRYPOINT = `entrypoint=${encodeURIComponent(
  'fxa:enter_email'
)}`;
var SYNC_CONTEXT_ANDROID = 'context=fx_fennec_v1';
var SYNC_CONTEXT_DESKTOP = 'context=fx_desktop_v3';
var SYNC_SERVICE = 'service=sync';
const PRODUCT_URL = `${config.fxaContentRoot}subscriptions/products/${config.testProductId}`;

function testAtConfirmScreen(email) {
  return function () {
    return this.parent
      .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
      .then(
        testElementTextInclude(selectors.SIGNIN_UNBLOCK.EMAIL_FIELD, email)
      );
  };
}

registerSuite('signup here', {
  beforeEach: function () {
    email = createEmail();
    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'with an invalid email': function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL + '?email=invalid', selectors['400'].HEADER)
        )
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an empty email': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL + '?email=', selectors['400'].HEADER))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'COPPA disabled': function () {
      return this.remote
        .then(
          openPage(
            ENTER_EMAIL_URL + '?coppa=false',
            selectors.ENTER_EMAIL.HEADER
          )
        )
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        )

        .then(noSuchElement(selectors.SIGNUP_PASSWORD.AGE))
        .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
        .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
        .then(click(selectors.SIGNUP_PASSWORD.SUBMIT))
        .then(testAtConfirmScreen(email));
    },

    'signup, verify and sign out of two accounts, all in the same tab, then sign in to the first account': function () {
      // https://github.com/mozilla/fxa-content-server/issues/2209
      var secondEmail = createEmail();
      this.timeout = 90000;

      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(fillOutSignUpCode(email, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown())
        .then(click(selectors.SETTINGS.SIGNOUT))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))

        .then(fillOutEmailFirstSignUp(secondEmail, PASSWORD))
        .then(testAtConfirmScreen(secondEmail))
        .then(fillOutSignUpCode(secondEmail, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testSuccessWasShown())
        .then(click(selectors.SETTINGS.SIGNOUT))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signup with email with leading whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = '   ' + email;
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(emailWithSpace, PASSWORD))
          .then(testAtConfirmScreen(emailWithoutSpace))
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(emailWithoutSpace, PASSWORD))

          // user is not confirmed, success is seeing the confirm screen.
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
      );
    },

    'signup with email with trailing whitespace on the email': function () {
      var emailWithoutSpace = email;
      var emailWithSpace = '   ' + email;

      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(emailWithSpace, PASSWORD))
          .then(testAtConfirmScreen(emailWithoutSpace))
          .then(clearBrowserState())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(emailWithoutSpace, PASSWORD))

          // user is not confirmed, success is seeing the confirm screen.
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
      );
    },

    'signup with invalid email address': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, `${email}-`))
          .then(click(selectors.ENTER_EMAIL.SUBMIT))

          // wait five seconds to allow any errant navigation to occur
          .then(noPageTransition(selectors.ENTER_EMAIL.HEADER))

          // the validation tooltip should be visible
          .then(visibleByQSA(selectors.ENTER_EMAIL.TOOLTIP))
      );
    },

    'coppa is empty': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD, { age: ' ' }))

          // navigation should not occur
          .then(noPageTransition(selectors.SIGNUP_PASSWORD.HEADER))

          // an error should be visible
          .then(visibleByQSA(selectors.SIGNUP_PASSWORD.TOOLTIP_AGE_REQUIRED))
      );
    },

    'coppa is too young': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD, { age: 12 }))

          // should have navigated to cannot-create-account view
          .then(testElementExists(selectors.COPPA.HEADER))
      );
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(
        this,
        '/legal/terms',
        selectors.TOS.HEADER
      );
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(
        this,
        '/legal/privacy',
        selectors.PRIVACY_POLICY.HEADER
      );
    },

    'form prefill information is cleared after signup->sign out': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))
          .then(testAtConfirmScreen(email))

          .then(fillOutSignUpCode(email, 0))

          // The original tab should transition to the settings page w/ success
          // message.
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS.SIGNOUT))

          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          // check the email address was cleared
          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, ''))
          .then(type(selectors.ENTER_EMAIL.EMAIL, createEmail()))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )
          // check the password was cleared
          .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.PASSWORD, ''))
      );
    },

    'signup, open sign-up in second tab, verify in original tab': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(openSignUpInNewTab())
        .then(switchToWindow(1))

        .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))

        .then(switchToWindow(0))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(closeCurrentWindow());
    },

    'signup via product page and redirect after confirm': async function () {
      if (
        process.env.CIRCLECI === 'true' &&
        !process.env.SUBHUB_STRIPE_APIKEY
      ) {
        this.skip('missing Stripe API key in CircleCI run');
      }
      // Depending on timing the final page might be the redirect page (PRODUCT_URL),
      // or might be the product page (which is a URL that ends the same, but has a
      // different domain), so we test for the path only:
      const productUrlPath = new URL(PRODUCT_URL).pathname;
      return this.remote
        .then(openPage(PRODUCT_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testAtConfirmScreen(email))
        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.PAYMENTS.HEADER))
        .then(waitForUrl((url) => url.includes(productUrlPath)));
    },

    'signup non matching passwords': function () {
      const DROWSSAP = 'drowssap';
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            fillOutEmailFirstSignUp(email, PASSWORD, { vpassword: DROWSSAP })
          )
          // wait five seconds to allow any errant navigation to occur
          .then(noPageTransition(selectors.SIGNUP_PASSWORD.HEADER))
          // the validation tooltip should be visible
          .then(
            testElementTextEquals(
              selectors.SIGNUP_PASSWORD.TOOLTIP,
              'Passwords do not match'
            )
          )
          // Tooltip should disappear
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
          .then(pollUntilHiddenByQSA(selectors.SIGNUP_PASSWORD.TOOLTIP))

          // Tooltip should reappear
          .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, DROWSSAP))
          .then(
            testElementTextEquals(
              selectors.SIGNUP_PASSWORD.TOOLTIP,
              'Passwords do not match'
            )
          )

          // user can enter to next input despite tooltip error
          .then(type(selectors.SIGNUP_PASSWORD.AGE, '42'))
      );
    },

    'sync suggestion for Fx Desktop': function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              forceUA: UA_STRINGS['desktop_firefox_58'],
            },
          })
        )
        .then(click(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))

        .then(testElementExists(selectors.ENTER_EMAIL.SUB_HEADER))
        .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
        .then(testUrlInclude(SYNC_CONTEXT_DESKTOP))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(ENTER_EMAIL_ENTRYPOINT));
    },

    'sync suggestion for Fennec': function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              action: 'email',
              forceUA: UA_STRINGS['android_firefox'],
            },
          })
        )
        .then(click(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))

        .then(testElementExists(selectors.ENTER_EMAIL.SUB_HEADER))
        .then(noSuchElement(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
        .then(testUrlInclude(SYNC_CONTEXT_ANDROID))
        .then(testUrlInclude(SYNC_SERVICE))
        .then(testUrlInclude(ENTER_EMAIL_ENTRYPOINT));
    },

    'sync suggestion for everyone else': function () {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: {
              forceUA: UA_STRINGS['desktop_chrome'],
            },
          })
        )
        .then(click(selectors.ENTER_EMAIL.LINK_SUGGEST_SYNC))
        .then(testElementExists(selectors.MOZILLA_ORG_SYNC.HEADER));
    },
  },
});

function testRepopulateFields(dest, header) {
  return this.remote
    .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))

    .then(type(selectors.ENTER_EMAIL.EMAIL, email))
    .then(click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER))

    .then(type(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
    .then(type(selectors.SIGNUP_PASSWORD.VPASSWORD, PASSWORD))
    .then(type(selectors.SIGNUP_PASSWORD.AGE, '24'))

    .then(click('a[href="' + dest + '"]'))
    .then(testElementExists(header))
    .then(click('.back'))

    .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.EMAIL, email))
    .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.PASSWORD, PASSWORD))
    .then(testElementValueEquals(selectors.SIGNUP_PASSWORD.AGE, '24'));
}

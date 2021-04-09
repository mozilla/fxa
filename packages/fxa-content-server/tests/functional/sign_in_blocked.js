/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'passwordcxvz';
let email;

const {
  addAndVerifySecondaryEmail,
  clearBrowserState,
  click,
  closeCurrentWindow,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  getUnblockInfo,
  openPage,
  openTab,
  signOut,
  switchToWindow,
  testElementTextEquals,
  testErrorTextInclude,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('signin blocked', {
  beforeEach: function () {
    email = createEmail('blocked{id}');

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }));
  },

  tests: {
    'valid code entered': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
        )
        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'valid code with whitespace at the beginning entered': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
        )
        .then(getUnblockInfo(email, 0))
        .then(function (unblockInfo) {
          return this.parent.then(
            type(
              selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE,
              '   ' + unblockInfo.unblockCode
            )
          );
        })
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'valid code with whitespace at the end entered': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
        )
        .then(getUnblockInfo(email, 0))
        .then(function (unblockInfo) {
          return this.parent.then(
            type(
              selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE,
              unblockInfo.unblockCode + '   '
            )
          );
        })
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'invalid code entered': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
        )
        .then(type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, 'i'))
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(visibleByQSA(selectors.SIGNIN_UNBLOCK.TOOLTIP))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.TOOLTIP, 'invalid')
        );
    },

    'incorrect code entered': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(
          testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
        )
        .then(type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, 'incorrec'))
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))
        .then(visibleByQSA(selectors.SIGNIN_UNBLOCK.ERROR))
        .then(testErrorTextInclude('invalid'))
        .then(getUnblockInfo(email, 0))
        .then(function (unblockInfo) {
          return this.parent.then(
            type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, unblockInfo.unblockCode)
          );
        })
        .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'incorrect password entered': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, 'incorrect'))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(
            testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
          )
          .then(fillOutSignInUnblock(email, 0))

          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(testErrorTextInclude('incorrect password'))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

          .then(
            testElementTextInclude(selectors.SIGNIN_UNBLOCK.VERIFICATION, email)
          )

          .then(fillOutSignInUnblock(email, 0))
          // the first code is no longer valid, must use the 2nd.
          .then(visibleByQSA(selectors.SIGNIN_UNBLOCK.ERROR))
          .then(testErrorTextInclude('invalid'))

          // get and consume the second code
          .then(fillOutSignInUnblock(email, 1))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    resend: function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(click(selectors.SIGNIN_UNBLOCK.LINK_RESEND))
          .then(visibleByQSA('.success'))
          .then(testElementTextInclude('.success', 'resent'))
          // use the 2nd unblock code
          .then(fillOutSignInUnblock(email, 1))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'report signin success': function () {
      let unblockCode;
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(getUnblockInfo(email, 0))
          .then(function (unblockInfo) {
            unblockCode = unblockInfo.unblockCode;
            return this.parent.then(openTab(unblockInfo.reportSignInLink));
          })
          .then(switchToWindow(1))

          .then(testElementExists(selectors.REPORT_SIGNIN.HEADER))
          .then(click(selectors.REPORT_SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SIGNIN_REPORTED.HEADER))

          .then(closeCurrentWindow())

          // try to use the code that was reported, it should error
          .then(function () {
            return this.parent.then(
              type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, unblockCode)
            );
          })
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))
          .then(visibleByQSA(selectors.SIGNIN_UNBLOCK.ERROR))
          .then(testErrorTextInclude('invalid'))
      );
    },

    'report signin link unblockCode broken': function () {
      let unblockCode;
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(getUnblockInfo(email, 0))
          .then(function (unblockInfo) {
            unblockCode = unblockInfo.unblockCode;
            const invalidLink = unblockInfo.reportSignInLink.replace(
              /unblockCode=[^&]+/,
              'unblockCode=invalid_code'
            );
            return this.parent.then(openTab(invalidLink));
          })
          .then(switchToWindow(1))

          .then(testElementExists('#fxa-report-sign-in-link-damaged-header'))
          .then(closeCurrentWindow())

          // code can still be used
          .then(function () {
            return this.parent.then(
              type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, unblockCode)
            );
          })
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'report signin link uid broken': function () {
      let unblockCode;
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(getUnblockInfo(email, 0))
          .then(function (unblockInfo) {
            unblockCode = unblockInfo.unblockCode;
            const invalidLink = unblockInfo.reportSignInLink.replace(
              /uid=[^&]+/,
              'uid=invalid_uid'
            );
            return this.parent.then(openTab(invalidLink));
          })
          .then(switchToWindow(1))

          .then(testElementExists('#fxa-report-sign-in-link-damaged-header'))
          .then(closeCurrentWindow())

          // code can still be used
          .then(function () {
            return this.parent.then(
              type(selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE, unblockCode)
            );
          })
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'report link opened after code used': function () {
      let reportSignInLink;
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(getUnblockInfo(email, 0))
          .then(function (unblockInfo) {
            reportSignInLink = unblockInfo.reportSignInLink;
            return this.parent.then(
              type(
                selectors.SIGNIN_UNBLOCK.UNBLOCK_CODE,
                unblockInfo.unblockCode
              )
            );
          })
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(function () {
            return this.parent.then(
              openPage(reportSignInLink, '#fxa-report-sign-in-header')
            );
          })
          // report link is expired and can no longer be used.
          .then(click(selectors.SIGNIN_UNBLOCK.SUBMIT))
          .then(visibleByQSA(selectors.SIGNIN_UNBLOCK.ERROR))
          .then(testErrorTextInclude('invalid'))
      );
    },

    unverified: function () {
      email = createEmail('blocked{id}');

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: false }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          // email 0 is the signup email, email 1 contains the code
          .then(fillOutSignInUnblock(email, 1))

          // It's substandard UX, but we decided to punt on making
          // users verified until v2. When submitting an unblock code
          // verifies unverified users, they will not need to enter
          // the verification code, instead they'll go directly
          // to the settings page.
          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

          .then(fillOutSignInTokenCode(email, 2))
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'with primary email changed': function () {
      email = createEmail('{id}');
      const secondaryEmail = createEmail('blocked.dIFfCaSe.{id}');
      const secondaryEmailNormalized = secondaryEmail.toLowerCase();

      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.EMAIL.MENU_BUTTON))
          .then(addAndVerifySecondaryEmail(secondaryEmail))
          .then(testSuccessWasShown())
          // set new primary email
          .then(click(selectors.SETTINGS_V2.SECONDARY_EMAIL.MAKE_PRIMARY))
          .then(
            testElementTextEquals(selectors.EMAIL.ADDRESS_LABEL, secondaryEmail)
          )
          .then(visibleByQSA(selectors.EMAIL.SUCCESS))
          .then(signOut())
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))

          // Try login with new primary email but in different email case
          .then(fillOutEmailFirstSignIn(secondaryEmailNormalized, PASSWORD))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_UNBLOCK.VERIFICATION,
              secondaryEmailNormalized
            )
          )

          .then(testElementExists(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(fillOutSignInUnblock(email, 2))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },
  },
});

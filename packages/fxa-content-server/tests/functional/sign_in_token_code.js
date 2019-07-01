/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const PASSWORD = 'passwordzxcv';
let email;

const click = FunctionalHelpers.click;
const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
const createUser = FunctionalHelpers.createUser;
const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
const fillOutSignInTokenCode = FunctionalHelpers.fillOutSignInTokenCode;
const noSuchElement = FunctionalHelpers.noSuchElement;
const openFxaFromRp = FunctionalHelpers.openFxaFromRp;
const openVerificationLinkInNewTab =
  FunctionalHelpers.openVerificationLinkInNewTab;
const switchToWindow = FunctionalHelpers.switchToWindow;
const testElementExists = FunctionalHelpers.testElementExists;
const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
const type = FunctionalHelpers.type;

const NOTES_REDIRECT_PAGE_SELECTOR = '#notes-by-firefox';
const NOTES_PAGE_TEXT_SELECTOR = 'Notes by Firefox';
const experimentParams = {
  query: {
    client_id: '7f368c6886429f19', // eslint-disable-line camelcase
    code_challenge: 'aSOwsmuRBE1ZIVtiW6bzKMaf47kCFl7duD6ZWAXdnJo', // eslint-disable-line camelcase
    code_challenge_method: 'S256', // eslint-disable-line camelcase
    forceUA:
      'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Mobile Safari/537.36',
    // eslint-disable-next-line camelcase
    keys_jwk:
      'eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOi' +
      'JQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdX' +
      'U5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ',
    redirect_uri: 'https://mozilla.github.io/notes/fxa/android-redirect.html', // eslint-disable-line camelcase
    scope: 'profile https://identity.mozilla.com/apps/notes',
  },
};

registerSuite('signin token code', {
  beforeEach: function() {
    // The `sync` prefix is needed to force confirmation.
    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(
        FunctionalHelpers.clearBrowserState({
          contentServer: true,
        })
      )
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'verified - control': function() {
      experimentParams.query.forceExperiment = 'tokenCode';

      // Currently the control will default to which ever verification
      // the auth-server chooses which is sign-in link.
      experimentParams.query.forceExperimentGroup = 'control';
      return (
        this.remote
          .then(openFxaFromRp('signin', experimentParams))

          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(noSuchElement(selectors.SIGNIN_COMPLETE.CONTINUE_BUTTON))
          // user sees the name of the RP, but cannot redirect
          .then(
            testElementTextInclude(
              selectors.SIGNIN_COMPLETE.SERVICE_NAME,
              'notes'
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())

          .then(
            testElementTextInclude(
              selectors.SIGNIN_COMPLETE.SERVICE_NAME,
              'notes'
            )
          )
      );
    },

    'verified - treatment-code - valid code': function() {
      experimentParams.query.forceExperiment = 'tokenCode';
      experimentParams.query.forceExperimentGroup = 'treatment-code';

      return (
        this.remote
          .then(openFxaFromRp('signin', experimentParams))
          .then(fillOutSignIn(email, PASSWORD))

          // Displays invalid code errors
          .then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, '000000'))
          .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
          .then(testElementTextInclude('.tooltip', 'valid code required'))

          // Correctly submits the token code and navigates to oauth page
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(fillOutSignInTokenCode(email, 0))

          .then(
            testElementTextInclude(
              NOTES_REDIRECT_PAGE_SELECTOR,
              NOTES_PAGE_TEXT_SELECTOR
            )
          )
      );
    },

    'verified - treatment-code - valid code then click back': function() {
      experimentParams.query.forceExperiment = 'tokenCode';
      experimentParams.query.forceExperimentGroup = 'treatment-code';
      return (
        this.remote
          .then(openFxaFromRp('signin', experimentParams))
          .then(fillOutSignIn(email, PASSWORD))

          // Correctly submits the token code and navigates to oauth page
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(fillOutSignInTokenCode(email, 0))

          .then(
            testElementTextInclude(
              NOTES_REDIRECT_PAGE_SELECTOR,
              NOTES_PAGE_TEXT_SELECTOR
            )
          )

          .goBack()
          .then(testElementExists(selectors.SIGNIN.HEADER))
      );
    },

    'verified - treatment-link - open link new tab': function() {
      experimentParams.query.forceExperiment = 'tokenCode';
      experimentParams.query.forceExperimentGroup = 'treatment-link';
      return this.remote
        .then(openFxaFromRp('signin', experimentParams))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(openVerificationLinkInNewTab(email, 0))

        .then(
          testElementTextInclude(
            selectors.SIGNIN_COMPLETE.SERVICE_NAME,
            'notes'
          )
        );
    },
  },
});

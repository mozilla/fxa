/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const Constants = require('../../app/scripts/lib/constants');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;
const PAGE_COMPLETE_SIGNIN_URL = config.fxaContentRoot + 'complete_signin';
const PAGE_SIGNIN_URL =
  config.fxaContentRoot + 'signin?context=fx_desktop_v3&service=sync';
const PASSWORD = 'passwordzxcv';

let code;
let email;
let uid;
let user;

const clearBrowserState = FunctionalHelpers.clearBrowserState;
const createUser = FunctionalHelpers.createUser;
const fillOutEmailFirstSignIn = FunctionalHelpers.fillOutEmailFirstSignIn;
const getEmailHeaders = FunctionalHelpers.getEmailHeaders;
const noSuchElement = FunctionalHelpers.noSuchElement;
const openPage = FunctionalHelpers.openPage;
const testElementExists = FunctionalHelpers.testElementExists;
const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

const createRandomHexString = TestHelpers.createRandomHexString;

registerSuite('complete_sign_in', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
    user = TestHelpers.emailToUser(email);
    return this.remote
      .then(clearBrowserState())
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(
        openPage(PAGE_SIGNIN_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            'fxaccounts:can_link_account': { ok: true },
            'fxaccounts:fxa_status': { capabilities: null, signedInUser: null },
          },
        })
      )
      .then(fillOutEmailFirstSignIn(email, PASSWORD))
      .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))
      .then(testIsBrowserNotified('fxaccounts:login'))
      .then(getEmailHeaders(user, 0))
      .then(headers => {
        code = headers['x-verify-code'];
        uid = headers['x-uid'];
      });
  },
  tests: {
    'open verification link with malformed code': function() {
      code = createRandomHexString(Constants.CODE_LENGTH - 1);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(
          openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_DAMAGED)
        )
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with server reported bad code': function() {
      const code = createRandomHexString(Constants.CODE_LENGTH);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_REUSED))
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with malformed uid': function() {
      const uid = createRandomHexString(Constants.UID_LENGTH - 1);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(
          openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_DAMAGED)
        )
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },

    'open verification link with server reported bad uid': function() {
      const uid = createRandomHexString(Constants.UID_LENGTH);
      const url = PAGE_COMPLETE_SIGNIN_URL + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(
          openPage(url, selectors.COMPLETE_SIGNIN.VERIFICATION_LINK_EXPIRED)
        )
        .then(noSuchElement(selectors.COMPLETE_SIGNIN.LINK_RESEND));
    },
  },
});

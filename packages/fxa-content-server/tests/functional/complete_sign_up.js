/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const Constants = require('../../app/scripts/lib/constants');
const { createEmail, createRandomHexString } = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const CONFIRM_EMAIL_ROOT = config.fxaContentRoot + 'verify_email';
const PASSWORD = 'passwordcxzv';
let email;
let accountData;
let code;
let uid;

const {
  createUser,
  getVerificationLink,
  noSuchElement,
  openPage,
} = FunctionalHelpers;

registerSuite('complete_sign_up', {
  beforeEach: function() {
    email = createEmail();
    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: false }))
      .then(function(result) {
        accountData = result;
        uid = accountData.uid;
      })

      .then(getVerificationLink(email, 0))

      .then(function(link) {
        code = link.match(/code=([A-Za-z0-9]+)/)[1];
      });
  },
  tests: {
    'open verification link with malformed code': function() {
      const code = createRandomHexString(Constants.CODE_LENGTH - 1);
      const uid = accountData.uid;
      const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(
          openPage(url, selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_DAMAGED)
        )
        .then(
          noSuchElement(selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_EXPIRED)
        );
    },

    'open verification link with server reported bad code': function() {
      const code = createRandomHexString(Constants.CODE_LENGTH);
      const uid = accountData.uid;
      const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_DAMAGED)
      );
    },

    'open verification link with malformed uid': function() {
      const uid = createRandomHexString(Constants.UID_LENGTH - 1);
      const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_DAMAGED)
      );
    },

    'open verification link with server reported bad uid': function() {
      const uid = createRandomHexString(Constants.UID_LENGTH);
      const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_EXPIRED)
      );
    },

    'open valid email verification link': function() {
      const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(openPage(url, selectors.SIGNUP_COMPLETE.HEADER));
    },
  },
});

registerSuite(
  'complete_sign_up with expired link, but without signing up in browser',
  {
    beforeEach: function() {
      email = createEmail();
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: false }))
          .then(function(result) {
            accountData = result;
            uid = accountData.uid;
          })

          .then(getVerificationLink(email, 0))
          .then(function(link) {
            code = link.match(/code=([A-Za-z0-9]+)/)[1];
          })
          // re-sign up the same user with a different password, should expire
          // the original verification link.
          .then(createUser(email, 'secondpassword', { preVerified: false }))
      );
    },
    tests: {
      'open expired email verification link': function() {
        const url = CONFIRM_EMAIL_ROOT + '?uid=' + uid + '&code=' + code;

        return (
          this.remote
            .then(
              openPage(url, selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_EXPIRED)
            )
            .then(
              noSuchElement(selectors.COMPLETE_SIGNUP.VERIFICATION_LINK_DAMAGED)
            )

            // Give resend time to show up
            .setFindTimeout(200)
            .then(noSuchElement(selectors.COMPLETE_SIGNUP.LINK_RESEND))
        );
      },
    },
  }
);

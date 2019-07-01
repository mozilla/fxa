/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const Constants = require('../../app/scripts/lib/constants');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var PAGE_URL_ROOT = config.fxaContentRoot + 'verify_email';
var PASSWORD = 'password';
var email;
var accountData;
var code;
var uid;

var click = FunctionalHelpers.click;
var createRandomHexString = TestHelpers.createRandomHexString;
var createUser = FunctionalHelpers.createUser;
var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
var getVerificationLink = FunctionalHelpers.getVerificationLink;
var noSuchElement = FunctionalHelpers.noSuchElement;
var openPage = FunctionalHelpers.openPage;
var testElementExists = FunctionalHelpers.testElementExists;
var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
var visibleByQSA = FunctionalHelpers.visibleByQSA;

registerSuite('complete_sign_up', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
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
      var code = createRandomHexString(Constants.CODE_LENGTH - 1);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .then(openPage(url, '#fxa-verification-link-damaged-header'))
        .then(noSuchElement('#fxa-verification-link-expired-header'));
    },

    'open verification link with server reported bad code': function() {
      var code = createRandomHexString(Constants.CODE_LENGTH);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, '#fxa-verification-link-damaged-header')
      );
    },

    'open verification link with malformed uid': function() {
      var uid = createRandomHexString(Constants.UID_LENGTH - 1);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, '#fxa-verification-link-damaged-header')
      );
    },

    'open verification link with server reported bad uid': function() {
      var uid = createRandomHexString(Constants.UID_LENGTH);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(
        openPage(url, '#fxa-verification-link-expired-header')
      );
    },

    'open valid email verification link': function() {
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote.then(openPage(url, '#fxa-sign-up-complete-header'));
    },
  },
});

registerSuite(
  'complete_sign_up with expired link, but without signing up in browser',
  {
    beforeEach: function() {
      email = TestHelpers.createEmail();
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
        var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

        return (
          this.remote
            .then(openPage(url, '#fxa-verification-link-expired-header'))
            .then(noSuchElement('#fxa-verification-link-damaged-header'))

            // Give resend time to show up
            .setFindTimeout(200)
            .then(noSuchElement('#resend'))
        );
      },
    },
  }
);

registerSuite('complete_sign_up with expired link and click resend', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
  },
  tests: {
    'open expired email verification link': function() {
      var verificationLink;

      return (
        this.remote
          // Sign up and obtain a verification link
          .then(fillOutSignUp(email, PASSWORD))
          .then(testElementExists('#fxa-confirm-header'))

          .then(getVerificationLink(email, 0))
          .then(_verificationLink => {
            verificationLink = _verificationLink;
          })

          // Sign up again to invalidate the old verification link
          .then(fillOutSignUp(email, 'different_password'))
          .then(testElementExists('#fxa-confirm-header'))

          .then(function() {
            return this.parent.then(
              openPage(
                verificationLink,
                '#fxa-verification-link-expired-header'
              )
            );
          })
          .then(click('#resend'))

          .then(testSuccessWasShown())

          // two extra clicks still shows success message
          .then(click('#resend'))
          .then(click('#resend'))

          // Stills shows success message
          //
          // this uses .visibleByQSA instead of testSuccessWasShown because
          // the element is not re-shown, but rather should continue to
          // be visible.
          .then(visibleByQSA('.success'))
      );
    },
  },
});

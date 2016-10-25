/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'app/scripts/lib/constants',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, require, nodeXMLHttpRequest, FxaClient, Constants, restmail, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_URL_ROOT = config.fxaContentRoot + 'verify_email';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;
  var code;
  var uid;

  var createRandomHexString = TestHelpers.createRandomHexString;

  registerSuite({
    name: 'complete_sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          uid = accountData.uid;
        })

        .then(restmail(EMAIL_SERVER_ROOT + '/mail/' + user))

        .then(function (emails) {
          code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
        });
    },

    'open verification link with malformed code': function () {
      var code = createRandomHexString(Constants.CODE_LENGTH - 1);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end()

        .then(FunctionalHelpers.noSuchElement(this, '#fxa-verification-link-expired-header'));

    },

    'open verification link with server reported bad code': function () {
      var code = createRandomHexString(Constants.CODE_LENGTH);
      var uid = accountData.uid;
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end();
    },

    'open verification link with malformed uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH - 1);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-damaged-header')
        .end();
    },

    'open verification link with server reported bad uid': function () {
      var uid = createRandomHexString(Constants.UID_LENGTH);
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-verification-link-expired-header')
        .end();
    },

    'open valid email verification link': function () {
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      return this.remote
        .get(require.toUrl(url))

        // a successful user is immediately redirected to the
        // sign-up-complete page.
        .findById('fxa-sign-up-complete-header')
        .end();
    }
  });

  registerSuite({
    name: 'complete_sign_up with expired link, but without signing up in browser',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          uid = accountData.uid;
        })

        .then(restmail(EMAIL_SERVER_ROOT + '/mail/' + user))

        .then(function (emails) {
          code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

          return client.signUp(email, 'secondpassword');
        });
    },

    'open expired email verification link': function () {
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

      var self = this;
      return self.remote
        .get(require.toUrl(url))

        .findById('fxa-verification-link-expired-header')
        .end()

        .then(FunctionalHelpers.noSuchElement(self, '#fxa-verification-link-damaged-header'))

        // Give resend time to show up
        .setFindTimeout(200)
        .then(FunctionalHelpers.noSuchElement(self, '#resend'));
    }
  });

  registerSuite({
    name: 'complete_sign_up with expired link and click resend',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
    },

    'open expired email verification link': function () {
      var self = this;
      var completeUrl;

      return self.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        // Sign up and obtain a verification link
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })
        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          completeUrl = verificationLink;
        })

        // Sign up again to invalidate the old verification link
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, 'different_password');
        })
        .findById('fxa-confirm-header')
        .end()

        .then(function () {
          return self.remote
            .get(require.toUrl(completeUrl))

            .findById('fxa-verification-link-expired-header')
            .end()

            .findById('resend')
              .click()
            .end()

            .then(FunctionalHelpers.testSuccessWasShown(self))

            .findById('resend')
              .click()
              .click()
            .end()

            // Stills shows success message
            //
            // this uses .visibleByQSA instead of testSuccessWasShown because
            // the element is not re-shown, but rather should continue to
            // be visible.
            .then(FunctionalHelpers.visibleByQSA('.success'));
        });
    }
  });
});

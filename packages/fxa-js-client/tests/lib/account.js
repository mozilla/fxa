/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/intern',
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'tests/mocks/request',
  'tests/addons/restmail',
  'tests/addons/accountHelper'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Restmail, AccountHelper) {

  with (tdd) {
    suite('account', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
        'http://127.0.0.1:9001' :
        'http://restmail.net';
      var client;
      var respond;
      var mail;
      var accountHelper;

      function noop(val) { return val; }

      beforeEach(function () {
        var xhr;

        if (useRemoteServer) {
          xhr = XHR.XMLHttpRequest;
          respond = noop;
        } else {
          var requests = [];
          xhr = SinonResponder.useFakeXMLHttpRequest();
          xhr.onCreate = function (xhr) {
            requests.push(xhr);
          };
          respond = SinonResponder.makeMockResponder(requests);
        }
        client = new FxAccountClient(authServerUrl, { xhr: xhr });
        mail = new Restmail(mailServerUrl, xhr);
        accountHelper = new AccountHelper(client, mail, respond);
      });

      test('#destroy', function () {
        var email;
        var password;

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            email = account.input.email;
            password = account.input.password;

            return respond(client.accountDestroy(email, password), RequestMocks.accountDestroy)
          })
          .then(
            function(res) {
              assert.ok(res, '== got response');

              return respond(client.signIn(email, password), RequestMocks.signIn)
            }
          ).then(
            function (res) {
            },
            function (error) {
              assert.ok(error, '== error should happen');
              assert.equal(error.message, 'Unknown account', '== Account is gone');
              assert.equal(error.code, 400, '== Correct status code');

              return error;
            }
        );
      });

      test('#keys', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {

            return respond(client.accountKeys(account.signIn.keyFetchToken), RequestMocks.accountKeys)
          })
          .then(
          function(keys) {
            assert.ok(keys.bundle);

            return true
          },
          function(error) {
            console.log(error);
            assert.equal(error, null, '== no error occured');
          }
        );
      });

      test('#destroy with incorrect case', function () {
        var account;

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client.accountDestroy(incorrectCaseEmail, account.input.password), RequestMocks.accountDestroy)
          })
          .then(
          function(res) {
            assert.ok(res, '== got response');

            return respond(client.signIn(account.input.email, account.input.password), RequestMocks.signIn)
          }
        ).then(
          function (res) {
          },
          function (error) {
            assert.ok(error, '== error should happen');
            assert.equal(error.message, 'Unknown account', '== Account is gone');
            assert.equal(error.code, 400, '== Correct status code');

            return error;
          }
        );
      });

      /**
       * Password Reset
       */
      test('#reset password', function () {
        var user = 'test5' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;
        var passwordForgotToken;
        var accountResetToken;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            return respond(client.passwordForgotSendCode(email), RequestMocks.passwordForgotSendCode);
          })
          .then(function (result) {
            passwordForgotToken = result.passwordForgotToken;
            assert.ok(passwordForgotToken, "passwordForgotToken is returned");

            return respond(mail.wait(user, 2), RequestMocks.resetMail);
          })
          .then(function (emails) {
            var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned: " + code);

            return respond(client.passwordForgotVerifyCode(code, passwordForgotToken), RequestMocks.passwordForgotVerifyCode);
          })
          .then(function (result) {
            accountResetToken = result.accountResetToken;
            var newPassword = 'newturles';
            assert.ok(accountResetToken, "accountResetToken is returned");

            return respond(client.accountReset(email, newPassword, accountResetToken), RequestMocks.accountReset);
          })
          .then(function (result) {
            assert.ok(result, '{}');
            return true;
          })
      });

    });
  }
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('account', function () {
       var accountHelper;
       var respond;
       var mail;
       var client;
       var RequestMocks;
       var ErrorMocks;

      beforeEach(function () {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
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
              assert.ok(res, 'got response');

              return respond(client.signIn(email, password), ErrorMocks.accountDoesNotExist)
            }
          ).then(
            function () {
              assert.fail();
            },
            function (error) {
              assert.equal(error.errno, 102, 'Account is gone');
              assert.equal(error.code, 400, 'Correct status code');
            }
        );
      });

      test('#keys', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            return respond(client.accountKeys(account.signIn.keyFetchToken, account.signIn.unwrapBKey), RequestMocks.accountKeys)
          })
          .then(
            function(keys) {
              assert.property(keys, 'kA');
              assert.property(keys, 'kB');
            },
            assert.notOk
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
            assert.ok(res);

            return respond(client.signIn(account.input.email, account.input.password), ErrorMocks.accountDoesNotExist)
          }
        ).then(
          function () {
            assert.fail();
          },
          function (error) {
            assert.ok(error);
            assert.equal(error.errno, 102);
            assert.equal(error.code, 400, 'Correct status code');
          }
        );
      });

      test('#destroy with incorrect case with skipCaseError', function () {
        var account;

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client.accountDestroy(incorrectCaseEmail, account.input.password, {skipCaseError: true}), ErrorMocks.incorrectEmailCase)
          })
          .then(
            function () {
              assert.fail();
            },
            function (res) {
              assert.equal(res.code, 400);
              assert.equal(res.errno, 120);
            }
          );
      });

      /**
       * Password Reset
       */
      test('#reset password', function () {
        var user = 'test5' + new Date().getTime();
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
          .then(
            function (result) {
              assert.isNotNull(result);
            },
            assert.notOk
          )
      });

      test('#passwordForgotSendCode with service and redirectTo', function () {
        var account;
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.firefox.com/after_reset'
        };

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;

            return respond(client.passwordForgotSendCode(account.input.email, opts), RequestMocks.passwordForgotSendCode)
          })
          .then(function (result) {
            assert.ok(result.passwordForgotToken);

            return respond(mail.wait(account.input.user, 2), RequestMocks.resetMailWithServiceAndRedirect);
          })
          .then(function (emails) {
            var code = emails[1].html.match(/code=([A-Za-z0-9]+)/);
            assert.ok(code, 'code found');
            var service = emails[1].html.match(/service=([A-Za-z0-9]+)/);
            assert.ok(service, 'service found');
            var redirectTo = emails[1].html.match(/redirectTo=([A-Za-z0-9]+)/);
            assert.ok(redirectTo, 'redirectTo found');

            assert.ok(code[1], 'code is returned');
            assert.equal(service[1], 'sync', 'service is returned');
            assert.equal(redirectTo[1], 'https', 'redirectTo is returned');
          })
      });

      test('#passwordForgotResendCode with service and redirectTo', function () {
        var account;
        var passwordForgotToken;
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.firefox.com/after_reset'
        };

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;

            return respond(client.passwordForgotSendCode(account.input.email, opts), RequestMocks.passwordForgotSendCode)
          })
          .then(function (result) {
            assert.ok(result.passwordForgotToken);
            passwordForgotToken = result.passwordForgotToken;

            return respond(mail.wait(account.input.user, 2), RequestMocks.resetMailWithServiceAndRedirect);
          })
          .then(function (res) {
            assert.ok(res);

            return respond(client.passwordForgotResendCode(account.input.email, passwordForgotToken, opts),
              RequestMocks.passwordForgotResendCode)
          })
          .then(function (result) {
            assert.ok(result.passwordForgotToken);

            return respond(mail.wait(account.input.user, 3), RequestMocks.resetMailResendWithServiceAndRedirect);
          })
          .then(function (emails) {
            var code = emails[2].html.match(/code=([A-Za-z0-9]+)/);
            assert.ok(code, 'code found');
            var service = emails[2].html.match(/service=([A-Za-z0-9]+)/);
            assert.ok(service, 'service found');
            var redirectTo = emails[2].html.match(/redirectTo=([A-Za-z0-9]+)/);
            assert.ok(redirectTo, 'redirectTo found');

            assert.ok(code[1], 'code is returned');
            assert.equal(service[1], 'sync', 'service is returned');
            assert.equal(redirectTo[1], 'https', 'redirectTo is returned');
          })
      });

      test('#passwordForgotStatus', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (result) {

            return respond(client.passwordForgotSendCode(result.input.email), RequestMocks.passwordForgotSendCode);
          })
          .then(function (result) {

            return respond(client.passwordForgotStatus(result.passwordForgotToken), RequestMocks.passwordForgotStatus)
          })
          .then(
            function (result) {
              assert.equal(result.tries, 3);
              assert.property(result, 'ttl');
            },
            assert.notOk
          )
      });

      test('#passwordForgotStatus error with a false token', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (result) {

            return respond(client.passwordForgotSendCode(result.input.email), RequestMocks.passwordForgotSendCode);
          })
          .then(function () {
            var fakeToken = 'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

            return respond(client.passwordForgotStatus(fakeToken), ErrorMocks.invalidAuthToken)
          })
          .then(
            assert.notOk,
            function (err) {
              assert.equal(err.code, 401);
              assert.equal(err.errno, 110);
            }
          )
      });

    });
  }
});

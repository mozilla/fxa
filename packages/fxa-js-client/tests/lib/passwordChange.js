/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('passwordChange', function () {
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

      test('#basic', function () {
        var user = 'test7' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
          })
          .then(function () {
            return respond(client._passwordChangeStart(email, password), RequestMocks.passwordChangeStart);
          })
          .then(function (oldCreds) {

            return respond(client._passwordChangeFinish(email, newPassword, oldCreds), RequestMocks.passwordChangeFinish);
          })
          .then(function (result) {
            assert.ok(result, '{}');

            return respond(client.signIn(email, newPassword), RequestMocks.signIn);
          })
          .then(
            function (res) {
              assert.property(res, 'sessionToken');
            },
            function () {
              assert.fail();
            }
          )
      });

      test('#with incorrect case', function () {
        var newPassword = 'ilikefoxes';
        var account;

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client._passwordChangeStart(incorrectCaseEmail, account.input.password), RequestMocks.passwordChangeStart);
          })
          .then(function (oldCreds) {

            return respond(client._passwordChangeFinish(account.input.email, newPassword, oldCreds), RequestMocks.passwordChangeFinish);
          })
          .then(function (result) {
            assert.ok(result, '{}');

            return respond(client.signIn(account.input.email, newPassword), RequestMocks.signIn);
          })
          .then(
            function (res) {
              assert.property(res, 'sessionToken');
            },
            function () {
              assert.fail();
            }
          )
      });

      /**
       * Changing the Password failure
       */
      test('#changeFailure', function () {
        var user = 'test8' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var wrongPassword = '12345678';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
          })
          .then(function () {
            return respond(client._passwordChangeStart(email, password), RequestMocks.passwordChangeStart);
          })
          .then(function (oldCreds) {

            return respond(client._passwordChangeFinish(email, newPassword, oldCreds), RequestMocks.passwordChangeFinish);
          })
          .then(function (result) {
            assert.ok(result);

            return respond(client.signIn(email, wrongPassword), ErrorMocks.accountIncorrectPassword);
          })
          .then(
            function () {
              assert.fail();
            },
            function (error) {
              assert.ok(error);
              assert.equal(error.message, 'Incorrect password', '== Password is incorrect');
              assert.equal(error.code, 400, '== Correct status code');
            }
          )
      });
    });
  }
});

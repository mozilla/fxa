/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('signIn', function () {
      var accountHelper;
      var respond;
      var client;
      var RequestMocks;
      var ErrorMocks;

      beforeEach(function () {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
      });

      test('#basic', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function () {

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(
            function (res) {
              assert.ok(res.sessionToken);
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#with keys', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (res) {
            return respond(client.signIn(email, password, {keys: true}), RequestMocks.signInWithKeys);
          })
          .then(
            function (res) {
              assert.ok(res.sessionToken);
              assert.ok(res.keyFetchToken);
              assert.ok(res.unwrapBKey);
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#incorrect email case', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client.signIn(incorrectCaseEmail, account.input.password), RequestMocks.signIn);
          })
          .then(
          function (res) {
            assert.property(res, 'sessionToken');
          },
          function () {
            assert.fail();
          }
        );
      });

      test('#incorrectPassword', function () {

          return accountHelper.newVerifiedAccount()
              .then(function (account) {
                  return respond(client.signIn(account.input.email, 'wrong password'), ErrorMocks.accountIncorrectPassword);
              })
              .then(
              function () {
                assert.fail();
              },
              function (res) {
                assert.equal(res.code, 400);
                assert.equal(res.errno, 103);
              }
          );
      });
    });
  }
});

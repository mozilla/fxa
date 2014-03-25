/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('session', function () {
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

      test('#destroy', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {

            return respond(client.sessionDestroy(account.signIn.sessionToken), RequestMocks.sessionDestroy)
          })
          .then(
            function(res) {
              assert.ok(res, 'got response');
            },
            assert.notOk
          );
      });

      test('#status', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {

            return respond(client.sessionStatus(account.signIn.sessionToken), RequestMocks.sessionStatus)
          })
          .then(
            function(res) {
              assert.isNotNull(res);
            },
            assert.notOk
          );
      });

      test('#status error with a false token', function () {

        return accountHelper.newVerifiedAccount()
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

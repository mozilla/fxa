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

      beforeEach(function () {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
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
            function(error) {
              assert.fail();
            }
          );
      });

    });
  }
});

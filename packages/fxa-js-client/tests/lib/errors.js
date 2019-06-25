/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  with (tdd) {
    suite('errors', function() {
      var accountHelper;
      var respond;
      var client;
      var ErrorMocks;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        ErrorMocks = env.ErrorMocks;
      });

      test('#accountUnverified', function() {
        return accountHelper
          .newUnverifiedAccount()
          .then(function(account) {
            var pk = { algorithm: 'RS', n: 'x', e: 'y' };
            var duration = 1000;

            return respond(
              client.certificateSign(account.signIn.sessionToken, pk, duration),
              ErrorMocks.accountUnverified
            );
          })
          .then(
            function() {
              assert.fail();
            },
            function(error) {
              assert.equal(error.code, 400);
              assert.equal(error.errno, 104);
            }
          );
      });

      test('#invalidVerificationCode', function() {
        return accountHelper
          .newUnverifiedAccount()
          .then(function(account) {
            return respond(
              client.verifyCode(
                account.signUp.uid,
                'eb531a64deb628b2baeaceaa8762abf0'
              ),
              ErrorMocks.invalidVerification
            );
          })
          .then(
            function() {
              assert.fail();
            },
            function(error) {
              assert.equal(error.code, 400);
              assert.equal(error.errno, 105);
            }
          );
      });
    });
  }
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'client/lib/request',
  'client/lib/hawkCredentials',
  'client/lib/errors',
  'client/FxAccountClient'
], function (tdd, assert, Environment, Request, hawkCredentials, ERRORS, FxAccountClient) {

  with (tdd) {
    suite('timeOffset', function () {
      var env;
      var accountHelper;
      var respond;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var sessionToken;

      beforeEach(function () {
        env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
      });

      test('#create a session', function () {

        return accountHelper.newUnverifiedAccount()
          .then(
            function (account) {
              sessionToken = account.signIn.sessionToken;
              assert.ok(sessionToken);
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#request with a skewed clock', function () {
        var request = new Request(env.authServerUrl, env.xhr, { localtimeOffsetMsec: 6000001 });

        return hawkCredentials(sessionToken, 'sessionToken', 2 * 32)
          .then(function (creds) {
            return respond(request.send('/recovery_email/status', 'GET', creds, null, true), RequestMocks.invalidTimestamp);
          })
          .then(
            function () {
              assert.fail();
            },
            function (err) {
              assert.equal(err.errno, ERRORS.INVALID_TIMESTAMP);
            }
          );
      });

      test('#request with a skewed clock using retry', function () {
        var request = new Request(env.authServerUrl, env.xhr, { localtimeOffsetMsec: 6000001 });

        return hawkCredentials(sessionToken, 'sessionToken', 2 * 32)
          .then(function (creds) {
            return respond(request.send('/recovery_email/status', 'GET', creds, null, false), RequestMocks.recoveryEmailUnverified);
          })
          .then(
            function (res) {
              assert.ok(res);
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#authenticated request with skewed clock', function () {
        var client = new FxAccountClient(env.authServerUrl, { xhr: env.xhr, localtimeOffsetMsec: 6000001 });
        return respond(client.recoveryEmailStatus(sessionToken), RequestMocks.recoveryEmailUnverified)
          .then(
            function (res) {
              assert.ok(res);
            },
            function (error) {
              assert.fail();
            }
          );
      });

    });
  }
});

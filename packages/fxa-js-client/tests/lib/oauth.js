/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  // These tests are intended to run against a mock auth-server. To test
  // against a local auth-server, you will need to have it correctly
  // configured to send sms and specify a real phone number here.
  var env = new Environment();
  if (env.useRemoteServer) {
    return;
  }

  with (tdd) {
    suite('oauth', function() {
      var accountHelper;
      var respond;
      var client;
      var RequestMocks;

      beforeEach(function() {
        env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      test('#createOAuthCode - missing sessionToken', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthCode(null, 'client_id', 'state'),
              RequestMocks.createOAuthCode
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing sessionToken');
          });
      });

      test('#createOAuthCode - missing clientId', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthCode(
                account.signIn.sessionToken,
                null,
                'state'
              ),
              RequestMocks.createOAuthCode
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing clientId');
          });
      });

      test('#createOAuthCode - missing state', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthCode(
                account.signIn.sessionToken,
                'client_id',
                null
              ),
              RequestMocks.createOAuthCode
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing state');
          });
      });

      test('#createOAuthCode', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthCode(
                account.signIn.sessionToken,
                'client_id',
                'state'
              ),
              RequestMocks.createOAuthCode
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });

      test('#createOAuthToken - missing sessionToken', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthToken(null, 'client_id'),
              RequestMocks.createOAuthToken
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing sessionToken');
          });
      });

      test('#createOAuthToken - missing clientId', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthToken(account.signIn.sessionToken, null),
              RequestMocks.createOAuthToken
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing clientId');
          });
      });

      test('#createOAuthToken', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createOAuthToken(account.signIn.sessionToken, 'client_id'),
              RequestMocks.createOAuthToken
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });

      test('#getOAuthScopedKeyData - missing sessionToken', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getOAuthScopedKeyData(null, 'client_id', 'profile'),
              RequestMocks.getOAuthScopedKeyData
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing sessionToken');
          });
      });

      test('#getOAuthScopedKeyData - missing clientId', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getOAuthScopedKeyData(
                account.signIn.sessionToken,
                null,
                'profile'
              ),
              RequestMocks.getOAuthScopedKeyData
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing clientId');
          });
      });

      test('#getOAuthScopedKeyData - missing scope', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getOAuthScopedKeyData(
                account.signIn.sessionToken,
                'client_id',
                null
              ),
              RequestMocks.getOAuthScopedKeyData
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing scope');
          });
      });

      test('#getOAuthScopedKeyData', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getOAuthScopedKeyData(
                account.signIn.sessionToken,
                'client_id',
                'profile'
              ),
              RequestMocks.getOAuthScopedKeyData
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });
    });
  }
});

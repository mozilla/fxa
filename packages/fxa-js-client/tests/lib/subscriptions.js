/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
], function(tdd, assert, Environment) {
  var env = new Environment();
  if (env.useRemoteServer) {
    return;
  }

  with (tdd) {
    suite('subscriptions', function() {
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

      test('#getActiveSubscriptions - missing token', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getActiveSubscriptions(),
              RequestMocks.getActiveSubscriptions
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing oauthToken or sessionToken');
          });
      });
      test('#getActiveSubscriptions with oauth token', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getActiveSubscriptions('saynomore'),
              RequestMocks.getActiveSubscriptions
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });
      test('#getActiveSubscriptions with session token', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.getActiveSubscriptions(null, account.signIn.sessionToken),
              RequestMocks.getActiveSubscriptions
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });

      test('#createSupportTicket - missing token', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createSupportTicket(),
              RequestMocks.createSupportTicket
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing token');
          });
      });
      test('#createSupportTicket - missing supportTicket', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createSupportTicket('redpandas'),
              RequestMocks.createSupportTicket
            );
          })
          .then(assert.notOk, function(error) {
            assert.include(error.message, 'Missing supportTicket');
          });
      });
      test('#createSupportTicket', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.createSupportTicket('redpandas', {
                topic: 'Species',
                subject: 'Cute & Rare',
                message: 'Need moar',
              }),
              RequestMocks.createSupportTicket
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });
    });
  }
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/lib/push-constants',
], function(tdd, assert, Environment) {
  // These tests are intended to run against a mock auth-server. To test
  // against a local auth-server, you will need to have it correctly
  // configured to send sms and specify a real phone number here.
  var env = new Environment();
  if (env.useRemoteServer) {
    return;
  }

  var PHONE_NUMBER = '+14071234567';
  var MESSAGE_ID = 1;

  with (tdd) {
    suite('sms', function() {
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

      test('#send connect device', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.sendSms(
                account.signIn.sessionToken,
                PHONE_NUMBER,
                MESSAGE_ID
              ),
              RequestMocks.sendSmsConnectDevice
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });

      test('status', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.smsStatus(account.signIn.sessionToken),
              RequestMocks.smsStatus
            );
          })
          .then(function(resp) {
            assert.ok(resp);
            assert.ok(resp.ok);
            assert.ok(resp.country);
          }, assert.notOk);
      });

      test('status with country', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.smsStatus(account.signIn.sessionToken, { country: 'RO' }),
              RequestMocks.smsStatus
            );
          })
          .then(function(resp) {
            assert.ok(resp);
            assert.ok(resp.ok);
            assert.ok(resp.country, 'RO');
          }, assert.notOk);
      });
    });
  }
});

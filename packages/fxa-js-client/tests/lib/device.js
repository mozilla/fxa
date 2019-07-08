/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/lib/push-constants',
], function(tdd, assert, Environment, PushTestConstants) {
  var DEVICE_CALLBACK = PushTestConstants.DEVICE_CALLBACK;
  var DEVICE_NAME = PushTestConstants.DEVICE_NAME;
  var DEVICE_NAME_2 = PushTestConstants.DEVICE_NAME_2;
  var DEVICE_TYPE = PushTestConstants.DEVICE_TYPE;

  with (tdd) {
    suite('device', function() {
      var accountHelper;
      var respond;
      var client;
      var RequestMocks;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
      });

      test('#register', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.deviceRegister(
                account.signIn.sessionToken,
                DEVICE_NAME,
                DEVICE_TYPE,
                {
                  deviceCallback: DEVICE_CALLBACK,
                }
              ),
              RequestMocks.deviceRegister
            );
          })
          .then(
            function(res) {
              assert.ok(res.id);
              assert.equal(res.name, DEVICE_NAME);
              assert.equal(res.pushCallback, DEVICE_CALLBACK);
              assert.equal(res.type, DEVICE_TYPE);
            },
            function(err) {
              console.log(err);
              assert.notOk();
            }
          );
      });

      test('#update', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.deviceRegister(
                account.signIn.sessionToken,
                DEVICE_NAME,
                DEVICE_TYPE,
                {
                  deviceCallback: DEVICE_CALLBACK,
                }
              ),
              RequestMocks.deviceRegister
            ).then(function(device) {
              return respond(
                client.deviceUpdate(
                  account.signIn.sessionToken,
                  device.id,
                  DEVICE_NAME_2,
                  {
                    deviceCallback: DEVICE_CALLBACK,
                  }
                ),
                RequestMocks.deviceUpdate
              );
            });
          })
          .then(function(res) {
            assert.ok(res.id);
            assert.equal(res.name, DEVICE_NAME_2);
            assert.equal(res.pushCallback, DEVICE_CALLBACK);
          }, assert.notOk);
      });

      test('#destroy', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.deviceRegister(
                account.signIn.sessionToken,
                DEVICE_NAME,
                DEVICE_TYPE,
                {
                  deviceCallback: DEVICE_CALLBACK,
                }
              ),
              RequestMocks.deviceRegister
            ).then(function(device) {
              return respond(
                client.deviceDestroy(account.signIn.sessionToken, device.id),
                RequestMocks.deviceDestroy
              );
            });
          })
          .then(function(res) {
            assert.equal(Object.keys(res), 0);
          }, assert.notOk);
      });

      test('#list', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          return respond(
            client.deviceRegister(
              account.signIn.sessionToken,
              DEVICE_NAME,
              DEVICE_TYPE,
              {
                deviceCallback: DEVICE_CALLBACK,
              }
            ),
            RequestMocks.deviceRegister
          )
            .then(function(device) {
              return respond(
                client.deviceList(account.signIn.sessionToken),
                RequestMocks.deviceList
              );
            })

            .then(function(devices) {
              assert.equal(devices.length, 1);

              var device = devices[0];
              assert.ok(device.id);
              assert.equal(device.name, DEVICE_NAME);
              assert.equal(device.pushCallback, DEVICE_CALLBACK);
              assert.equal(device.type, DEVICE_TYPE);
            });
        });
      });
    });
  }
});

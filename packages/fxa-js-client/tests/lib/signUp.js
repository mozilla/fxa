/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/lib/push-constants'
], function (tdd, assert, Environment, PushTestConstants) {

  var DEVICE_CALLBACK = PushTestConstants.DEVICE_CALLBACK;
  var DEVICE_NAME = PushTestConstants.DEVICE_NAME;
  var DEVICE_PUBLIC_KEY = PushTestConstants.DEVICE_PUBLIC_KEY;
  var DEVICE_TYPE = PushTestConstants.DEVICE_TYPE;

  with (tdd) {
    suite('signUp', function () {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var setupEnv = new Environment();

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
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(
            function (res) {
              assert.property(res, 'uid', 'uid should be returned on signUp');
              assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
              assert.notProperty(res, 'keyFetchToken', 'keyFetchToken should not be returned on signUp');
            },
            assert.notOk
          );
      });

      test('#withKeys', function () {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          keys: true
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUpKeys)
          .then(
            function (res) {
              assert.property(res, 'uid', 'uid should be returned on signUp');
              assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
              assert.property(res, 'keyFetchToken', 'keyFetchToken should be returned on signUp');
              assert.property(res, 'unwrapBKey', 'unwrapBKey should be returned on signUp');
            },
            assert.notOk
          );
      });

      test('#create account with service, redirectTo, and resume', function () {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.firefox.com/after_reset',
          resume: 'resumejwt'
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUp)
          .then(function (res) {
            assert.ok(res.uid);
            return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
          })
          .then(
            function (emails) {
              var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
              var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];
              var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];
              var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];

              assert.ok(code, 'code is returned');
              assert.ok(service, 'service is returned');
              assert.ok(redirectTo, 'redirectTo is returned');
              assert.ok(resume, 'resume is returned');

            },
            assert.notOk
          );
      });

      test('#withService', function () {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          service: 'sync'
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUp)
          .then(function (res) {
            assert.ok(res.uid);
            return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
          })
          .then(
            function (emails) {
              var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
              var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];

              assert.ok(code, 'code is returned');
              assert.ok(service, 'service is returned');
            },
            assert.notOk
          );
      });

      test('#withRedirectTo', function () {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          redirectTo: 'http://sync.firefox.com/after_reset'
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUp)
          .then(function (res) {
            assert.ok(res.uid);
            return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
          })
          .then(
            function (emails) {
              var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
              var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];

              assert.ok(code, 'code is returned');
              assert.ok(redirectTo, 'redirectTo is returned');

            },
            assert.notOk
          );
      });

      test('#withResume', function () {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          resume: 'resumejwt'
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUp)
          .then(function (res) {
            assert.ok(res.uid);
            return respond(mail.wait(user), RequestMocks.mailServiceAndRedirect);
          })
          .then(
            function (emails) {
              var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
              var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];

              assert.ok(code, 'code is returned');
              assert.ok(resume, 'resume is returned');

            },
            assert.notOk
          );
      });

      test('#preVerified', function () {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          preVerified: true
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUp)
          .then(function (res) {
            assert.ok(res.uid);

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function(res) {
            assert.equal(res.verified, true, '== account is verified');
          });
      });

      // Only run this tests when using mocks
      if (! setupEnv.useRemoteServer) {

        test('#preVerifyToken', function () {
          var email = 'test' + new Date().getTime() + '@restmail.net';
          var password = 'iliketurtles';
          var opts = {
            preVerifyToken: 'somebiglongtoken'
          };

          return respond(client.signUp(email, password, opts), RequestMocks.signUp)
            .then(function (res) {
              assert.ok(res.uid);

              return respond(client.signIn(email, password), RequestMocks.signIn);
            })
            .then(function(res) {
              assert.equal(res.verified, true, '== account is verified');
            });
        });

      }

      test('#accountExists', function () {
        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            return respond(client.signUp(account.input.email, 'somepass'), ErrorMocks.accountExists);
          })
          .then(
          function (res) {
            assert.fail();
          },
          function (err) {
            assert.equal(err.code, 400);
            assert.equal(err.errno, 101);
          }
        );
      });

      test('#with new device', function () {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(client.signUp(email, password, {
          device: {
            name: DEVICE_NAME,
            type: DEVICE_TYPE,
            callback: DEVICE_CALLBACK,
            publicKey: DEVICE_PUBLIC_KEY
          }
        }), RequestMocks.signUpNewDevice)
        .then(function (resp) {
          var device = resp.device;
          assert.ok(device.id);
          assert.equal(device.name, DEVICE_NAME);
          assert.equal(device.type, DEVICE_TYPE);
          assert.equal(device.pushCallback, DEVICE_CALLBACK);
          assert.equal(device.pushPublicKey, DEVICE_PUBLIC_KEY);
        });
      });

      test('#with metricsContext metadata', function () {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(
          client.signUp(email, password, {
            metricsContext: {
              flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              flowBeginTime: Date.now(),
              forbiddenProperty: 666
            }
          }),
          RequestMocks.signUp
        )
        .then(
          function (resp) {
            assert.ok(resp);
          },
          assert.notOk
        );
      });
    });
  }
});

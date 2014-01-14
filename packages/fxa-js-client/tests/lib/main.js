/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/intern',
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'tests/mocks/request',
  'client/lib/request',
  'components/p/p',
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Request, p) {

  with (tdd) {
    suite('fxa client', function () {
      var client;
      var requests;
      var baseUri = 'http://127.0.0.1:9000/v1';
      var restmailClient;

      beforeEach(function () {
        var xhr;
        if (config.SERVER) {
          xhr = XHR ? XHR.XMLHttpRequest : undefined;
          baseUri = config.SERVER;
          // TODO
          requests = Array(50);
        } else {
          // TODO: allow real requests by using 'XHR'
          xhr = SinonResponder.useFakeXMLHttpRequest();
          requests = [];

          xhr.onCreate = function (xhr) {
            requests.push(xhr);
          };
        }

        client = new FxAccountClient(baseUri, { xhr: xhr });
        restmailClient = new Request('http://restmail.net', xhr);
      });

      /**
       * Create Account
       */
      test('#create account', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var signUpRequest = client.signUp(email, password)
          .then(function (res, b, c) {
            assert.ok(res.uid);
          });

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return signUpRequest;
      });

      /**
       * Sign In
       */
      test('#sign in', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var signUpRequest =  client.signUp(email, password)
          .then(function (res) {
            var signInRequest = client.signIn(email, password);

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.signIn);
            }, 200);

            return signInRequest;
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return signUpRequest;
      });

      /**
       * Sign In with Keys
       */
      test('#sign in with keys', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var signUpRequest =  client.signUp(email, password)
          .then(function (res) {
            var signInRequest = client.signIn(email, password, {keys: true});

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.signInWithKeys);
            }, 200);

            return signInRequest;
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
            return true;
          });

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return signUpRequest;
      });

      /**
       * Verify Email
       */
      test('#verify email', function () {
        var user = 'test3' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return client.signUp(email, password)
          .then(function (result) {

            uid = result.uid;

            assert.ok(uid, "uid is returned");

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.mail);
            }, 200);

            return waitForEmail(user);
          })
          .then(function (emails) {

            setTimeout(function() {
              SinonResponder.respond(requests[2], RequestMocks.verifyCode);
            }, 200);

            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned");
            return client.verifyCode(uid, code);
          })
      });

      /**
       * Check Verification Status
       */
      test('#check verification status', function () {
        var user = 'test4' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;
        var sessionToken;

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return client.signUp(email, password)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.signIn);
            }, 200);

            return client.signIn(email, password);
          })
          .then(function (result) {
            assert.ok(result.sessionToken, "sessionToken is returned");
            sessionToken = result.sessionToken;

            setTimeout(function() {
              SinonResponder.respond(requests[2], RequestMocks.recoveryEmailUnverified);
            }, 200);

            return client.recoveryEmailStatus(sessionToken);
          })
          .then(function (result) {
            assert.equal(result.verified, false, "Email should not be verified.");

            setTimeout(function() {
              SinonResponder.respond(requests[3], RequestMocks.mail);
            }, 200);

            return waitForEmail(user);
          })
          .then(function (emails) {

            setTimeout(function() {
              SinonResponder.respond(requests[4], RequestMocks.verifyCode);
            }, 200);

            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned: " + code);
            return client.verifyCode(uid, code);
          })
          .then(function (result) {
            setTimeout(function() {
              SinonResponder.respond(requests[5], RequestMocks.recoveryEmailVerified);
            }, 200);

            return client.recoveryEmailStatus(sessionToken);
          })
          .then(function (result) {
            assert.equal(result.verified, true, "Email should be verified.");
            return true;
          })
      });

      /**
       * Password Reset
       */
      test('#reset password', function () {
        var user = 'test5' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;
        var passwordForgotToken;
        var accountResetToken;

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return client.signUp(email, password)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.passwordForgotSendCode);
            }, 200);

            return client.passwordForgotSendCode(email);
          })
          .then(function (result) {
            passwordForgotToken = result.passwordForgotToken;
            assert.ok(passwordForgotToken, "passwordForgotToken is returned");

            setTimeout(function() {
              SinonResponder.respond(requests[2], RequestMocks.mail);
            }, 200);

            return waitForEmail(user, 2);
          })
          .then(function (emails) {

            var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned: " + code);

            setTimeout(function() {
              SinonResponder.respond(requests[3], RequestMocks.passwordForgotVerifyCode);
            }, 200);

            return client.passwordForgotVerifyCode(code, passwordForgotToken);
          })
          .then(function (result) {
            accountResetToken = result.accountResetToken;
            var newPassword = 'newturles';

            assert.ok(accountResetToken, "accountResetToken is returned");
            setTimeout(function() {
              SinonResponder.respond(requests[4], RequestMocks.accountReset);
            }, 200);

            return client.accountReset(email, newPassword, accountResetToken);
          })
          .then(function (result) {
            assert.ok(result, '{}');
            return true;
          })
      });

      // utility function that waits for a restmail email to arrive
      function waitForEmail(user, number) {
        if (!number) number = 1;
        console.log('Waiting for email...');

        return restmailClient.send('/mail/' + user, 'GET')
          .then(function(result) {
            if (result.length === number) {
              return result;
            } else {
              var deferred = p.defer();

              setTimeout(function() {
                waitForEmail(user, number)
                  .then(function(emails) {
                    deferred.resolve(emails);
                  }, function(err) {
                    deferred.reject(err);
                  });
              }, 1000);
              return deferred.promise;
            }
          });
      }

    });
  }
});

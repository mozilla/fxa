/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/addons/sinon',
], function(tdd, assert, Environment, sinon) {
  with (tdd) {
    suite('session', function() {
      var accountHelper;
      var respond;
      var requests;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var xhr;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        requests = env.requests;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
        xhr = env.xhr;
        sinon.spy(xhr.prototype, 'open');
        sinon.spy(xhr.prototype, 'send');
      });

      afterEach(function() {
        xhr.prototype.open.restore();
        xhr.prototype.send.restore();
      });

      test('#destroy', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.sessionDestroy(account.signIn.sessionToken),
              RequestMocks.sessionDestroy
            );
          })
          .then(function(res) {
            assert.ok(res, 'got response');
          }, assert.notOk);
      });

      test('#status', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.sessionStatus(account.signIn.sessionToken),
              RequestMocks.sessionStatus
            );
          })
          .then(function(res) {
            assert.isNotNull(res);
          }, assert.notOk);
      });

      test('#status error with a false token', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function() {
            var fakeToken =
              'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

            return respond(
              client.passwordForgotStatus(fakeToken),
              ErrorMocks.invalidAuthToken
            );
          })
          .then(assert.notOk, function(err) {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110);
          });
      });

      test('#sessions', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.sessions(account.signIn.sessionToken),
              RequestMocks.sessions
            );
          })
          .then(function(res) {
            assert.equal(res.length, 2);
            var s = res[0];
            assert.ok(s.id);
            assert.ok(s.deviceType);
            assert.equal(s.isDevice, false);
            assert.ok(s.lastAccessTime);
            assert.ok(s.lastAccessTimeFormatted);
          }, assert.notOk);
      });

      test('#sessions error', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            var fakeToken =
              'e838790265a45f6ee1130070d57d67d9bb20953706f73af0e34b0d4d92f10000';

            return respond(
              client.sessions(fakeToken),
              ErrorMocks.invalidAuthToken
            );
          })
          .then(assert.notOk, function(err) {
            assert.equal(err.code, 401);
            assert.equal(err.errno, 110);
          });
      });

      test('#reauth', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var email = account.input.email;
          var password = account.input.password;

          return respond(
            client.sessionReauth(account.signIn.sessionToken, email, password),
            RequestMocks.sessionReauth
          ).then(function(res) {
            assert.ok(res.uid);
            assert.ok(res.verified);
            assert.ok(res.authAt);
            assert.notOk(res.keyFetchToken);
            assert.notOk(res.unwrapBKey);

            var args =
              xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
            assert.equal(args[0], 'POST');
            assert.include(args[1], '/session/reauth');

            var payload = JSON.parse(
              xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
            );
            assert.equal(Object.keys(payload).length, 2);
            assert.equal(payload.email, email);
            assert.equal(payload.authPW.length, 64);
          }, assert.notOk);
        });
      });

      test('#reauth with keys', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var email = account.input.email;
          var password = account.input.password;

          return respond(
            client.sessionReauth(account.signIn.sessionToken, email, password, {
              keys: true,
            }),
            RequestMocks.sessionReauthWithKeys
          ).then(function(res) {
            assert.ok(res.uid);
            assert.ok(res.verified);
            assert.ok(res.authAt);
            assert.ok(res.keyFetchToken);
            assert.ok(res.unwrapBKey);

            var args =
              xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
            assert.equal(args[0], 'POST');
            assert.include(args[1], '/session/reauth?keys=true');

            var payload = JSON.parse(
              xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
            );
            assert.equal(Object.keys(payload).length, 2);
            assert.equal(payload.email, email);
            assert.equal(payload.authPW.length, 64);
          }, assert.notOk);
        });
      });

      test('#reauth with incorrect password', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var email = account.input.email;
          var password = 'incorrect password';

          return respond(
            client.sessionReauth(account.signIn.sessionToken, email, password),
            ErrorMocks.accountIncorrectPassword
          ).then(
            function() {
              assert.fail();
            },
            function(res) {
              assert.equal(res.code, 400);
              assert.equal(res.errno, 103);
            }
          );
        });
      });

      test('#reauth with incorrect email case', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var numSetupRequests = requests ? requests.length : null;
          var sessionToken = account.signIn.sessionToken;
          var incorrectCaseEmail =
            account.input.email.charAt(0).toUpperCase() +
            account.input.email.slice(1);
          var password = account.input.password;

          respond(ErrorMocks.incorrectEmailCase);
          return respond(
            client.sessionReauth(sessionToken, incorrectCaseEmail, password),
            RequestMocks.sessionReauth
          ).then(function(res) {
            assert.property(res, 'uid');
            assert.property(res, 'verified');
            assert.property(res, 'authAt');

            if (requests) {
              assert.equal(requests.length - numSetupRequests, 2);
            }

            var args =
              xhr.prototype.open.args[xhr.prototype.open.args.length - 2];
            assert.equal(args[0], 'POST');
            assert.include(args[1], '/session/reauth');

            var payload = JSON.parse(
              xhr.prototype.send.args[xhr.prototype.send.args.length - 2][0]
            );
            assert.equal(Object.keys(payload).length, 2);
            assert.equal(payload.email, incorrectCaseEmail);
            assert.equal(payload.authPW.length, 64);

            args = xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
            assert.equal(args[0], 'POST');
            assert.include(args[1], '/session/reauth');

            payload = JSON.parse(
              xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
            );
            assert.equal(Object.keys(payload).length, 3);
            assert.notEqual(payload.email, incorrectCaseEmail);
            assert.equal(payload.originalLoginEmail, incorrectCaseEmail);
            assert.equal(payload.authPW.length, 64);
          }, assert.notOk);
        });
      });

      test('#reauth with incorrect email case with skipCaseError', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var numSetupRequests = requests ? requests.length : null;
          var sessionToken = account.signIn.sessionToken;
          var incorrectCaseEmail =
            account.input.email.charAt(0).toUpperCase() +
            account.input.email.slice(1);
          var password = account.input.password;

          return respond(
            client.sessionReauth(sessionToken, incorrectCaseEmail, password, {
              skipCaseError: true,
            }),
            ErrorMocks.incorrectEmailCase
          ).then(
            function() {
              assert.fail();
            },
            function(res) {
              assert.equal(res.code, 400);
              assert.equal(res.errno, 120);

              if (requests) {
                assert.equal(requests.length - numSetupRequests, 1);
              }

              var args =
                xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
              assert.equal(args[0], 'POST');
              assert.include(args[1], '/session/reauth');

              var payload = JSON.parse(
                xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
              );
              assert.equal(Object.keys(payload).length, 2);
              assert.equal(payload.email, incorrectCaseEmail);
              assert.equal(payload.authPW.length, 64);
            }
          );
        });
      });

      test('#reauth with all the options', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var sessionToken = account.signIn.sessionToken;
          var email = account.input.email;
          var password = account.input.password;
          var options = {
            keys: true,
            metricsContext: {
              entrypoint: 'mock-entrypoint',
              entrypointExperiment: 'mock-entrypoint-experiment',
              entrypointVariation: 'mock-entrypoint-variation',
              utmCampaign: 'mock-utm-campaign',
              utmContent: 'mock-utm-content',
              utmMedium: 'mock-utm-medium',
              utmSource: 'mock-utm-source',
              utmTerm: 'mock-utm-term',
            },
            originalLoginEmail: email.toUpperCase(),
            reason: 'password_change',
            redirectTo: 'http://127.0.0.1',
            resume: 'RESUME_TOKEN',
            service: 'sync',
            verificationMethod: 'email-2fa',
          };

          return respond(
            client.sessionReauth(sessionToken, email, password, options),
            RequestMocks.sessionReauthWithKeys
          ).then(function(res) {
            assert.ok(res.uid);
            assert.ok(res.verified);
            assert.ok(res.authAt);
            assert.ok(res.keyFetchToken);
            assert.ok(res.unwrapBKey);

            var args =
              xhr.prototype.open.args[xhr.prototype.open.args.length - 1];
            assert.equal(args[0], 'POST');
            assert.include(args[1], '/session/reauth?keys=true');

            var payload = JSON.parse(
              xhr.prototype.send.args[xhr.prototype.send.args.length - 1][0]
            );
            assert.equal(Object.keys(payload).length, 9);
            assert.equal(payload.email, email);
            assert.equal(payload.authPW.length, 64);
            assert.deepEqual(payload.metricsContext, options.metricsContext);
            assert.equal(
              payload.originalLoginEmail,
              options.originalLoginEmail
            );
            assert.equal(payload.reason, options.reason);
            assert.equal(payload.redirectTo, options.redirectTo);
            assert.equal(payload.resume, options.resume);
            assert.equal(payload.service, options.service);
            assert.equal(
              payload.verificationMethod,
              options.verificationMethod
            );
          });
        });
      });
    });
  }
});

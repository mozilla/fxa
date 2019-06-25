/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'tests/lib/push-constants',
], function(tdd, assert, Environment, PushTestConstants) {
  with (tdd) {
    suite('signIn', function() {
      var ErrorMocks;
      var RequestMocks;
      var accountHelper;
      var client;
      var mail;
      var respond;
      var requests;

      beforeEach(function() {
        var env = new Environment();
        ErrorMocks = env.ErrorMocks;
        RequestMocks = env.RequestMocks;
        accountHelper = env.accountHelper;
        client = env.client;
        mail = env.mail;
        respond = env.respond;
        requests = env.requests;
      });

      test('#basic', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function() {
            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function(res) {
            assert.ok(res.sessionToken);
          }, assert.notOk);
      });

      test('#with keys', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function(res) {
            return respond(
              client.signIn(email, password, { keys: true }),
              RequestMocks.signInWithKeys
            );
          })
          .then(function(res) {
            assert.ok(res.sessionToken);
            assert.ok(res.keyFetchToken);
            assert.ok(res.unwrapBKey);
          }, assert.notOk);
      });

      test('#with service', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(
          client.signUp(email, password),
          RequestMocks.signUp
        ).then(function() {
          return respond(
            client.signIn(email, password, { service: 'sync' }),
            RequestMocks.signIn
          );
        });
      });

      test('#with reason', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(
          client.signUp(email, password),
          RequestMocks.signUp
        ).then(function() {
          return respond(
            client.signIn(email, password, { reason: 'password_change' }),
            RequestMocks.signIn
          );
        });
      });

      test('#with Sync/redirectTo', function() {
        var user = 'confirm' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          keys: true,
          metricsContext: {
            context: 'fx_desktop_v2',
          },
          redirectTo: 'http://sync.127.0.0.1/after_reset',
          service: 'sync',
        };

        return respond(
          client.signUp(email, password, { preVerified: true }),
          RequestMocks.signUp
        )
          .then(function() {
            return respond(
              client.signIn(email, password, opts),
              RequestMocks.signIn
            );
          })
          .then(function(res) {
            assert.ok(res.uid);
            return respond(
              mail.wait(user),
              RequestMocks.mailServiceAndRedirect
            );
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var redirectTo = emails[0].html.match(
              /redirectTo=([A-Za-z0-9]+)/
            )[1];

            assert.ok(code, 'code is returned');
            assert.ok(redirectTo, 'redirectTo is returned');
          }, assert.notOk);
      });

      test('#with Sync/resume', function() {
        var user = 'confirm' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          keys: true,
          metricsContext: {
            context: 'fx_desktop_v2',
          },
          redirectTo: 'http://sync.127.0.0.1/after_reset',
          resume: 'resumejwt',
          service: 'sync',
        };

        return respond(
          client.signUp(email, password, { preVerified: true }),
          RequestMocks.signUp
        )
          .then(function() {
            return respond(
              client.signIn(email, password, opts),
              RequestMocks.signIn
            );
          })
          .then(function(res) {
            assert.ok(res.uid);
            return respond(
              mail.wait(user),
              RequestMocks.mailServiceAndRedirect
            );
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];

            assert.ok(code, 'code is returned');
            assert.ok(resume, 'resume is returned');
          }, assert.notOk);
      });

      test('#incorrect email case', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var numSetupRequests = requests ? requests.length : null;
          var incorrectCaseEmail =
            account.input.email.charAt(0).toUpperCase() +
            account.input.email.slice(1);

          respond(ErrorMocks.incorrectEmailCase);
          return respond(
            client.signIn(incorrectCaseEmail, account.input.password),
            RequestMocks.signIn
          ).then(function(res) {
            assert.property(res, 'sessionToken');
            if (requests) {
              assert.equal(requests.length - numSetupRequests, 2);
            }
          }, assert.notOk);
        });
      });

      test('#incorrect email case with skipCaseError', function() {
        return accountHelper.newVerifiedAccount().then(function(account) {
          var numSetupRequests = requests ? requests.length : null;
          var incorrectCaseEmail =
            account.input.email.charAt(0).toUpperCase() +
            account.input.email.slice(1);

          return respond(
            client.signIn(incorrectCaseEmail, account.input.password, {
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
            }
          );
        });
      });

      test('#incorrectPassword', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.signIn(account.input.email, 'wrong password'),
              ErrorMocks.accountIncorrectPassword
            );
          })
          .then(
            function() {
              assert.fail();
            },
            function(res) {
              assert.equal(res.code, 400);
              assert.equal(res.errno, 103);
            }
          );
      });

      test('#with metricsContext metadata', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function() {
            return respond(
              client.signIn(email, password, {
                metricsContext: {},
                reason: 'signin',
              }),
              RequestMocks.signIn
            );
          })
          .then(function(resp) {
            assert.ok(resp);
          }, assert.notOk);
      });
    });
  }
});

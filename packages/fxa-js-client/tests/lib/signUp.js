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
    suite('signUp', function() {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var ErrorMocks;
      var xhr;
      var xhrOpen;
      var xhrSend;

      beforeEach(function() {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
        xhr = env.xhr;
        xhrOpen = sinon.spy(xhr.prototype, 'open');
        xhrSend = sinon.spy(xhr.prototype, 'send');
      });

      afterEach(function() {
        xhrOpen.restore();
        xhrSend.restore();
      });

      test('#basic', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(
          client.signUp(email, password),
          RequestMocks.signUp
        ).then(function(res) {
          assert.property(res, 'uid', 'uid should be returned on signUp');
          assert.property(
            res,
            'sessionToken',
            'sessionToken should be returned on signUp'
          );
          assert.notProperty(
            res,
            'keyFetchToken',
            'keyFetchToken should not be returned on signUp'
          );

          assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
          assert.include(
            xhrOpen.args[0][1],
            '/account/create',
            'path is correct'
          );
          var sentData = JSON.parse(xhrSend.args[0][0]);
          assert.equal(Object.keys(sentData).length, 2);
          assert.equal(sentData.email, email, 'email is correct');
          assert.equal(sentData.authPW.length, 64, 'length of authPW');
        }, assert.notOk);
      });

      test('#withKeys', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          keys: true,
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUpKeys
        ).then(function(res) {
          assert.property(res, 'uid', 'uid should be returned on signUp');
          assert.property(
            res,
            'sessionToken',
            'sessionToken should be returned on signUp'
          );
          assert.property(
            res,
            'keyFetchToken',
            'keyFetchToken should be returned on signUp'
          );
          assert.property(
            res,
            'unwrapBKey',
            'unwrapBKey should be returned on signUp'
          );

          assert.equal(xhrOpen.args[0][0], 'POST', 'method is correct');
          assert.include(
            xhrOpen.args[0][1],
            '/account/create?keys=true',
            'path is correct'
          );
        }, assert.notOk);
      });

      test('#create account with service, redirectTo, style, and resume', function() {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.127.0.0.1/after_reset',
          resume: 'resumejwt',
          style: 'trailhead',
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
          .then(function(res) {
            assert.ok(res.uid);
            return respond(
              mail.wait(user),
              RequestMocks.mailServiceAndRedirect
            );
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];
            var redirectTo = emails[0].html.match(
              /redirectTo=([A-Za-z0-9]+)/
            )[1];
            var resume = emails[0].html.match(/resume=([A-Za-z0-9]+)/)[1];
            var style = emails[0].html.match(/style=trailhead/)[0];

            assert.ok(code, 'code is returned');
            assert.ok(service, 'service is returned');
            assert.ok(redirectTo, 'redirectTo is returned');
            assert.ok(resume, 'resume is returned');
            assert.ok(style, 'style is returned');

            assert.include(
              xhrOpen.args[0][1],
              '/account/create',
              'path is correct'
            );
            var sentData = JSON.parse(xhrSend.args[0][0]);
            assert.equal(Object.keys(sentData).length, 6);
            assert.equal(sentData.email, email, 'email is correct');
            assert.equal(sentData.authPW.length, 64, 'length of authPW');
            assert.equal(sentData.service, opts.service);
            assert.equal(sentData.resume, opts.resume);
            assert.equal(sentData.redirectTo, opts.redirectTo);
            assert.equal(sentData.style, opts.style);
          }, assert.notOk);
      });

      test('#withService', function() {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          service: 'sync',
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
          .then(function(res) {
            assert.ok(res.uid);
            return respond(
              mail.wait(user),
              RequestMocks.mailServiceAndRedirect
            );
          })
          .then(function(emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];

            assert.ok(code, 'code is returned');
            assert.ok(service, 'service is returned');
          }, assert.notOk);
      });

      test('#withRedirectTo', function() {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          redirectTo: 'http://sync.127.0.0.1/after_reset',
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
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

      test('#withResume', function() {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          resume: 'resumejwt',
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
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

      test('#preVerified', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          preVerified: true,
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
          .then(function(res) {
            assert.ok(res.uid);

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function(res) {
            assert.equal(res.verified, true, '== account is verified');
          });
      });

      test('#withStyle', function() {
        var user = 'test' + new Date().getTime();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var opts = {
          style: 'trailhead',
        };

        return respond(
          client.signUp(email, password, opts),
          RequestMocks.signUp
        )
          .then(function(res) {
            assert.ok(res.uid);
            return respond(
              mail.wait(user),
              RequestMocks.mailServiceAndRedirect
            );
          })
          .then(function(emails) {
            var style = emails[0].html.match(/style=trailhead/)[0];
            assert.ok(style, 'style is returned');
          }, assert.notOk);
      });

      test('#accountExists', function() {
        return accountHelper
          .newVerifiedAccount()
          .then(function(account) {
            return respond(
              client.signUp(account.input.email, 'somepass'),
              ErrorMocks.accountExists
            );
          })
          .then(
            function(res) {
              assert.fail();
            },
            function(err) {
              assert.equal(err.code, 400);
              assert.equal(err.errno, 101);
            }
          );
      });

      test('#with metricsContext metadata', function() {
        var email = 'test' + new Date().getTime() + '@restmail.net';
        var password = 'iliketurtles';

        return respond(
          client.signUp(email, password, {
            metricsContext: {
              deviceId: '0123456789abcdef0123456789abcdef',
              flowId:
                '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              flowBeginTime: Date.now(),
              utmCampaign: 'mock-campaign',
              utmContent: 'mock-content',
              utmMedium: 'mock-medium',
              utmSource: 'mock-source',
              utmTerm: 'mock-term',
              forbiddenProperty: 666,
            },
          }),
          RequestMocks.signUp
        ).then(function(resp) {
          assert.ok(resp);
        }, assert.notOk);
      });
    });
  }
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('signUp', function () {
      var accountHelper;
      var respond;
      var mail;
      var client;
      var RequestMocks;
      var ErrorMocks;

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
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(
            function (res) {
              assert.property(res, 'uid', 'uid should be returned on signUp');
              assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
              assert.notProperty(res, 'keyFetchToken', 'keyFetchToken should not be returned on signUp');
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#withKeys', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var opts = {
          keys: true
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUpKeys)
          .then(
            function (res) {
              assert.property(res, 'uid', 'uid should be returned on signUp');
              assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
              assert.property(res, 'keyFetchToken', 'keyFetchToken should be returned on signUp');
            },
            function () {
              assert.fail();
            }
          );
      });

      test('#create account with service and redirectTo', function () {
        var user = "test" + Date.now();
        var email = user + "@restmail.net";
        var password = "iliketurtles";
        var opts = {
          service: 'sync',
          redirectTo: 'https://sync.firefox.com/after_reset'
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

              assert.ok(code, 'code is returned');
              assert.ok(service, 'service is returned');
              assert.ok(redirectTo, 'redirectTo is returned');

            },
            function () {
              assert.fail();
            }
          );
      });

      test('#withService', function () {
        var user = "test" + Date.now();
        var email = user + "@restmail.net";
        var password = "iliketurtles";
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
            function () {
              assert.fail();
            }
          );
      });

      test('#withRedirectTo', function () {
        var user = "test" + Date.now();
        var email = user + "@restmail.net";
        var password = "iliketurtles";
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
            function () {
              assert.fail();
            }
          );
      });

      test('#preVerified', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
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

    });
  }
});

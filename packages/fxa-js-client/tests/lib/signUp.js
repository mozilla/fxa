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
  'tests/addons/restmail',
  'tests/addons/accountHelper'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Restmail, AccountHelper) {

  with (tdd) {
    suite('signUp', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
        'http://127.0.0.1:9001' :
        'http://restmail.net';
      var client;
      var respond;
      var mail;
      var accountHelper;

      function noop(val) { return val; }

      beforeEach(function () {
        var xhr;

        if (useRemoteServer) {
          xhr = XHR.XMLHttpRequest;
          respond = noop;
        } else {
          var requests = [];
          xhr = SinonResponder.useFakeXMLHttpRequest();
          xhr.onCreate = function (xhr) {
            requests.push(xhr);
          };
          respond = SinonResponder.makeMockResponder(requests);
        }
        client = new FxAccountClient(authServerUrl, { xhr: xhr });
        mail = new Restmail(mailServerUrl, xhr);
        accountHelper = new AccountHelper(client, mail, respond);
      });

      /**
       * Sign Up
       */
      test('#create account', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (res) {
            assert.property(res, 'uid', 'uid should be returned on signUp');
            assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
            assert.notProperty(res, 'keyFetchToken', 'keyFetchToken should not be returned on signUp');
          });
      });

      test('#create account with keys', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var opts = {
          keys: true
        };

        return respond(client.signUp(email, password, opts), RequestMocks.signUpKeys)
          .then(function (res) {
            assert.property(res, 'uid', 'uid should be returned on signUp');
            assert.property(res, 'sessionToken', 'sessionToken should be returned on signUp');
            assert.property(res, 'keyFetchToken', 'keyFetchToken should be returned on signUp');
          });
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
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];
            var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];

            assert.ok(code, 'code is returned');
            assert.ok(service, 'service is returned');
            assert.ok(redirectTo, 'redirectTo is returned');

          });
      });

      test('#create account with service', function () {
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
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var service = emails[0].html.match(/service=([A-Za-z0-9]+)/)[1];

            assert.ok(code, 'code is returned');
            assert.ok(service, 'service is returned');

          });
      });

      test('#create account with redirectTo', function () {
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
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            var redirectTo = emails[0].html.match(/redirectTo=([A-Za-z0-9]+)/)[1];

            assert.ok(code, 'code is returned');
            assert.ok(redirectTo, 'redirectTo is returned');

          });
      });

      test('#create account emailVerified', function () {
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

    });
  }
});

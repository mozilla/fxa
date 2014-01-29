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
  'tests/addons/accountHelper',
  'client/lib/errors'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Restmail, AccountHelper, ERRORS) {

  with (tdd) {
    suite('signIn', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
        'http://127.0.0.1:9001' :
        'http://restmail.net';
      var client;
      var mail;
      var respond;
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

      test('#basic', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function () {

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });
      });

      test('#with keys', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (res) {
            return respond(client.signIn(email, password, {keys: true}), RequestMocks.signInWithKeys);
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
            assert.ok(res.keyFetchToken);
            assert.ok(res.unwrapBKey);
            return true;
          });
      });

      test('#incorrect email case', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client.signIn(incorrectCaseEmail, account.input.password), RequestMocks.signIn);
          })
          .then(
          function (res) {
            assert.property(res, 'sessionToken');
            return true;
          },
          function (res) {
            assert.notEqual(res.code, 400);
            assert.notEqual(res.errno, ERRORS.INCORRECT_EMAIL_CASE);
          }
        );
      });

      test('#bad signIn', function () {

          return accountHelper.newVerifiedAccount()
              .then(function (account) {
                  return respond(client.signIn(account.input.email, 'wrong password'), RequestMocks.signInFailurePassword);
              })
              .then(
              function (res) {
                  assert.notProperty(res, 'sessionToken');
              },
              function (res) {
                  assert.equal(res.code, 400);
                  assert.equal(res.errno, 103);
              }
          );
      });
    });
  }
});

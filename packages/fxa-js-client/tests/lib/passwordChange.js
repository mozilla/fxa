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
  'tests/addons/restmail'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Request, Restmail) {

  with (tdd) {
    suite('passwordChange', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
        'http://127.0.0.1:9001' :
        'http://restmail.net';
      var client;
      var respond;
      var mail;

      function noop(val) { return val; }

      if (!useRemoteServer) {
        console.log("Running with mocks..");
      } else {
        console.log("Running against " + authServerUrl);
      }

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
      });

      /**
       * Changing the Password
       */
      test('#passwordChange', function () {
        var user = 'test7' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
          })
          .then(function () {
            return respond(client._passwordChangeStart(email, password), RequestMocks.passwordChangeStart);
          })
          .then(function (oldCreds) {

            return respond(client._passwordChangeFinish(email, newPassword, oldCreds), RequestMocks.passwordChangeFinish);
          })
          .then(function (result) {
            assert.ok(result, '{}');

            return respond(client.signIn(email, newPassword), RequestMocks.signIn);
          })
          .then(
            function (res) {
              assert.ok(res.sessionToken);

              return true;
            },
            function (error) {
              console.log(error);
              assert.equal(error, null, '== no errors');

              return error;
            }
          )
      });

      /**
       * Changing the Password failure
       */
      test('#passwordChangeFail', function () {
        var user = 'test8' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var newPassword = 'ilikefoxes';
        var wrongPassword = '12345678';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
          })
          .then(function () {
            return respond(client._passwordChangeStart(email, password), RequestMocks.passwordChangeStart);
          })
          .then(function (oldCreds) {

            return respond(client._passwordChangeFinish(email, newPassword, oldCreds), RequestMocks.passwordChangeFinish);
          })
          .then(function (result) {
            assert.ok(result, '{}');

            return respond(client.signIn(email, wrongPassword), RequestMocks.signInFailurePassword);
          })
          .then(
          function (res) {
          },
          function (error) {
            assert.ok(error, '== error should happen');
            assert.equal(error.message, 'Incorrect password', '== Password is incorrect');
            assert.equal(error.code, 400, '== Correct status code');

            return error;
          }
        )
      });
    });
  }
});

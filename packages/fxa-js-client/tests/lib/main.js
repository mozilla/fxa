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
  'tests/addons/restmail'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Restmail) {

  with (tdd) {
    suite('fxa client', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
                            'http://127.0.0.1:9001' :
                            'http://restmail.net';
      var client;
      var mail;
      var respond;

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
      });

      /**
       * Verify Email
       */
      test('#verify email', function () {
        var user = 'test3' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned");

            return respond(client.verifyCode(uid, code), RequestMocks.verifyCode);
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

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            return respond(client.signIn(email, password), RequestMocks.signIn);
          })
          .then(function (result) {
            assert.ok(result.sessionToken, "sessionToken is returned");
            sessionToken = result.sessionToken;

            return respond(client.recoveryEmailStatus(sessionToken),
                    RequestMocks.recoveryEmailUnverified);
          })
          .then(function (result) {
            assert.equal(result.verified, false, "Email should not be verified.");

            return respond(mail.wait(user), RequestMocks.mail);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned: " + code);

            return respond(client.verifyCode(uid, code),
                    RequestMocks.verifyCode);
          })
          .then(function (result) {

            return respond(client.recoveryEmailStatus(sessionToken),
                    RequestMocks.recoveryEmailVerified);
          })
          .then(function (result) {
            assert.equal(result.verified, true, "Email should be verified.");
            return true;
          })
      });
    });
  }
});

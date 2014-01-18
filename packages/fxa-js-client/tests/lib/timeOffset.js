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
  'client/lib/request',
  'client/lib/hawkCredentials'
], function (config, tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Restmail, AccountHelper, Request, hawkCredentials) {

  with (tdd) {
    suite('fxa client', function () {
      var authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
      var useRemoteServer = !!config.AUTH_SERVER_URL;
      var mailServerUrl = authServerUrl.match(/^http:\/\/127/) ?
                            'http://127.0.0.1:9001' :
                            'http://restmail.net';
      var mail;
      var respond;
      var xhr;
      var sessionToken;

      function noop(val) { return val; }

      if (!useRemoteServer) {
        console.log("Running with mocks..");
      } else {
        console.log("Running against " + authServerUrl);
      }

      beforeEach(function () {
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
        mail = new Restmail(mailServerUrl, xhr);
      });

      test('#create a session', function () {
        var client = new FxAccountClient(authServerUrl, { xhr: xhr });
        accountHelper = new AccountHelper(client, mail, respond);

        return accountHelper.newUnverifiedAccount()
          .then(function (account) {
            sessionToken = account.signIn.sessionToken;
            assert.ok(sessionToken);
          });
      });

      test('#request with a skewed clock', function () {
        var request = new Request(authServerUrl, xhr, { localtimeOffsetMsec: 6000001 });

        return hawkCredentials(sessionToken, 'sessionToken', 2 * 32)
          .then(function (creds) {
            return respond(request.send('/recovery_email/status', 'GET', creds, null, true), RequestMocks.invalidTimestamp);
          })
          .then(function (res) {
            assert.fail();
          }, function (err) {
            assert.equal(err.errno, 111);
          });
      });

      test('#request with a skewed clock using retry', function () {
        var request = new Request(authServerUrl, xhr, { localtimeOffsetMsec: 6000001 });

        return hawkCredentials(sessionToken, 'sessionToken', 2 * 32)
          .then(function (creds) {
            return respond(request.send('/recovery_email/status', 'GET', creds, null, false), RequestMocks.recoveryEmailUnverified);
          })
          .then(function (res) {
            assert.ok(res);
          });
      });

      test('#authenticated request with skewed clock', function () {
        var client = new FxAccountClient(authServerUrl, { xhr: xhr, localtimeOffsetMsec: 6000001 });
        return respond(client.recoveryEmailStatus(sessionToken), RequestMocks.recoveryEmailUnverified)
          .then(function (res) {
            assert.ok(res);
          });
      });

    });
  }
});

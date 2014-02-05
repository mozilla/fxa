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
    suite('certificateSign', function () {
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
       * Destroy Session
       */
      test('#sign', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            var publicKey = {
                "algorithm":"RS",
                "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
                "e":"65537"
            };
            var duration = 86400000;

            return respond(client.certificateSign(account.signIn.sessionToken, publicKey, duration), RequestMocks.certificateSign)
          })
          .then(
            function(res) {
              assert.property(res, 'cert', 'got cert');
            },
            function(error) {
              assert.isNull(error);
            }
          );
      });

    });
  }
});

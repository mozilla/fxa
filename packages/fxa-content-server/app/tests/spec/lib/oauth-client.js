/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'jquery',
  '../../lib/helpers',
  'sinon',
  'lib/session',
  'lib/oauth-client',
  'lib/oauth-errors',
  'lib/constants'
],
// FxaClientWrapper is the object that is used in
// fxa-content-server views. It wraps FxaClient to
// take care of some app-specific housekeeping.
function (chai, $, testHelpers, sinon,
              Session, OAuthClient, OAuthErrors, Constants) {
  /*global beforeEach, afterEach, describe, it*/
  var OAUTH_URL = 'http://127.0.0.1:9010';
  var RP_URL = 'http://127.0.0.1:8080/api/oauth';
  var assert = chai.assert;
  var client;
  var server;

  describe('lib/oauth-client', function () {
    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.autoRespond = true;
      Session.clear();

      client = new OAuthClient({
        oauthUrl: OAUTH_URL
      });
    });

    afterEach(function () {
      server.restore();
      Session.clear();
    });

    describe('oauth-client', function () {
      it('calls getCode', function () {
        /* jshint camelcase: false */
        var redirect = RP_URL + '?code=code&state=state';

        server.respondWith('POST', OAUTH_URL + '/v1/authorization',
          [200, { 'Content-Type': 'application/json' },
            '{ "redirect": "' + redirect + '" }']);

        var params = {
          assertion: 'assertion',
          client_id: 'deadbeef',
          redirect_uri: 'http://example.com',
          scope: 'profile',
          state: 'state'
        };

        return client.getCode(params)
          .then(function (result) {
            assert.ok(result);
            assert.equal(result.redirect, redirect);
          });
      });

      it('calls getClientInfo', function () {
        var clientId = 'clientId';

        server.respondWith('GET', OAUTH_URL + '/v1/client/' + clientId,
          [200, { 'Content-Type': 'application/json' },
            '{ "name": "MozRP", "imageUri": "https://mozilla.org/firefox.png" }']);

        return client.getClientInfo(clientId)
          .then(function (result) {
            assert.ok(result);
            assert.equal(result.name, 'MozRP');
          });
      });

    });

  });
});


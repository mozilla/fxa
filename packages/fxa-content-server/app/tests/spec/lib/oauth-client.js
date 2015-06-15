/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

define([
  'chai',
  'sinon',
  'lib/oauth-client',
  'lib/oauth-errors',
  'lib/xhr',
  'lib/promise'
],
// FxaClientWrapper is the object that is used in
// fxa-content-server views. It wraps FxaClient to
// take care of some app-specific housekeeping.
function (chai, sinon, OAuthClient, OAuthErrors, Xhr, p) {
  /*global beforeEach, afterEach, describe, it*/

  var OAUTH_URL = 'http://127.0.0.1:9010';
  var RP_URL = 'http://127.0.0.1:8080/api/oauth';
  var assert = chai.assert;
  var client;
  var server;
  var xhr;

  describe('lib/oauth-client', function () {
    /* jshint camelcase: false */

    beforeEach(function () {
      server = sinon.fakeServer.create();
      server.autoRespond = true;

      // Xhr does not have a constructor, so use Object.create.
      xhr = Object.create(Xhr);

      client = new OAuthClient({
        oAuthUrl: OAUTH_URL,
        xhr: xhr
      });
    });

    afterEach(function () {
      server.restore();
    });

    describe('_request', function () {
      it('calls an endpoint', function () {
        sinon.stub(xhr, 'post', function () {
          return p({
            ok: true
          });
        });

        var params = {};
        return client._request('post', '/v1/authorization', params)
          .then(function (resp)  {
            assert.isTrue(xhr.post.calledWith(OAUTH_URL + '/v1/authorization', params));
            assert.isTrue(resp.ok);
          });
      });

      it('converts returned errors to OAuthErrors', function () {
        sinon.stub(xhr, 'post', function () {
          return p.reject({
            responseJSON: {
              errno: OAuthErrors.toErrno('UNKNOWN_CLIENT'),
              code: 400
            }
          });
        });

        var params = {};
        return client._request('post', '/v1/authorization', params)
          .then(assert.fail, function (err) {
            assert.isTrue(xhr.post.calledWith(OAUTH_URL + '/v1/authorization', params));
            assert.isTrue(OAuthErrors.is(err, 'UNKNOWN_CLIENT'));
          });
      });
    });

    /* jshint camelcase: false */
    describe('getCode', function () {
      var params = {
        assertion: 'assertion',
        client_id: 'deadbeef',
        redirect_uri: 'http://example.com',
        scope: 'profile',
        state: 'state'
      };

      it('responds with a redirect', function () {
        var redirect = RP_URL + '?code=code&state=state';

        sinon.stub(client, '_request', function () {
          return p({
            redirect: redirect
          });
        });

        return client.getCode(params)
          .then(function (result) {
            assert.isTrue(client._request.calledWith('post', '/v1/authorization'));

            assert.equal(result.redirect, redirect);
          });
      });
    });

    describe('getClientInfo', function () {
      var clientId = 'clientId';

      it('response with a name and imageUri', function () {
        sinon.stub(client, '_request', function () {
          return p({
            name: 'MozRP',
            imageUri: 'https://mozilla.org/firefox.png'
          });
        });

        return client.getClientInfo(clientId)
          .then(function (result) {
            assert.isTrue(client._request.calledWith('get', '/v1/client/' + clientId));
            assert.ok(result);
            assert.equal(result.name, 'MozRP');
          });
      });
    });

    describe('getToken', function () {
      it('responds with a token', function () {
        var token = 'access token';

        sinon.stub(client, '_request', function () {
          return p({
            scope: 'profile',
            token_type: 'bearer',
            access_token: token
          });
        });

        var params = {
          assertion: 'assertion',
          client_id: 'deadbeef',
          scope: 'profile'
        };

        return client.getToken(params)
          .then(function (result) {
            assert.isTrue(client._request.calledWith('post', '/v1/authorization'));
            assert.ok(result);

            assert.equal(result.access_token, token);
          });
      });
    });

    describe('destroyToken', function () {
      it('destroys a token', function () {
        sinon.stub(client, '_request', function () {
          return p({});
        });

        return client.destroyToken('token')
          .then(function () {
            assert.isTrue(client._request.calledWith('post', '/v1/destroy'));
          });
      });
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const OAuthClient = require('lib/oauth-client');
  const OAuthErrors = require('lib/oauth-errors');
  const sinon = require('sinon');
  const Xhr = require('lib/xhr');

  var OAUTH_URL = 'http://127.0.0.1:9010';
  var RP_URL = 'http://127.0.0.1:8080/api/oauth';
  var assert = chai.assert;
  var client;
  var server;
  var xhr;

  describe('lib/oauth-client', function () {
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
        sinon.stub(xhr, 'post').callsFake(function () {
          return Promise.resolve({
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
        sinon.stub(xhr, 'post').callsFake(function () {
          return Promise.reject({
            responseJSON: {
              code: 400,
              errno: OAuthErrors.toErrno('UNKNOWN_CLIENT')
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

    describe('getCode', function () {
      var params = {
        assertion: 'assertion',
        client_id: 'deadbeef', //eslint-disable-line camelcase
        redirect_uri: 'http://example.com', //eslint-disable-line camelcase
        scope: 'profile',
        state: 'state'
      };

      it('responds with a redirect', function () {
        var redirect = RP_URL + '?code=code&state=state';

        sinon.stub(client, '_request').callsFake(function () {
          return Promise.resolve({
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
        sinon.stub(client, '_request').callsFake(function () {
          return Promise.resolve({
            imageUri: 'https://mozilla.org/firefox.png',
            name: 'MozRP'
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

    describe('getClientKeyData', () => {
      const scope = 'https://identity.mozilla.com/apps/sample-scope-can-scope-key';
      const params = {
        assertion: 'eyJhbGciOiJSUzI1NiJ9.eyJwdWJsaWM1NiJ9.eyJhdWQiOiJvYXV0aC5meGEiLCJleHA',
        client_id: 'aaa6b9b3a65a1871', //eslint-disable-line camelcase
        scope: scope
      };

      it('response with scope key data', () => {
        sinon.stub(client, '_request').callsFake(function () {
          return Promise.resolve({
            [scope]: {
              identifier: scope,
              keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
              keyRotationTimestamp: 1506970363512
            }
          });
        });

        return client.getClientKeyData(params)
          .then(function (result) {
            assert.isTrue(client._request.calledWith('post', '/v1/key-data'));
            assert.ok(result);
            assert.equal(result[scope].keyRotationTimestamp, 1506970363512);
          });
      });
    });

    describe('getToken', function () {
      it('responds with a token', function () {
        var token = 'access token';

        sinon.stub(client, '_request').callsFake(function () {
          return Promise.resolve({
            access_token: token, //eslint-disable-line camelcase
            scope: 'profile',
            token_type: 'bearer' //eslint-disable-line camelcase
          });
        });

        var params = {
          assertion: 'assertion',
          client_id: 'deadbeef', //eslint-disable-line camelcase
          scope: 'profile'
        };

        return client.getToken(params)
          .then(function (result) {
            assert.isTrue(client._request.calledWith('post', '/v1/authorization'));
            assert.equal(client._request.args[0][2].client_id, 'deadbeef', 'correctly sets client_id');
            assert.equal(client._request.args[0][2].ttl, '300', 'correctly sets TTL');
            assert.ok(result);

            assert.equal(result.access_token, token);
          });
      });
    });

    describe('destroyToken', function () {
      it('destroys a token', function () {
        sinon.stub(client, '_request').callsFake(function () {
          return Promise.resolve({});
        });

        return client.destroyToken('token')
          .then(function () {
            assert.isTrue(client._request.calledWith('post', '/v1/destroy'));
          });
      });
    });

    describe('fetchOAuthApps', function () {
      it('fetches OAuth Apps', function () {
        sinon.stub(client._xhr, 'oauthAjax').callsFake(function () {
          return Promise.resolve({});
        });

        return client.fetchOAuthApps('token')
          .then(function () {
            assert.isTrue(xhr.oauthAjax.calledWith({
              accessToken: 'token',
              type: 'get',
              url: OAUTH_URL + '/v1/client-tokens'
            }));
          });
      });
    });

    describe('destroyOAuthApp', function () {
      it('deletes OAuth Apps', function () {
        sinon.stub(client._xhr, 'oauthAjax').callsFake(function () {
          return Promise.resolve({});
        });

        return client.destroyOAuthApp('token', 'id')
          .then(function () {
            assert.isTrue(xhr.oauthAjax.calledWith({
              accessToken: 'token',
              type: 'delete',
              url: OAUTH_URL + '/v1/client-tokens/id'
            }));
          });
      });
    });

  });
});

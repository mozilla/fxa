/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var OAuthClient = require('lib/oauth-client');
  var OAuthErrors = require('lib/oauth-errors');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var Xhr = require('lib/xhr');

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

    describe('getToken', function () {
      it('responds with a token', function () {
        var token = 'access token';

        sinon.stub(client, '_request', function () {
          return p({ //eslint-disable-line camelcase
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import OAuthClient from 'lib/oauth-client';
import OAuthErrors from 'lib/oauth-errors';
import sinon from 'sinon';
import Xhr from 'lib/xhr';

var OAUTH_URL = 'http://127.0.0.1:9010';
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

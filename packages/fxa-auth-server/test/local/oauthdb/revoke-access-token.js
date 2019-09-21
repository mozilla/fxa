/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const error = require('../../../lib/error');
const oauthdbModule = require('../../../lib/oauthdb');
const { mockLog } = require('../../mocks');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  oauth: {
    url: 'https://oauth.server.com',
    secretKey: 'secret-key-oh-secret-key',
  },
  domain: 'accounts.example.com',
};
const mockOAuthServer = nock(mockConfig.oauth.url).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

const CLIENT_ID = '0123456789ABCDEF';
const CLIENT_SECRET = '00001111222233334444555566667777';
const ACCESS_TOKEN =
  'DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF';

describe('oauthdb/revokeAccessToken', () => {
  let oauthdb;

  afterEach(async () => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
    if (oauthdb) {
      await oauthdb.close();
    }
  });

  it('can revoke a refresh token', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => {
        assert.deepEqual(body, {
          token: ACCESS_TOKEN,
        });
        return true;
      })
      .reply(200, {});
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const resp = await oauthdb.revokeAccessToken(ACCESS_TOKEN);
    assert.ok(resp);
  });

  it('accepts optional client credentials', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => {
        assert.deepEqual(body, {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          token: ACCESS_TOKEN,
        });
        return true;
      })
      .reply(200, {});
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const resp = await oauthdb.revokeAccessToken(ACCESS_TOKEN, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    assert.ok(resp);
  });

  it('correctly maps "invalid token" error', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => true)
      .reply(400, {
        code: 400,
        errno: 108,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.revokeAccessToken(ACCESS_TOKEN);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
    }
  });

  it('correctly maps "unknown client" error', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => true)
      .reply(400, {
        code: 400,
        errno: 101,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.revokeAccessToken(ACCESS_TOKEN, {
        client_id: CLIENT_ID,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.UNKNOWN_CLIENT_ID);
    }
  });

  it('correctly maps "incorrect client secret" error', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => true)
      .reply(400, {
        code: 400,
        errno: 102,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.revokeAccessToken(ACCESS_TOKEN, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INCORRECT_CLIENT_SECRET);
    }
  });
});

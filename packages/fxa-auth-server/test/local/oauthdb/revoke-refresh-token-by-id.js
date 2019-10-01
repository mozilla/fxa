/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
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
const REFRESH_TOKEN_ID = 'DEADBEEFDEADBEEFDEADBEEFDEADBEEF';

describe('oauthdb/revokeRefreshTokenById', () => {
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

  it('can revoke a token by id', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => {
        assert.deepEqual(body, {
          refresh_token_id: REFRESH_TOKEN_ID,
        });
        return true;
      })
      .reply(200, {});
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const resp = await oauthdb.revokeRefreshTokenById(REFRESH_TOKEN_ID);
    assert.ok(resp);
  });

  it('accepts optional client credentials', async () => {
    mockOAuthServer
      .post('/v1/destroy', body => {
        assert.deepEqual(body, {
          client_id: CLIENT_ID,
          refresh_token_id: REFRESH_TOKEN_ID,
        });
        return true;
      })
      .reply(200, {});
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const resp = await oauthdb.revokeRefreshTokenById(REFRESH_TOKEN_ID, {
      client_id: CLIENT_ID,
    });
    assert.ok(resp);
  });
});

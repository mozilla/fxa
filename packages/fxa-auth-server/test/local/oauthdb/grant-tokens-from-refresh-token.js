/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const oauthdbModule = require('../../../lib/oauthdb');
const error = require('../../../lib/error');
const { mockLog } = require('../../mocks');

const MOCK_CLIENT_ID = '0123456789ABCDEF';
const MOCK_ACCESS_TOKEN =
  'aaaaaa2222223333334444445555556611111122222233333344444455555566';
const MOCK_REFRESH_TOKEN =
  'bbbbbb2222223333334444445555556611111122222233333344444455555566';
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

describe('oauthdb/grantTokensFromRefreshToken', () => {
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

  it('can get new tokens from a refresh token', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(200, {
        access_token: MOCK_ACCESS_TOKEN,
        scope: '',
        token_type: 'bearer',
        expires_in: 123,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.grantTokensFromRefreshToken({
      client_id: MOCK_CLIENT_ID,
      client_secret: MOCK_CLIENT_ID,
      refresh_token: MOCK_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });
    assert.deepEqual(res, {
      access_token: MOCK_ACCESS_TOKEN,
      scope: '',
      token_type: 'bearer',
      expires_in: 123,
    });
  });

  it('accepts optional parameters', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(200, {
        access_token: MOCK_ACCESS_TOKEN,
        scope: '',
        token_type: 'bearer',
        expires_in: 123,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.grantTokensFromRefreshToken({
      client_id: MOCK_CLIENT_ID,
      refresh_token: MOCK_REFRESH_TOKEN,
      grant_type: 'refresh_token',
      scope: 'profile oldsync',
      ttl: 234,
    });
    assert.deepEqual(res, {
      access_token: MOCK_ACCESS_TOKEN,
      scope: '',
      token_type: 'bearer',
      expires_in: 123,
    });
  });

  it('requires explicit grant_type parameter', async () => {
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromRefreshToken({
        client_id: MOCK_CLIENT_ID,
        refresh_token: MOCK_REFRESH_TOKEN,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
    }
  });
});

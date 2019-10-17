/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const oauthdbModule = require('../../../lib/oauthdb');
const { mockLog } = require('../../mocks');

const MOCK_CLIENT_ID = '0123456789ABCDEF';
const MOCK_ACCESS_TOKEN =
  'aaaaaa2222223333334444445555556611111122222233333344444455555566';
const MOCK_REFRESH_TOKEN =
  'bbbbbb2222223333334444445555556611111122222233333344444455555566';
const MOCK_ID_TOKEN = 'ABABABABABABABABABABABABABABABABABABABABABABABABAB';
const mockSessionToken = {
  emailVerified: true,
  tokenVerified: true,
  uid: 'ABCDEF123456',
  lastAuthAt: () => Date.now(),
  authenticationMethods: ['pwd', 'email'],
};
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

describe('oauthdb/grantTokensFromSessionToken', () => {
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

  it('can grant oauth tokens directly from a sessionToken', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(200, {
        access_token: MOCK_ACCESS_TOKEN,
        scope: 'test1',
        token_type: 'bearer',
        expires_in: 123,
        auth_at: 123456,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.grantTokensFromSessionToken(mockSessionToken, {
      client_id: MOCK_CLIENT_ID,
      scope: 'test1',
    });
    assert.deepEqual(res, {
      access_token: MOCK_ACCESS_TOKEN,
      scope: 'test1',
      token_type: 'bearer',
      expires_in: 123,
      auth_at: 123456,
    });
  });

  it('accepts optional parameters', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(200, {
        access_token: MOCK_ACCESS_TOKEN,
        refresh_token: MOCK_REFRESH_TOKEN,
        id_token: MOCK_ID_TOKEN,
        scope: 'test1 openid',
        token_type: 'bearer',
        expires_in: 123,
        auth_at: 123456,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.grantTokensFromSessionToken(mockSessionToken, {
      client_id: MOCK_CLIENT_ID,
      scope: 'test1 openid',
      ttl: 123,
      grant_type: 'fxa-credentials',
      access_type: 'offline',
    });
    assert.deepEqual(res, {
      access_token: MOCK_ACCESS_TOKEN,
      refresh_token: MOCK_REFRESH_TOKEN,
      id_token: MOCK_ID_TOKEN,
      scope: 'test1 openid',
      token_type: 'bearer',
      expires_in: 123,
      auth_at: 123456,
    });
  });
});

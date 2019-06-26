/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const oauthdbModule = require('../../../lib/oauthdb');
const { mockLog } = require('../../mocks');

const ISSUER = 'api.accounts.firefox.com';
const LAST_USED_AT = new Date().getTime();
const MOCK_UID = 'ABCDEF';
const MOCK_CLIENT_ID = '0123456789ABCDEF';
const JWT_IAT = Date.now();
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

describe('oauthdb/checkRefreshToken', () => {
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

  it('can return a token', async () => {
    mockOAuthServer
      .post('/v1/introspect', body => true)
      .reply(200, {
        active: true,
        scope: 'profile',
        client_id: MOCK_CLIENT_ID,
        token_type: 'refresh_token',
        exp: JWT_IAT + 60,
        iat: JWT_IAT,
        sub: MOCK_UID,
        iss: ISSUER,
        'fxa-lastUsedAt': LAST_USED_AT,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const accessToken = await oauthdb.checkRefreshToken(
      'DEADBEEFDEADBEEFDEADBEEFDEADBEEF'
    );

    assert.ok(accessToken);
  });
});

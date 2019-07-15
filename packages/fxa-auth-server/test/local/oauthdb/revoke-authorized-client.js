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

describe('oauthdb/revokeAuthorizedClient', () => {
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

  it('correctly maps errno 122 to "unknown refresh token"', async () => {
    mockOAuthServer
      .post('/v1/authorized-clients/destroy', body => true)
      .reply(400, {
        errno: 122,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.revokeAuthorizedClient(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        refresh_token_id:
          '1234567890123456789012345678901234567890123456789012345678901234',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.REFRESH_TOKEN_UNKNOWN);
    }
  });
});

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
const MOCK_AUTHORIZATION_CODE =
  '1111112222223333334444445555556611111122222233333344444455555566';
const MOCK_ACCESS_TOKEN =
  'aaaaaa2222223333334444445555556611111122222233333344444455555566';
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

describe('oauthdb/grantTokensFromAuthorizationCode', () => {
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

  it('can exchange a code for some tokens', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(200, {
        access_token: MOCK_ACCESS_TOKEN,
        scope: '',
        token_type: 'bearer',
        expires_in: 123,
        auth_at: 123456,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.grantTokensFromAuthorizationCode({
      client_id: MOCK_CLIENT_ID,
      client_secret: MOCK_CLIENT_ID,
      code: MOCK_AUTHORIZATION_CODE,
    });
    assert.deepEqual(res, {
      access_token: MOCK_ACCESS_TOKEN,
      scope: '',
      token_type: 'bearer',
      expires_in: 123,
      auth_at: 123456,
    });
  });

  it('correctly maps errno 102 to "incorrect client secret"', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(400, {
        errno: 102,
        clientId: MOCK_CLIENT_ID,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromAuthorizationCode({
        client_id: MOCK_CLIENT_ID,
        client_secret: 'abcdef',
        code: MOCK_AUTHORIZATION_CODE,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INCORRECT_CLIENT_SECRET);
      assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
    }
  });

  it('correctly maps errno 105 to "unknown authorization code"', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(400, {
        errno: 105,
        code: 'mock-code',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromAuthorizationCode({
        client_id: MOCK_CLIENT_ID,
        client_secret: 'abcdef',
        code: MOCK_AUTHORIZATION_CODE,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.UNKNOWN_AUTHORIZATION_CODE);
      assert.equal(err.output.payload.code, 'mock-code');
    }
  });

  it('correctly maps errno 106 to "mismatched authorization code"', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(400, {
        errno: 106,
        code: 'mock-code',
        clientId: MOCK_CLIENT_ID,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromAuthorizationCode({
        client_id: MOCK_CLIENT_ID,
        client_secret: 'abcdef',
        code: MOCK_AUTHORIZATION_CODE,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.MISMATCH_AUTHORIZATION_CODE);
      assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
      assert.equal(err.output.payload.code, 'mock-code');
    }
  });

  it('correctly maps errno 107 to "expired authorization code"', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(400, {
        errno: 107,
        code: 'mock-code',
        expiredAt: 123456,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromAuthorizationCode({
        client_id: MOCK_CLIENT_ID,
        client_secret: 'abcdef',
        code: MOCK_AUTHORIZATION_CODE,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.EXPIRED_AUTHORIZATION_CODE);
      assert.equal(err.output.payload.code, 'mock-code');
      assert.equal(err.output.payload.expiredAt, 123456);
    }
  });

  it('correctly maps errno 117 to "incorrect pkce challenge"', async () => {
    mockOAuthServer
      .post('/v1/token', body => true)
      .reply(400, {
        errno: 117,
        pkceHashValue: 'mock-pkce-hash',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.grantTokensFromAuthorizationCode({
        client_id: MOCK_CLIENT_ID,
        code_verifier: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbb',
        code: MOCK_AUTHORIZATION_CODE,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PKCE_CHALLENGE);
      assert.equal(err.output.payload.pkceHashValue, 'mock-pkce-hash');
    }
  });
});

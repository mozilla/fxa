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

describe('oauthdb/createAuthorizationCode', () => {
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

  it('can use a sessionToken to return a code', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(200, {
        redirect: 'http://localhost/mock/redirect',
        code:
          '1111112222223333334444445555556611111122222233333344444455555566',
        state: 'xyz',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    const res = await oauthdb.createAuthorizationCode(mockSessionToken, {
      client_id: MOCK_CLIENT_ID,
      state: 'xyz',
    });
    assert.deepEqual(res, {
      redirect: 'http://localhost/mock/redirect',
      code: '1111112222223333334444445555556611111122222233333344444455555566',
      state: 'xyz',
    });
  });

  it('refuses to do response_type=token grants', async () => {
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
        response_type: 'token',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.ok(err);
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
    }
  });

  it('correctly maps errno 101 to "unknown client id"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 101,
        clientId: MOCK_CLIENT_ID,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.UNKNOWN_CLIENT_ID);
      assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
    }
  });

  it('correctly maps errno 103 to "incorrect redirect uri"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 103,
        redirectUri: 'https://incorrect.redirect',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
        redirect_uri: 'https://incorrect.redirect',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INCORRECT_REDIRECT_URI);
      assert.equal(
        err.output.payload.redirectUri,
        'https://incorrect.redirect'
      );
    }
  });

  it('correctly maps errno 104 to "invalid token"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 104,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
    }
  });

  it('correctly maps errno 108 to "invalid token"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 108,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
    }
  });

  it('correctly maps errno 109 to "invalid request parameter"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 109,
        validation: ['error', 'details', 'here'],
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_PARAMETER);
      assert.deepEqual(err.output.payload.validation, [
        'error',
        'details',
        'here',
      ]);
    }
  });

  it('correctly maps errno 110 to "invalid response type"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 110,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_RESPONSE_TYPE);
    }
  });

  it('correctly maps errno 114 to "invalid scopes"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 114,
        invalidScopes: 'special-scope',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INVALID_SCOPES);
      assert.equal(err.output.payload.invalidScopes, 'special-scope');
    }
  });

  it('correctly maps errno 116 to "not public client"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 116,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.NOT_PUBLIC_CLIENT);
    }
  });

  it('correctly maps errno 118 to "missing PKCE parameters"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 118,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.MISSING_PKCE_PARAMETERS);
    }
  });

  it('correctly maps errno 119 to "stale auth timestamp"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 119,
        authAt: 1234,
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.STALE_AUTH_AT);
      assert.equal(err.output.payload.authAt, 1234);
    }
  });

  it('correctly maps errno 120 to "insufficient ACR values"', async () => {
    mockOAuthServer
      .post('/v1/authorization', body => true)
      .reply(400, {
        errno: 120,
        foundValue: 'AAL1',
      });
    oauthdb = oauthdbModule(mockLog(), mockConfig);
    try {
      await oauthdb.createAuthorizationCode(mockSessionToken, {
        client_id: MOCK_CLIENT_ID,
        state: 'xyz',
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INSUFFICIENT_ACR_VALUES);
      assert.equal(err.output.payload.foundValue, 'AAL1');
    }
  });
});

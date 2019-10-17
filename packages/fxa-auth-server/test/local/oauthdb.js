/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const JWT = require('jsonwebtoken');

const P = require('../../lib/promise');
const oauthdbModule = require('../../lib/oauthdb');
const error = require('../../lib/error');
const { mockLog } = require('../mocks');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  oauth: {
    url: 'https://oauth.server.com',
    secretKey: 'secret-key-oh-secret-key',
  },
  domain: 'accounts.example.com',
};

const MOCK_UID = '1a147912d8de4ab5842ecc9fb7186800';
const MOCK_CLIENT_ID = '0123456789ABCDEF';
const MOCK_SCOPES = 'mock-scope another-scope';
const MOCK_TOKEN =
  '8ddd955475561c723d38863defc558788aee362c4f28df76b997ae62646a7b43';
const MOCK_CLIENT_INFO = {
  id: MOCK_CLIENT_ID,
  name: 'mock client',
  trusted: false,
  redirect_uri: 'http://mock.client.com/redirect',
};

const LOCKBOX_CLIENT_INFO = {
  id: 'e7ce535d93522896',
  name: 'Firefox Lockbox for Android',
  trusted: true,
  image_uri: '',
  redirect_uri: 'https://lockbox.firefox.com/fxa/android-redirect.html',
};

const mockOAuthServer = nock(mockConfig.oauth.url).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

function verifyJWT(token) {
  return new P((resolve, reject) => {
    JWT.verify(
      token,
      mockConfig.oauth.secretKey,
      { algorithm: 'HS256' },
      (err, claims) => {
        if (err) {
          reject(err);
        } else {
          resolve(claims);
        }
      }
    );
  });
}

describe('oauthdb', () => {
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

  describe('getClientInfo', () => {
    it('gets client info', async () => {
      mockOAuthServer
        .get(`/v1/client/${MOCK_CLIENT_ID}`)
        .reply(200, MOCK_CLIENT_INFO);
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      const info = await oauthdb.getClientInfo(MOCK_CLIENT_ID);
      assert.deepEqual(info, MOCK_CLIENT_INFO);
    });

    it('gets client info for a real client that previous triggered validation errors', async () => {
      mockOAuthServer
        .get(`/v1/client/${LOCKBOX_CLIENT_INFO.id}`)
        .reply(200, LOCKBOX_CLIENT_INFO);
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      const info = await oauthdb.getClientInfo(LOCKBOX_CLIENT_INFO.id);
      assert.deepEqual(info, LOCKBOX_CLIENT_INFO);
    });

    it('returns correct error for unknown client_id', async () => {
      mockOAuthServer.get(`/v1/client/${MOCK_CLIENT_ID}`).reply(400, {
        code: 400,
        errno: 101,
        message: 'Unknown client',
        clientId: MOCK_CLIENT_ID,
      });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getClientInfo(MOCK_CLIENT_ID);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_CLIENT_ID);
        assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
      }
    });

    it('validates its input parameters', async () => {
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getClientInfo('invalid-client-id');
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('validates the response data', async () => {
      mockOAuthServer.get(`/v1/client/${MOCK_CLIENT_ID}`).reply(200, {
        id: MOCK_CLIENT_ID,
        name: 'mock client',
        trusted: false,
        redirect_uri: 42, // invalid!
      });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getClientInfo(MOCK_CLIENT_ID);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('getScopedKeyData', () => {
    const ZEROS = Buffer.alloc(32).toString('hex');
    const MOCK_CREDENTIALS = {
      uid: MOCK_UID,
      verifierSetAt: 12345,
      email: `${MOCK_UID}@example.com`,
      lastAuthAt: () => 23456,
      emailVerified: true,
      tokenVerified: true,
      authenticationMethods: ['pwd'],
      authenticatorAssuranceLevel: 1,
      profileChangedAt: 1568301173979,
    };

    it('gets scoped key data, authenticating with a JWT', async () => {
      let requestBody;
      mockOAuthServer
        .post('/v1/key-data', body => {
          requestBody = body;
          return true;
        })
        .reply(200, {
          'mock-scope': {
            identifier: 'mock-scope',
            keyRotationSecret: ZEROS,
            keyRotationTimestamp: 0,
          },
        });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      const keyData = await oauthdb.getScopedKeyData(MOCK_CREDENTIALS, {
        client_id: MOCK_CLIENT_ID,
        scope: MOCK_SCOPES,
      });
      assert.equal(requestBody.client_id, MOCK_CLIENT_ID);
      assert.equal(requestBody.scope, MOCK_SCOPES);
      const claims = await verifyJWT(requestBody.assertion);
      // We don't know the exact `iat` timestamp for the JWT.
      assert.ok(claims.iat <= Date.now() / 1000);
      assert.ok(claims.iat >= Date.now() / 1000 - 10);
      assert.equal(claims.exp, claims.iat + 60);
      delete claims.iat;
      delete claims.exp;
      assert.deepEqual(claims, {
        aud: 'https://oauth.server.com',
        'fxa-aal': 1,
        'fxa-amr': ['pwd'],
        'fxa-generation': 12345,
        'fxa-lastAuthAt': 23456,
        'fxa-tokenVerified': true,
        'fxa-verifiedEmail': MOCK_CREDENTIALS.email,
        'fxa-profileChangedAt': MOCK_CREDENTIALS.profileChangedAt,
        iss: 'accounts.example.com',
        sub: MOCK_UID,
      });
      assert.deepEqual(keyData, {
        'mock-scope': {
          identifier: 'mock-scope',
          keyRotationSecret: ZEROS,
          keyRotationTimestamp: 0,
        },
      });
    });

    it('returns correct error for unknown client_id', async () => {
      mockOAuthServer
        .post('/v1/key-data', body => true)
        .reply(400, {
          code: 400,
          errno: 101,
          message: 'Unknown client',
          clientId: MOCK_CLIENT_ID,
        });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(MOCK_CREDENTIALS, {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_CLIENT_ID);
        assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
      }
    });

    it('returns correct error for stale auth-at', async () => {
      mockOAuthServer
        .post('/v1/key-data', body => true)
        .reply(400, {
          code: 400,
          errno: 119,
          message: 'Stale auth timestamp',
          authAt: 7,
        });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(MOCK_CREDENTIALS, {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.STALE_AUTH_AT);
        assert.equal(err.output.payload.authAt, 7);
      }
    });

    it('returns correct error for disabled client_id', async () => {
      mockOAuthServer
        .post('/v1/authorization', body => true)
        .reply(400, {
          code: 503,
          errno: 202,
          message: 'This client has been temporarily disabled',
          clientId: MOCK_CLIENT_ID,
        });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.createAuthorizationCode(MOCK_CREDENTIALS, {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          state: 'xyz',
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
        assert.equal(err.output.payload.clientId, MOCK_CLIENT_ID);
      }
    });

    it('validates its input parameters', async () => {
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(MOCK_CREDENTIALS, {
          client_id: MOCK_CLIENT_ID,
          scope: 'invalid!scope#',
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('validates the response data', async () => {
      mockOAuthServer
        .post('/v1/key-data', body => true)
        .reply(200, {
          'mock-scope': {
            identifier: 'mock-scope',
            keyRotationSecret: 42, // invalid!
            keyRotationTimestamp: 0,
          },
        });
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(MOCK_CREDENTIALS, {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        });
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('requires a verified account', async () => {
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(
          Object.assign({}, MOCK_CREDENTIALS, {
            emailVerified: false,
          }),
          {
            client_id: MOCK_CLIENT_ID,
            scope: MOCK_SCOPES,
          }
        );
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.ACCOUNT_UNVERIFIED);
      }
    });

    it('enforces session verification', async () => {
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      try {
        await oauthdb.getScopedKeyData(
          Object.assign({}, MOCK_CREDENTIALS, {
            mustVerify: true,
            tokenVerified: false,
          }),
          {
            client_id: MOCK_CLIENT_ID,
            scope: MOCK_SCOPES,
          }
        );
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.SESSION_UNVERIFIED);
      }
    });
  });

  describe('checkAccessToken', () => {
    it('works', async () => {
      const verifyResponse = {
        user: MOCK_UID,
        client_id: MOCK_CLIENT_ID,
        scope: ['https://identity.mozilla.com/apps/oldsync', 'openid'],
      };

      mockOAuthServer
        .post('/v1/verify', body => true)
        .reply(200, verifyResponse);
      oauthdb = oauthdbModule(mockLog(), mockConfig);
      const response = await oauthdb.checkAccessToken({
        token: MOCK_TOKEN,
      });

      assert.deepEqual(verifyResponse, response);
    });
  });
});

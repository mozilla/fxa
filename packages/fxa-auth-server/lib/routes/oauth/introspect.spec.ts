/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const TOKEN =
  'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const MOCK_TOKEN_ID = Buffer.from('a'.repeat(64), 'hex');
const MOCK_CLIENT_ID = Buffer.from('deadbeefdeadbeef', 'hex');
const MOCK_USER_ID = Buffer.from('f'.repeat(32), 'hex');
const MOCK_EXPIRES_AT = new Date(9_999_999_999_000);
const MOCK_CREATED_AT = new Date(1_700_000_000_000);
const MOCK_LAST_USED_AT = new Date(1_700_000_500_000);

function accessToken() {
  return {
    scope: ScopeSet.fromArray(['profile', 'openid']),
    clientId: MOCK_CLIENT_ID,
    createdAt: MOCK_CREATED_AT,
    userId: MOCK_USER_ID,
    expiresAt: MOCK_EXPIRES_AT,
    lastUsedAt: MOCK_LAST_USED_AT,
  };
}

describe('/introspect POST', () => {
  let mocks: any;
  let route: any;

  beforeAll(() => {
    mocks = {
      oauthDB: {
        getAccessToken: jest.fn(),
        getRefreshToken: jest.fn(),
        getClient: jest.fn(),
      },
      customs: {
        checkIpOnly: jest.fn(),
      },
      token: {
        getTokenId: jest.fn(async () => MOCK_TOKEN_ID),
      },
    };

    jest.resetModules();
    jest.doMock('../../oauth/token', () => mocks.token);
    route = require('./introspect')({
      oauthDB: mocks.oauthDB,
      customs: mocks.customs,
    });
  });

  describe('validation', () => {
    function validate(payload: any) {
      return route.config.validate.payload.validate(payload).error;
    }

    it('fails with no token', () => {
      const err = validate({});
      expect(err.details[0].message).toBe('"token" is required');
    });

    it('accepts a token', () => {
      expect(validate({ token: TOKEN })).toBeUndefined();
    });
  });

  describe('handler', () => {
    function handle(req: any) {
      return route.config.handler({ headers: {}, ...req });
    }

    describe('rate limiting', () => {
      it('checks the per-IP rate limit for every request', async () => {
        mocks.oauthDB.getAccessToken.mockResolvedValue(accessToken());
        await handle({ payload: { token: TOKEN } });
        expect(mocks.customs.checkIpOnly).toHaveBeenCalledWith(
          expect.any(Object),
          'oauthIntrospect'
        );
      });

      it('throttles before touching the token store when the limit is hit', async () => {
        const throttled = new Error('client has sent too many requests');
        mocks.customs.checkIpOnly.mockRejectedValueOnce(throttled);
        await expect(handle({ payload: { token: TOKEN } })).rejects.toThrow(
          throttled
        );
        expect(mocks.oauthDB.getAccessToken).not.toHaveBeenCalled();
      });
    });

    it('returns the full introspection response for an active access token', async () => {
      mocks.oauthDB.getAccessToken.mockResolvedValue(accessToken());
      const resp = await handle({ payload: { token: TOKEN } });
      expect(resp).toEqual({
        active: true,
        scope: 'profile openid',
        client_id: MOCK_CLIENT_ID.toString('hex'),
        token_type: 'access_token',
        iat: MOCK_CREATED_AT.getTime(),
        sub: MOCK_USER_ID.toString('hex'),
        jti: MOCK_TOKEN_ID.toString('hex'),
        exp: MOCK_EXPIRES_AT.getTime(),
        'fxa-lastUsedAt': MOCK_LAST_USED_AT.getTime(),
      });
    });

    it('returns { active: false } for an unparseable token without leaking', async () => {
      mocks.token.getTokenId.mockRejectedValueOnce(new Error('invalid JWT'));
      const resp = await handle({ payload: { token: 'garbage' } });
      expect(resp).toEqual({ active: false });
    });

    it('returns { active: false } for an unknown token', async () => {
      mocks.oauthDB.getAccessToken.mockResolvedValue(null);
      mocks.oauthDB.getRefreshToken.mockResolvedValue(null);
      const resp = await handle({ payload: { token: TOKEN } });
      expect(resp).toEqual({ active: false });
    });

    describe('refresh token for a public client', () => {
      beforeEach(() => {
        mocks.oauthDB.getAccessToken.mockResolvedValue(null);
        mocks.oauthDB.getRefreshToken.mockResolvedValue(accessToken());
      });

      it('returns the full response when the client is public', async () => {
        mocks.oauthDB.getClient.mockResolvedValue({ publicClient: true });
        const resp = await handle({
          payload: { token: TOKEN, token_type_hint: 'refresh_token' },
        });
        expect(resp).toEqual({
          active: true,
          scope: 'profile openid',
          client_id: MOCK_CLIENT_ID.toString('hex'),
          token_type: 'refresh_token',
          iat: MOCK_CREATED_AT.getTime(),
          sub: MOCK_USER_ID.toString('hex'),
          jti: MOCK_TOKEN_ID.toString('hex'),
          exp: MOCK_EXPIRES_AT.getTime(),
          'fxa-lastUsedAt': MOCK_LAST_USED_AT.getTime(),
        });
        expect(mocks.oauthDB.getClient).toHaveBeenCalledWith(MOCK_CLIENT_ID);
      });

      it('throws for a non-public client', async () => {
        mocks.oauthDB.getClient.mockResolvedValue({ publicClient: false });
        await expect(
          handle({
            payload: { token: TOKEN, token_type_hint: 'refresh_token' },
          })
        ).rejects.toThrow();
      });
    });
  });
});

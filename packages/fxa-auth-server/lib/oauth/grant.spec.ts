/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// `grant.js` captures `JWT_ACCESS_TOKENS_ENABLED` and the allow-list at
// module load, so the config is fixed once here. validateRequestedGrant
// tests don't depend on those values; generateTokens tests do.
jest.mock('../../config', () => {
  const realConfig = jest.requireActual('../../config').config;
  return {
    config: {
      get(key: string) {
        switch (key) {
          case 'oauthServer.jwtAccessTokens.enabled':
            return true;
          case 'oauthServer.jwtAccessTokens.enabledClientIds':
            return ['9876543210'];
          default:
            return realConfig.get(key);
        }
      },
    },
  };
});

jest.mock('./db', () => ({
  getScope: jest.fn(),
  generateAccessToken: jest.fn(),
  generateIdToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

jest.mock('./jwt_access_token', () => ({
  create: jest.fn(),
}));

// Fake signer producing a base64-decodable token; avoids needing a real
// signing key for the OpenID ID-token tests.
jest.mock('./jwt', () => ({
  sign(claims: any) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString(
      'base64'
    );
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64');
    const signature = 'fakesig';
    return `${header}.${payload}.${signature}`;
  },
}));

import fxaShared from 'fxa-shared';
import { Container } from 'typedi';

const ScopeSet = (fxaShared as any).oauth.scopes;
import * as grantModule from './grant';
import * as mockDBModule from './db';
import * as mockJWTAccessTokenModule from './jwt_access_token';
import { CapabilityService } from '../../lib/payments/capability';

const {
  validateRequestedGrant,
  generateTokens,
  setStripeHelper,
  evaluateStepUp,
} = grantModule;
const mockDB = mockDBModule as unknown as Record<string, jest.Mock>;
const mockJWTAccessToken = mockJWTAccessTokenModule as unknown as {
  create: jest.Mock;
};

function decodeJWT(b64: string) {
  const jwt = b64.split('.');
  return {
    header: JSON.parse(Buffer.from(jwt[0], 'base64').toString('utf-8')),
    claims: JSON.parse(Buffer.from(jwt[1], 'base64').toString('utf-8')),
  };
}

const CLAIMS = {
  uid: 'ABCDEF123456',
  'fxa-generation': 12345,
  'fxa-verifiedEmail': 'test@example.com',
  'fxa-lastAuthAt': Date.now(),
  'fxa-tokenVerified': true,
  'fxa-amr': ['pwd'],
  'fxa-aal': 1,
  'fxa-profileChangedAt': Date.now(),
};

const CLIENT = {
  id: Buffer.from('0123456789', 'hex'),
  name: 'Mocha',
  canGrant: true,
  publicClient: false,
  trusted: true,
};

describe('validateRequestedGrant', () => {
  beforeEach(() => {
    mockDB.getScope.mockReset();
  });

  it('should allow unchecked AAL if not requested in acr_values', async () => {
    let grant = await validateRequestedGrant(CLAIMS, CLIENT, {});
    expect(grant.aal).toBe(1);
    grant = await validateRequestedGrant(CLAIMS, CLIENT, {
      acr_values: 'AAL1',
    });
    expect(grant.aal).toBe(1);
  });

  it('should require AAL2 or higher if requested in acr_values', async () => {
    const requestedGrant = {
      acr_values: 'AAL2',
    };
    await expect(
      validateRequestedGrant(CLAIMS, CLIENT, requestedGrant)
      // errno 170 (INSUFFICIENT_ACR_VALUES) is the signal the frontend routes to
      // a second-factor challenge.
    ).rejects.toMatchObject({ errno: 170 });
    let grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 2 },
      CLIENT,
      requestedGrant
    );
    expect(grant.aal).toBe(2);
    grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 17 },
      CLIENT,
      requestedGrant
    );
    expect(grant.aal).toBe(17);
  });

  it('should correctly split acr_values on whitespace', async () => {
    const requestedGrant = {
      acr_values: 'AAL4 AAL2 AAL3',
    };
    await expect(
      validateRequestedGrant(CLAIMS, CLIENT, requestedGrant)
    ).rejects.toMatchObject({ errno: 170 });
    const grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 2 },
      CLIENT,
      requestedGrant
    );
    expect(grant.aal).toBe(2);
  });

  it('should check key-bearing scopes in the database, and reject if not allowed for that client', async () => {
    mockDB.getScope.mockImplementation(async () => ({ hasScopedKeys: true }));
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync']),
    };
    await expect(
      validateRequestedGrant(CLAIMS, CLIENT, requestedGrant)
    ).rejects.toThrow('Requested scopes are not allowed');
    expect(mockDB.getScope).toHaveBeenCalledTimes(1);

    const allowedClient = {
      ...CLIENT,
      allowedScopes: 'https://identity.mozilla.com/apps/oldsync',
    };
    const grant = await validateRequestedGrant(
      CLAIMS,
      allowedClient,
      requestedGrant
    );
    expect(mockDB.getScope).toHaveBeenCalledTimes(2);
    expect(grant.scope.toString()).toBe(
      'https://identity.mozilla.com/apps/oldsync'
    );
  });

  it('should reject key-bearing scopes requested with claims from an unverified session', async () => {
    mockDB.getScope.mockImplementation(async () => ({ hasScopedKeys: true }));
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync']),
    };
    await expect(
      validateRequestedGrant(
        { ...CLAIMS, 'fxa-tokenVerified': false },
        CLIENT,
        requestedGrant
      )
    ).rejects.toThrow('Requested scopes are not allowed');
  });

  describe('max_age (RFC 9470 freshness)', () => {
    // `fxa-lastAuthAt` is seconds since epoch, compared against Date.now()/1000.
    const MOCK_NOW_SECONDS = 1_700_000_000;
    const claimsAuthedAt = (secondsAgo: number) => ({
      ...CLAIMS,
      'fxa-lastAuthAt': MOCK_NOW_SECONDS - secondsAgo,
    });

    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
      jest.setSystemTime(MOCK_NOW_SECONDS * 1000);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('requires step-up (errno 170) when the session is older than max_age', async () => {
      await expect(
        validateRequestedGrant(claimsAuthedAt(3600), CLIENT, { max_age: 60 })
      ).rejects.toMatchObject({ errno: 170 });
    });

    it('passes when the session is within max_age', async () => {
      const grant = await validateRequestedGrant(claimsAuthedAt(10), CLIENT, {
        max_age: 3600,
      });
      expect(grant.aal).toBe(1);
    });

    it('treats max_age=0 as satisfied by a just-completed challenge (within leeway)', async () => {
      const grant = await validateRequestedGrant(claimsAuthedAt(0), CLIENT, {
        max_age: 0,
      });
      expect(grant.aal).toBe(1);
    });

    it('requires step-up for max_age=0 when the session is older than the leeway', async () => {
      await expect(
        validateRequestedGrant(claimsAuthedAt(60), CLIENT, { max_age: 0 })
      ).rejects.toMatchObject({ errno: 170 });
    });

    it('reports the verdict to onStepUpEvaluated on the pass path', async () => {
      const onStepUpEvaluated = jest.fn();
      await validateRequestedGrant(
        claimsAuthedAt(10),
        CLIENT,
        { max_age: 3600 },
        { onStepUpEvaluated }
      );
      expect(onStepUpEvaluated).toHaveBeenCalledWith(
        expect.objectContaining({ requested: true, satisfied: true })
      );
    });

    it('reports the reason to onStepUpEvaluated before throwing', async () => {
      const onStepUpEvaluated = jest.fn();
      await expect(
        validateRequestedGrant(
          claimsAuthedAt(3600),
          CLIENT,
          { max_age: 60 },
          {
            onStepUpEvaluated,
          }
        )
      ).rejects.toMatchObject({ errno: 170 });
      expect(onStepUpEvaluated).toHaveBeenCalledWith(
        expect.objectContaining({
          requested: true,
          satisfied: false,
          reason: 'max_age_stale',
        })
      );
    });

    it('still returns a grant when the observer throws on the pass path', async () => {
      const grant = await validateRequestedGrant(
        claimsAuthedAt(10),
        CLIENT,
        { max_age: 3600 },
        {
          onStepUpEvaluated: () => {
            throw new Error('boom');
          },
        }
      );
      expect(grant.aal).toBe(1);
    });

    it('still throws errno 170, not the observer error, on the reject path', async () => {
      await expect(
        validateRequestedGrant(
          claimsAuthedAt(3600),
          CLIENT,
          { max_age: 60 },
          {
            onStepUpEvaluated: () => {
              throw new Error('boom');
            },
          }
        )
      ).rejects.toMatchObject({ errno: 170 });
    });

    it('reports the auth age to the observer, not just the verdict', async () => {
      const onStepUpEvaluated = jest.fn();
      await validateRequestedGrant(
        claimsAuthedAt(42),
        CLIENT,
        { max_age: 3600 },
        { onStepUpEvaluated }
      );
      expect(onStepUpEvaluated).toHaveBeenCalledWith({
        requested: true,
        satisfied: true,
        reason: undefined,
        authAgeSeconds: 42,
      });
    });

    it('enforces the gate regardless of what the observer returns', async () => {
      await expect(
        validateRequestedGrant(
          claimsAuthedAt(3600),
          CLIENT,
          { max_age: 60 },
          {
            onStepUpEvaluated: () => ({ requested: false, satisfied: true }),
          }
        )
      ).rejects.toMatchObject({ errno: 170 });
    });

    it('enforces the gate when no observer is supplied', async () => {
      await expect(
        validateRequestedGrant(claimsAuthedAt(3600), CLIENT, { max_age: 60 })
      ).rejects.toMatchObject({ errno: 170 });
    });

    it('skips the freshness check entirely when max_age is absent', async () => {
      const grant = await validateRequestedGrant(
        claimsAuthedAt(99999),
        CLIENT,
        {}
      );
      expect(grant.aal).toBe(1);
    });
  });
});

describe('evaluateStepUp', () => {
  // Must match MAX_AGE_LEEWAY_SECONDS in grant.js.
  const LEEWAY_SECONDS = 5;
  const MOCK_NOW_SECONDS = 1_700_000_000;
  const claimsAuthedAt = (secondsAgo: number, aal = 1) => ({
    ...CLAIMS,
    'fxa-aal': aal,
    'fxa-lastAuthAt': MOCK_NOW_SECONDS - secondsAgo,
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW_SECONDS * 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('pins the leeway the boundary cases are written against', () => {
    expect(grantModule.MAX_AGE_LEEWAY_SECONDS).toBe(LEEWAY_SECONDS);
  });

  it('clamps a future-dated authentication time to a zero age', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(-600), { max_age: 3600 })
    ).toMatchObject({ requested: true, satisfied: true, authAgeSeconds: 0 });
  });

  it('is satisfied by a just-completed challenge when max_age is 0', () => {
    expect(evaluateStepUp(claimsAuthedAt(0), { max_age: 0 })).toMatchObject({
      requested: true,
      satisfied: true,
      authAgeSeconds: 0,
    });
  });

  it('rejects a max_age of 0 once the session is past the leeway', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(LEEWAY_SECONDS + 1), { max_age: 0 })
    ).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'max_age_stale',
    });
  });

  it('reports the auth age alongside a rejection', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(9000), { max_age: 60 }).authAgeSeconds
    ).toBe(9000);
  });

  it('reports no request when neither acr_values nor max_age is present', () => {
    const result = evaluateStepUp(claimsAuthedAt(10), {});
    expect(result).toMatchObject({ requested: false, satisfied: true });
    expect(result.reason).toBeUndefined();
  });

  it('reports no request when acr_values omits AAL2', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(10), { acr_values: 'AAL1 urn:example' })
    ).toMatchObject({ requested: false, satisfied: true });
  });

  it('treats an explicit null max_age as absent', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(99999), { max_age: null })
    ).toMatchObject({ requested: false, satisfied: true });
  });

  it('reports acr_values_unmet when the session is below AAL2', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(10, 1), { acr_values: 'AAL2' })
    ).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'acr_values_unmet',
    });
  });

  it('is satisfied when the session already reached AAL2', () => {
    const result = evaluateStepUp(claimsAuthedAt(10, 2), {
      acr_values: 'AAL2',
    });
    expect(result).toMatchObject({ requested: true, satisfied: true });
    expect(result.reason).toBeUndefined();
  });

  it('splits acr_values on arbitrary whitespace', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(10, 1), { acr_values: '  AAL1 \t AAL2  ' })
    ).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'acr_values_unmet',
    });
  });

  it('reports max_age_stale beyond the leeway', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(60 + LEEWAY_SECONDS + 1), { max_age: 60 })
    ).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'max_age_stale',
    });
  });

  it('is satisfied exactly on the leeway boundary', () => {
    const result = evaluateStepUp(claimsAuthedAt(60 + LEEWAY_SECONDS), {
      max_age: 60,
    });
    expect(result).toMatchObject({ requested: true, satisfied: true });
    expect(result.reason).toBeUndefined();
  });

  it('reports auth_time_missing when the session carries no auth time', () => {
    const claims = { ...(CLAIMS as any) };
    delete claims['fxa-lastAuthAt'];
    expect(evaluateStepUp(claims, { max_age: 3600 })).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'auth_time_missing',
      authAgeSeconds: undefined,
    });
  });

  it('prefers acr_values_unmet over max_age_stale when both fail', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(99999, 1), {
        acr_values: 'AAL2',
        max_age: 60,
      })
    ).toMatchObject({
      requested: true,
      satisfied: false,
      reason: 'acr_values_unmet',
    });
  });

  it('reports the session auth age in seconds', () => {
    expect(
      evaluateStepUp(claimsAuthedAt(42), { max_age: 3600 }).authAgeSeconds
    ).toBe(42);
  });

  it('reports auth age even when step-up was not requested', () => {
    expect(evaluateStepUp(claimsAuthedAt(42), {}).authAgeSeconds).toBe(42);
  });
});

describe('generateTokens', () => {
  let mockAccessToken: any;
  let mockCapabilityService: any;
  let requestedGrant: any;
  let scope: any;

  beforeEach(() => {
    scope = ScopeSet.fromArray([
      'profile:uid',
      'profile:email',
      'profile:subscriptions',
    ]);

    mockAccessToken = {
      expiresAt: Date.now() + 1000,
      scope,
      token: 'token',
      type: 'access_token',
    };

    requestedGrant = {
      clientId: Buffer.from('0123456789', 'hex'),
      grantType: 'fxa-credentials',
      scope,
      userId: Buffer.from('ABCDEF123456', 'hex'),
    };

    mockDB.generateAccessToken
      .mockReset()
      .mockImplementation(async () => mockAccessToken);
    mockDB.generateIdToken
      .mockReset()
      .mockImplementation(async () => ({ token: 'id_token' }));
    mockDB.generateRefreshToken
      .mockReset()
      .mockImplementation(async () => ({ token: 'refresh_token' }));

    mockJWTAccessToken.create.mockReset().mockImplementation(async () => ({
      ...mockAccessToken,
      jwt_token: 'signed jwt access token',
    }));

    mockCapabilityService = {};
    Container.set(CapabilityService, mockCapabilityService);
    setStripeHelper(undefined);
  });

  it('should return required params in result, normal access token by default', async () => {
    const result = await generateTokens(requestedGrant);
    expect(mockDB.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(mockDB.generateAccessToken).toHaveBeenCalledWith(requestedGrant);
    expect(mockJWTAccessToken.create).not.toHaveBeenCalled();

    expect(result.access_token).toBe('token');
    expect(typeof result.expires_in).toBe('number');
    expect(result.token_type).toBe('access_token');
    expect(result.scope).toBe(
      'profile:uid profile:email profile:subscriptions'
    );

    expect('auth_at' in result).toBe(false);
    expect('keys_jwe' in result).toBe(false);
    expect('refresh_token' in result).toBe(false);
    expect('id_token' in result).toBe(false);
  });

  it('should generate a JWT access token if enabled, client_id allowed, and direct Stripe access enabled', async () => {
    const clientId = '9876543210';

    mockCapabilityService.subscriptionCapabilities = jest
      .fn()
      .mockResolvedValue({
        [`capabilities:${clientId}`]: 'cap1',
      });
    mockCapabilityService.determineClientVisibleSubscriptionCapabilities = jest
      .fn()
      .mockResolvedValue(['cap1']);

    requestedGrant.clientId = Buffer.from(clientId, 'hex');
    const result = await generateTokens(requestedGrant);
    expect(mockDB.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(mockDB.generateAccessToken).toHaveBeenCalledWith(requestedGrant);
    expect(result.access_token).toBe('signed jwt access token');
    expect(mockJWTAccessToken.create).toHaveBeenCalledTimes(1);
    expect(mockJWTAccessToken.create).toHaveBeenCalledWith(mockAccessToken, {
      ...requestedGrant,
      'fxa-subscriptions': ['cap1'],
    });

    expect(typeof result.expires_in).toBe('number');
    expect(result.token_type).toBe('access_token');
    expect(result.scope).toBe(
      'profile:uid profile:email profile:subscriptions'
    );

    expect('auth_at' in result).toBe(false);
    expect('keys_jwe' in result).toBe(false);
    expect('refresh_token' in result).toBe(false);
    expect('id_token' in result).toBe(false);
  });

  it('should return authAt from grant', async () => {
    // authAt is seconds since the epoch (from session_token.lastAuthAt()).
    const authAtSeconds = 1_700_000_000;
    requestedGrant.authAt = authAtSeconds;
    const result = await generateTokens(requestedGrant);
    expect(result.auth_at).toBe(authAtSeconds);
  });

  it('should return keysJwe from grant', async () => {
    requestedGrant.keysJwe = 'biz';
    const result = await generateTokens(requestedGrant);
    expect(result.keys_jwe).toBe('biz');
  });

  it('should generate a refreshToken if grant.offline=true', async () => {
    requestedGrant.offline = true;
    const result = await generateTokens(requestedGrant);
    expect(result.refresh_token).toBe('refresh_token');
  });

  it('should generate an OpenID ID token if requested', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();

    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.aud).toBe('0123456789');
  });

  it('should propagate `resource` and `clientId` in the `aud` claim', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.resource = 'https://resource.server1.com';
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();
    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.aud).toEqual([
      '0123456789',
      'https://resource.server1.com',
    ]);
  });

  // No token is minted for a rejected request, so RFC 9470 section 5 reduces to:
  // acr tracks the achieved aal, never the requested acr_values.
  it('reflects the achieved aal in the id_token acr claim', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.aal = 2;
    const result = await generateTokens(requestedGrant);

    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.acr).toBe('AAL2');
    expect(jwt.claims['fxa-aal']).toBe(2);
  });

  it('reports the lower level in acr when the session only reached AAL1', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.aal = 1;
    const result = await generateTokens(requestedGrant);

    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.acr).toBe('AAL1');
  });

  it('omits acr when the grant carries no aal', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    delete requestedGrant.aal;
    const result = await generateTokens(requestedGrant);

    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.acr).toBeUndefined();
  });

  it('propagates auth_time (seconds) in id_token claims without re-dividing', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    // authAt is already seconds since the epoch; auth_time must equal it, not
    // authAt/1000 (the previous bug produced a value ~1000x too small).
    const authAtSeconds = 1_700_000_000;
    requestedGrant.authAt = authAtSeconds;
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();
    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.auth_time).toBe(authAtSeconds);
  });
});

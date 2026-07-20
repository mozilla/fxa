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

const { validateRequestedGrant, generateTokens, setStripeHelper } = grantModule;
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
    ).rejects.toThrow('Mismatch acr value');
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
    ).rejects.toThrow('Mismatch acr value');
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
    const now = Date.now();
    requestedGrant.authAt = now;
    const result = await generateTokens(requestedGrant);
    expect(result.auth_at).toBe(now);
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

  it('should propagate auth_time in claims', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.authAt = Date.now();
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();
    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.auth_time).toBe(Math.floor(requestedGrant.authAt / 1000));
  });
});

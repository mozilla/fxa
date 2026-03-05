export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const { config } = require('../../config');

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
  let mockDB: any, validateRequestedGrant: any, FreshScopeSet: any;

  beforeEach(() => {
    mockDB = {};
    jest.resetModules();
    jest.doMock('./db', () => mockDB);
    validateRequestedGrant = require('./grant').validateRequestedGrant;
    // Get ScopeSet from the same module registry as the freshly-required grant
    // module, so that instanceof checks inside grant.js work correctly.
    FreshScopeSet = require('fxa-shared').oauth.scopes;
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
    mockDB.getScope = sinon.stub().callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: FreshScopeSet.fromArray([
        'https://identity.mozilla.com/apps/oldsync',
      ]),
    };
    await expect(
      validateRequestedGrant(CLAIMS, CLIENT, requestedGrant)
    ).rejects.toThrow('Requested scopes are not allowed');
    expect(mockDB.getScope.callCount).toBe(1);

    const allowedClient = {
      ...CLIENT,
      allowedScopes: 'https://identity.mozilla.com/apps/oldsync',
    };
    const grant = await validateRequestedGrant(
      CLAIMS,
      allowedClient,
      requestedGrant
    );
    expect(mockDB.getScope.callCount).toBe(2);
    expect(grant.scope.toString()).toBe(
      'https://identity.mozilla.com/apps/oldsync'
    );
  });

  it('should reject key-bearing scopes requested with claims from an unverified session', async () => {
    mockDB.getScope = sinon.stub().callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: FreshScopeSet.fromArray([
        'https://identity.mozilla.com/apps/oldsync',
      ]),
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
  let mockDB: any;
  let mockJWTAccessToken: any;
  let mockCapabilityService: any;

  let generateTokens: any;
  let requestedGrant: any;
  let scope: any;
  let FreshScopeSet: any;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../../config', () => ({
      config: {
        get(key: string) {
          switch (key) {
            case 'oauthServer.jwtAccessTokens.enabled':
              return true;
            case 'oauthServer.jwtAccessTokens.enabledClientIds':
              return ['9876543210'];
            default:
              return config.get(key);
          }
        },
      },
    }));

    // Get ScopeSet from the same module registry as the freshly-required grant
    // module, so that instanceof checks inside grant.js work correctly.
    FreshScopeSet = require('fxa-shared').oauth.scopes;

    scope = FreshScopeSet.fromArray([
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

    mockDB = {
      generateAccessToken: sinon.spy(async () => mockAccessToken),
      generateIdToken: sinon.spy(async () => ({ token: 'id_token' })),
      generateRefreshToken: sinon.spy(async () => ({
        token: 'refresh_token',
      })),
    };
    mockCapabilityService = {};

    mockJWTAccessToken = {
      create: sinon.spy(async () => {
        return {
          ...mockAccessToken,
          jwt_token: 'signed jwt access token',
        };
      }),
    };

    jest.doMock('./db', () => mockDB);
    jest.doMock('./jwt_access_token', () => mockJWTAccessToken);
    // Mock the jwt module to avoid needing a real signing key for ID token tests.
    // The sign function produces a fake JWT whose payload can be decoded by decodeJWT.
    jest.doMock('./jwt', () => ({
      sign(claims: any) {
        const header = Buffer.from(
          JSON.stringify({ alg: 'RS256' })
        ).toString('base64');
        const payload = Buffer.from(JSON.stringify(claims)).toString('base64');
        const signature = 'fakesig';
        return `${header}.${payload}.${signature}`;
      },
    }));

    const grantModule = require('./grant');
    // After jest.resetModules(), we must get Container and CapabilityService
    // from the same module registry used by the freshly-required grant module,
    // otherwise Container.set() would target a stale Container instance.
    const freshContainer = require('typedi').default;
    const {
      CapabilityService: FreshCapabilityService,
    } = require('../../lib/payments/capability');
    freshContainer.set(FreshCapabilityService, mockCapabilityService);
    grantModule.setStripeHelper(undefined);

    generateTokens = grantModule.generateTokens;
  });

  it('should return required params in result, normal access token by default', async () => {
    const result = await generateTokens(requestedGrant);
    expect(mockDB.generateAccessToken.calledOnceWith(requestedGrant)).toBe(
      true
    );
    expect(mockJWTAccessToken.create.called).toBe(false);

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

    mockCapabilityService.subscriptionCapabilities = sinon.fake.resolves({
      [`capabilities:${clientId}`]: 'cap1',
    });
    mockCapabilityService.determineClientVisibleSubscriptionCapabilities =
      sinon.fake.resolves(['cap1']);

    requestedGrant.clientId = Buffer.from(clientId, 'hex');
    const result = await generateTokens(requestedGrant);
    expect(mockDB.generateAccessToken.calledOnceWith(requestedGrant)).toBe(
      true
    );
    expect(result.access_token).toBe('signed jwt access token');
    expect(
      mockJWTAccessToken.create.calledOnceWith(mockAccessToken, {
        ...requestedGrant,
        'fxa-subscriptions': ['cap1'],
      })
    ).toBe(true);

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
    requestedGrant.scope = FreshScopeSet.fromArray(['openid']);
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();

    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.aud).toBe('0123456789');
  });

  it('should propagate `resource` and `clientId` in the `aud` claim', async () => {
    requestedGrant.scope = FreshScopeSet.fromArray(['openid']);
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
    requestedGrant.scope = FreshScopeSet.fromArray(['openid']);
    requestedGrant.authAt = Date.now();
    const result = await generateTokens(requestedGrant);
    expect(result.id_token).toBeTruthy();
    const jwt = decodeJWT(result.id_token);
    expect(jwt.claims.auth_time).toBe(
      Math.floor(requestedGrant.authAt / 1000)
    );
  });
});

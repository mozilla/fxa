/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { Container } from 'typedi';
import { config } from '../../config';
import ScopeSetModule from 'fxa-shared';
const ScopeSet = ScopeSetModule.oauth.scopes;
import AppError from '../../lib/oauth/error';
import { decodeJWT } from '../lib/util';
import { CapabilityService } from '../../lib/payments/capability';

async function assertThrowsAsync(fn, errorLike, errMsgMatcher, message) {
  let threw = null;
  return fn()
    .catch((err) => {
      threw = err;
    })
    .then(() => {
      // Use synchronous `assert.throws` to get all the nice matching logic.
      assert.throws(
        () => {
          if (threw) {
            throw threw;
          }
        },
        errorLike,
        errMsgMatcher,
        message
      );
    });
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
  let mockDB, validateRequestedGrant;

  beforeEach(() => {
    mockDB = {};
    validateRequestedGrant = proxyquire('../../lib/oauth/grant', {
      './db': mockDB,
    }).validateRequestedGrant;
  });

  it('#integration - should return validated grant data', async () => {
    const scope = ScopeSet.fromArray(['profile']);
    const grant = await validateRequestedGrant(CLAIMS, CLIENT, { scope });
    assert.deepEqual(grant, {
      clientId: CLIENT.id,
      name: CLIENT.name,
      canGrant: CLIENT.canGrant,
      publicClient: CLIENT.publicClient,
      userId: Buffer.from(CLAIMS.uid, 'hex'),
      sessionTokenId: undefined,
      email: CLAIMS['fxa-verifiedEmail'],
      scope,
      scopeConfig: { profile: null },
      offline: false,
      authAt: CLAIMS['fxa-lastAuthAt'],
      amr: CLAIMS['fxa-amr'],
      aal: CLAIMS['fxa-aal'],
      profileChangedAt: CLAIMS['fxa-profileChangedAt'],
      keysJwe: undefined,
      generation: 12345,
    });
  });

  it('should allow unchecked AAL if not requested in acr_values', async () => {
    let grant = await validateRequestedGrant(CLAIMS, CLIENT, {});
    assert.equal(grant.aal, 1);
    grant = await validateRequestedGrant(CLAIMS, CLIENT, {
      acr_values: 'AAL1',
    });
    assert.equal(grant.aal, 1);
  });

  it('should require AAL2 or higher if requested in acr_values', async () => {
    const requestedGrant = {
      acr_values: 'AAL2',
    };
    await assertThrowsAsync(
      async () => {
        await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
      },
      AppError,
      'Mismatch acr value'
    );
    let grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 2 },
      CLIENT,
      requestedGrant
    );
    assert.equal(grant.aal, 2);
    grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 17 },
      CLIENT,
      requestedGrant
    );
    assert.equal(grant.aal, 17);
  });

  it('should correctly split acr_values on whitespace', async () => {
    const requestedGrant = {
      acr_values: 'AAL4 AAL2 AAL3',
    };
    await assertThrowsAsync(
      async () => {
        await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
      },
      AppError,
      'Mismatch acr value'
    );
    const grant = await validateRequestedGrant(
      { ...CLAIMS, 'fxa-aal': 2 },
      CLIENT,
      requestedGrant
    );
    assert.equal(grant.aal, 2);
  });

  it('#integration - should reject disallowed scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile']),
    };
    const grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: true },
      requestedGrant
    );
    assert.equal(grant.scope.toString(), 'profile');
    await assertThrowsAsync(
      async () => {
        await validateRequestedGrant(
          CLAIMS,
          { ...CLIENT, trusted: false },
          requestedGrant
        );
      },
      AppError,
      'Requested scopes are not allowed'
    );
  });

  it('#integration - should allow restricted set of scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile:uid', 'profile:email']),
    };
    let grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: true },
      requestedGrant
    );
    assert.equal(grant.scope.toString(), 'profile:uid profile:email');
    grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: false },
      requestedGrant
    );
    assert.equal(grant.scope.toString(), 'profile:uid profile:email');
  });

  it('should check key-bearing scopes in the database, and reject if not allowed for that client', async () => {
    sinon.stub(mockDB, 'getScope').callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync']),
    };
    await assertThrowsAsync(
      async () => {
        await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
      },
      AppError,
      'Requested scopes are not allowed'
    );
    assert.equal(mockDB.getScope.callCount, 1);

    const allowedClient = {
      ...CLIENT,
      allowedScopes: 'https://identity.mozilla.com/apps/oldsync',
    };
    const grant = await validateRequestedGrant(
      CLAIMS,
      allowedClient,
      requestedGrant
    );
    assert.equal(mockDB.getScope.callCount, 2);
    assert.equal(
      grant.scope.toString(),
      'https://identity.mozilla.com/apps/oldsync'
    );
  });

  it('should reject key-bearing scopes requested with claims from an unverified session', async () => {
    sinon.stub(mockDB, 'getScope').callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync']),
    };
    await assertThrowsAsync(
      async () => {
        await validateRequestedGrant(
          { ...CLAIMS, 'fxa-tokenVerified': false },
          CLIENT,
          requestedGrant
        );
      },
      AppError,
      'Requested scopes are not allowed'
    );
  });
});

describe('generateTokens', () => {
  let mockAccessToken;
  let mockConfig;
  let mockDB;
  let mockJWTAccessToken;
  let mockCapabilityService;

  let generateTokens;
  let requestedGrant;
  let scope;
  let grantModule;

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

    mockDB = {
      generateAccessToken: sinon.spy(async () => mockAccessToken),
      generateIdToken: sinon.spy(async () => ({ token: 'id_token' })),
      generateRefreshToken: sinon.spy(async () => ({ token: 'refresh_token' })),
    };
    mockCapabilityService = {};

    mockConfig = {
      config: {
        get(key) {
          switch (key) {
            case 'oauthServer.jwtAccessTokens.enabled': {
              return true;
            }
            case 'oauthServer.jwtAccessTokens.enabledClientIds': {
              return ['9876543210'];
            }
            default: {
              return config.get(key);
            }
          }
        },
      },
    };

    mockJWTAccessToken = {
      create: sinon.spy(async () => {
        return {
          ...mockAccessToken,
          jwt_token: 'signed jwt access token',
        };
      }),
    };

    grantModule = proxyquire('../../lib/oauth/grant', {
      '../../config': mockConfig,
      './db': mockDB,
      './jwt_access_token': mockJWTAccessToken,
    });

    Container.set(CapabilityService, mockCapabilityService);
    grantModule.setStripeHelper(undefined);

    generateTokens = grantModule.generateTokens;
  });

  it('should return required params in result, normal access token by default', async () => {
    const result = await generateTokens(requestedGrant);
    assert.isTrue(mockDB.generateAccessToken.calledOnceWith(requestedGrant));
    assert.isFalse(mockJWTAccessToken.create.called);

    assert.strictEqual(result.access_token, 'token');
    assert.isNumber(result.expires_in);
    assert.strictEqual(result.token_type, 'access_token');
    assert.strictEqual(
      result.scope,
      'profile:uid profile:email profile:subscriptions'
    );

    assert.isFalse('auth_at' in result);
    assert.isFalse('keys_jwe' in result);
    assert.isFalse('refresh_token' in result);
    assert.isFalse('id_token' in result);
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
    assert.isTrue(mockDB.generateAccessToken.calledOnceWith(requestedGrant));
    assert.strictEqual(result.access_token, 'signed jwt access token');
    assert.isTrue(
      mockJWTAccessToken.create.calledOnceWith(mockAccessToken, {
        ...requestedGrant,
        'fxa-subscriptions': ['cap1'],
      })
    );

    assert.isNumber(result.expires_in);
    assert.strictEqual(result.token_type, 'access_token');
    assert.strictEqual(
      result.scope,
      'profile:uid profile:email profile:subscriptions'
    );

    assert.isFalse('auth_at' in result);
    assert.isFalse('keys_jwe' in result);
    assert.isFalse('refresh_token' in result);
    assert.isFalse('id_token' in result);
  });

  it('should return authAt from grant', async () => {
    const now = Date.now();
    requestedGrant.authAt = now;
    const result = await generateTokens(requestedGrant);
    assert.strictEqual(result.auth_at, now);
  });

  it('should return keysJwe from grant', async () => {
    requestedGrant.keysJwe = 'biz';
    const result = await generateTokens(requestedGrant);
    assert.strictEqual(result.keys_jwe, 'biz');
  });

  it('should generate a refreshToken if grant.offline=true', async () => {
    requestedGrant.offline = true;
    const result = await generateTokens(requestedGrant);
    assert.strictEqual(result.refresh_token, 'refresh_token');
  });

  it('should generate an OpenID ID token if requested', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    const result = await generateTokens(requestedGrant);
    assert.ok(result.id_token);

    const jwt = decodeJWT(result.id_token);
    assert.strictEqual(jwt.claims.aud, '0123456789');
  });

  it('should propagate `resource` and `clientId` in the `aud` claim', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.resource = 'https://resource.server1.com';
    const result = await generateTokens(requestedGrant);
    assert.ok(result.id_token);
    const jwt = decodeJWT(result.id_token);
    assert.deepEqual(jwt.claims.aud, [
      '0123456789',
      'https://resource.server1.com',
    ]);
  });

  it('should propagate auth_time in claims', async () => {
    requestedGrant.scope = ScopeSet.fromArray(['openid']);
    requestedGrant.authAt = Date.now();
    const result = await generateTokens(requestedGrant);
    assert.ok(result.id_token);
    const jwt = decodeJWT(result.id_token);
    assert.deepEqual(
      jwt.claims.auth_time,
      Math.floor(requestedGrant.authAt / 1000)
    );
  });
});

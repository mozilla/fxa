export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

describe('validateRequestedGrant (integration)', () => {
  let mockDB: any, validateRequestedGrant: any, ScopeSet: any;

  beforeEach(() => {
    mockDB = {
      getScope: async () => null,
    };
    jest.resetModules();
    jest.doMock('../../lib/oauth/db', () => mockDB);
    validateRequestedGrant =
      require('../../lib/oauth/grant').validateRequestedGrant;
    // Load ScopeSet AFTER resetModules so it shares the same class identity
    // as the one used inside the grant module (avoids instanceof failures).
    ScopeSet = require('fxa-shared').oauth.scopes;
  });

  it('should return validated grant data', async () => {
    const scope = ScopeSet.fromArray(['profile']);
    const grant = await validateRequestedGrant(CLAIMS, CLIENT, { scope });
    expect(grant).toEqual({
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

  it('should reject disallowed scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile']),
    };
    const grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: true },
      requestedGrant
    );
    expect(grant.scope.toString()).toBe('profile');
    await expect(
      validateRequestedGrant(
        CLAIMS,
        { ...CLIENT, trusted: false },
        requestedGrant
      )
    ).rejects.toThrow('Requested scopes are not allowed');
  });

  it('should allow restricted set of scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile:uid', 'profile:email']),
    };
    let grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: true },
      requestedGrant
    );
    expect(grant.scope.toString()).toBe('profile:uid profile:email');
    grant = await validateRequestedGrant(
      CLAIMS,
      { ...CLIENT, trusted: false },
      requestedGrant
    );
    expect(grant.scope.toString()).toBe('profile:uid profile:email');
  });
});

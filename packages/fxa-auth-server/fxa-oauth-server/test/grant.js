/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const ScopeSet = require('fxa-shared').oauth.scopes;
const AppError = require('../lib/error');

async function assertThrowsAsync(fn, errorLike, errMsgMatcher, message) {
  let threw = null;
  return fn().catch(err => {
    threw = err;
  }).then(() => {
    // Use synchronous `assert.throws` to get all the nice matching logic.
    assert.throws(() => {
      if (threw) {
        throw threw;
      }
    }, errorLike, errMsgMatcher, message);
  });
}

const CLAIMS = {
  'uid': 'ABCDEF123456',
  'fxa-generation': 12345,
  'fxa-verifiedEmail': 'test@example.com',
  'fxa-lastAuthAt': Date.now(),
  'fxa-tokenVerified': true,
  'fxa-amr': ['pwd'],
  'fxa-aal': 1,
  'fxa-profileChangedAt': Date.now()
};

const CLIENT = {
  id: Buffer.from('0123456789', 'hex'),
  trusted: true,
};

describe('validateRequestedGrant', () => {

  let mockDB, validateRequestedGrant;

  beforeEach(() => {
    mockDB = {};
    validateRequestedGrant = proxyquire('../lib/grant', { './db': mockDB }).validateRequestedGrant;
  });

  it('should return validated grant data', async () => {
    const scope = ScopeSet.fromArray(['profile']);
    const grant = await validateRequestedGrant(CLAIMS, CLIENT, { scope });
    assert.deepEqual(grant, {
      clientId: CLIENT.id,
      userId: Buffer.from(CLAIMS.uid, 'hex'),
      email: CLAIMS['fxa-verifiedEmail'],
      scope,
      scopeConfig: { profile: null },
      offline: false,
      authAt: CLAIMS['fxa-lastAuthAt'],
      amr: CLAIMS['fxa-amr'],
      aal: CLAIMS['fxa-aal'],
      profileChangedAt: CLAIMS['fxa-profileChangedAt'],
      keysJwe: undefined,
    });
  });

  it('should allow unchecked AAL if not requested in acr_values', async () => {
    let grant = await validateRequestedGrant(CLAIMS, CLIENT, {});
    assert.equal(grant.aal, 1);
    grant = await validateRequestedGrant(CLAIMS, CLIENT, { acr_values: 'AAL1' });
    assert.equal(grant.aal, 1);
  });

  it('should require AAL2 or higher if requested in acr_values', async () => {
    const requestedGrant = {
      acr_values: 'AAL2'
    };
    await assertThrowsAsync(async () => {
      await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
    }, AppError, 'Mismatch acr value');
    let grant = await validateRequestedGrant({...CLAIMS, 'fxa-aal': 2}, CLIENT, requestedGrant);
    assert.equal(grant.aal, 2);
    grant = await validateRequestedGrant({ ...CLAIMS, 'fxa-aal': 17 }, CLIENT, requestedGrant);
    assert.equal(grant.aal, 17);
  });

  it('should correctly split acr_values on whitespace', async () => {
    const requestedGrant = {
      acr_values: 'AAL4 AAL2 AAL3'
    };
    await assertThrowsAsync(async () => {
      await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
    }, AppError, 'Mismatch acr value');
    const grant = await validateRequestedGrant({ ...CLAIMS, 'fxa-aal': 2 }, CLIENT, requestedGrant);
    assert.equal(grant.aal, 2);
  });

  it('should reject disallowed scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile'])
    };
    const grant = await validateRequestedGrant(CLAIMS, { ...CLIENT, trusted: true }, requestedGrant);
    assert.equal(grant.scope.toString(), 'profile');
    await assertThrowsAsync(async () => {
      await validateRequestedGrant(CLAIMS, { ...CLIENT, trusted: false }, requestedGrant);
    }, AppError, 'Requested scopes are not allowed');
  });

  it('should allow restricted set of scopes for untrusted clients', async () => {
    const requestedGrant = {
      scope: ScopeSet.fromArray(['profile:uid', 'profile:email'])
    };
    let grant = await validateRequestedGrant(CLAIMS, { ...CLIENT, trusted: true }, requestedGrant);
    assert.equal(grant.scope.toString(), 'profile:uid profile:email');
    grant = await validateRequestedGrant(CLAIMS, { ...CLIENT, trusted: false }, requestedGrant);
    assert.equal(grant.scope.toString(), 'profile:uid profile:email');
  });

  it('should check key-bearing scopes in the database, and reject if not allowed for that client', async () => {
    sinon.stub(mockDB, 'getScope').callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync'])
    };
    await assertThrowsAsync(async () => {
      await validateRequestedGrant(CLAIMS, CLIENT, requestedGrant);
    }, AppError, 'Requested scopes are not allowed');
    assert.equal(mockDB.getScope.callCount, 1);

    const allowedClient = { ...CLIENT, allowedScopes: 'https://identity.mozilla.com/apps/oldsync' };
    const grant = await validateRequestedGrant(CLAIMS, allowedClient, requestedGrant);
    assert.equal(mockDB.getScope.callCount, 2);
    assert.equal(grant.scope.toString(), 'https://identity.mozilla.com/apps/oldsync');
  });

  it('should reject key-bearing scopes requested with claims from an unverified session', async () => {
    sinon.stub(mockDB, 'getScope').callsFake(async () => {
      return { hasScopedKeys: true };
    });
    const requestedGrant = {
      scope: ScopeSet.fromArray(['https://identity.mozilla.com/apps/oldsync'])
    };
    await assertThrowsAsync(async () => {
      await validateRequestedGrant({ ...CLAIMS, 'fxa-tokenVerified': false }, CLIENT, requestedGrant);
    }, AppError, 'Requested scopes are not allowed');
  });
});

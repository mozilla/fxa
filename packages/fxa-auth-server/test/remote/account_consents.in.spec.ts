/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import clientFactory from '../client';
import db from '../../lib/oauth/db';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokens = require('../../lib/tokens')(
  { trace: () => {} },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../config').default
);

const Client = clientFactory();

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const PROFILE_SCOPE = 'profile';
const UNKNOWN_SCOPE = 'https://identity.mozilla.com/apps/never-seen';

const DESKTOP = '5882386c6d801776';
const IOS = '1b1a3e44c54fbb58';
const E2E_PUBLIC_CLIENT_ID = '3c49430b43dfba77';
const WEB_RP = 'dcdb5ae7add825d2'; // 123done, deliberately not a native client
const PKCE_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

const newUid = () => crypto.randomBytes(16).toString('hex');

let server: TestServerInstance;
const dirtyUids: string[] = [];

beforeAll(async () => {
  await db.ready();
  server = await getSharedTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

afterEach(async () => {
  for (const id of dirtyUids.splice(0)) {
    await db.deleteAllConsentsForUser(id);
  }
});

function track(id: string) {
  dirtyUids.push(id);
  return id;
}

async function seed(opts: {
  uid: string;
  scope: string;
  service: string;
  clientId?: string;
  now?: number;
}) {
  const { scope, ...rest } = opts;
  await db.recordSignInConsents({
    clientId: DESKTOP,
    now: Date.now(),
    ...rest,
    scopes: [scope],
  });
}

describe('isKnownService (config-driven)', () => {
  it.each([
    ['sync', true],
    ['relay', true],
    ['smartwindow', true],
    ['vpn', true],
    ['not-a-real-service', false],
    ['', false],
    // 16-char hex clientId, to confirm it's not silently matched as a service name
    ['5882386c6d801776', false],
  ])('%s -> %s', (name, expected) => {
    expect(db.isKnownService(name)).toBe(expected);
  });

  it('falsy non-string input returns false', () => {
    expect(db.isKnownService(undefined)).toBe(false);
  });
});

describe('accountAuthorizations repository', () => {
  it('round-trips upsert + find + delete', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: RELAY_SCOPE, service: 'relay' });
    expect(await db.hasConsentForSignIn(id, RELAY_SCOPE, 'relay')).toBe(true);
    await db.deleteAllConsentsForUser(id);
    expect(await db.hasConsentForSignIn(id, RELAY_SCOPE, 'relay')).toBe(false);
  });

  it('returns false for unknown (uid, scope, service)', async () => {
    expect(await db.hasConsentForSignIn(newUid(), RELAY_SCOPE, 'relay')).toBe(
      false
    );
  });

  it('upsert preserves firstAuthorizedTosAt, bumps lastAuthorizedTosAt', async () => {
    const id = track(newUid());
    const t0 = Date.now();
    const t1 = t0 + 86_400_000;
    await seed({
      uid: id,
      scope: SMARTWINDOW_SCOPE,
      service: 'smartwindow',
      now: t0,
    });
    await seed({
      uid: id,
      scope: SMARTWINDOW_SCOPE,
      service: 'smartwindow',
      now: t1,
    });
    const [row] = await db.listAccountConsentsByUid(id);
    expect(Number(row.firstAuthorizedTosAt)).toBe(t0);
    expect(Number(row.lastAuthorizedTosAt)).toBe(t1);
  });

  it('different clientIds for the same (scope, service) are distinct rows', async () => {
    const id = track(newUid());
    await seed({
      uid: id,
      scope: OLDSYNC_SCOPE,
      service: 'sync',
      clientId: DESKTOP,
    });
    await seed({
      uid: id,
      scope: OLDSYNC_SCOPE,
      service: 'sync',
      clientId: IOS,
    });
    expect(await db.listAccountConsentsByUid(id)).toHaveLength(2);
  });

  describe('hasConsentForScopeAndClient (VPN-in-Desktop DAU bandaid)', () => {
    it('returns true for the exact (uid, scope, service, clientId)', async () => {
      const id = track(newUid());
      await seed({
        uid: id,
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: DESKTOP,
      });
      expect(
        await db.hasConsentForScopeAndClient(id, VPN_SCOPE, 'vpn', DESKTOP)
      ).toBe(true);
    });

    it('returns false when only the clientId differs', async () => {
      const id = track(newUid());
      // VPN authorized on another client (e.g. iOS) must not count as Desktop.
      await seed({ uid: id, scope: VPN_SCOPE, service: 'vpn', clientId: IOS });
      expect(
        await db.hasConsentForScopeAndClient(id, VPN_SCOPE, 'vpn', DESKTOP)
      ).toBe(false);
    });

    it('returns false when the scope differs', async () => {
      const id = track(newUid());
      await seed({
        uid: id,
        scope: OLDSYNC_SCOPE,
        service: 'vpn',
        clientId: DESKTOP,
      });
      expect(
        await db.hasConsentForScopeAndClient(id, VPN_SCOPE, 'vpn', DESKTOP)
      ).toBe(false);
    });

    it('returns false for a uid with no consent rows', async () => {
      expect(
        await db.hasConsentForScopeAndClient(
          newUid(),
          VPN_SCOPE,
          'vpn',
          DESKTOP
        )
      ).toBe(false);
    });
  });

  it('records one row per scope from a single multi-scope upsert', async () => {
    const id = track(newUid());
    const now = Date.now();
    await db.recordSignInConsents({
      uid: id,
      scopes: [OLDSYNC_SCOPE, 'profile', 'openid'],
      service: 'sync',
      clientId: DESKTOP,
      now,
    });
    const rows = await db.listAccountConsentsByUid(id);
    expect(rows.map((r) => r.scope).sort()).toEqual([
      OLDSYNC_SCOPE,
      'openid',
      'profile',
    ]);
    expect(await db.hasConsentForSignIn(id, OLDSYNC_SCOPE, 'sync')).toBe(true);
    expect(await db.hasConsentForSignIn(id, 'profile', 'sync')).toBe(true);
  });

  it('multi-scope upsert preserves firstAuthorizedTosAt and bumps lastAuthorizedTosAt per row', async () => {
    const id = track(newUid());
    const t0 = Date.now();
    const t1 = t0 + 86_400_000;
    const batch = {
      uid: id,
      scopes: [OLDSYNC_SCOPE, 'profile'],
      service: 'sync',
      clientId: DESKTOP,
    };
    await db.recordSignInConsents({ ...batch, now: t0 });
    await db.recordSignInConsents({ ...batch, now: t1 });
    const rows = await db.listAccountConsentsByUid(id);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(Number(row.firstAuthorizedTosAt)).toBe(t0);
      expect(Number(row.lastAuthorizedTosAt)).toBe(t1);
    }
  });

  it('does not fail if scopes is empty on recordSignInConsents', async () => {
    const id = track(newUid());
    await db.recordSignInConsents({
      uid: id,
      scopes: [],
      service: 'sync',
      clientId: DESKTOP,
      now: Date.now(),
    });
    expect(await db.listAccountConsentsByUid(id)).toHaveLength(0);
  });

  it('cross-device: hasConsentForSignIn matches across clientIds', async () => {
    const id = track(newUid());
    await seed({
      uid: id,
      scope: OLDSYNC_SCOPE,
      service: 'sync',
      clientId: DESKTOP,
    });
    expect(await db.hasConsentForSignIn(id, OLDSYNC_SCOPE, 'sync')).toBe(true);
  });

  it('deleteAllConsentsForUser scopes to one user', async () => {
    const a = track(newUid());
    const b = track(newUid());
    await seed({ uid: a, scope: RELAY_SCOPE, service: 'relay' });
    await seed({ uid: b, scope: RELAY_SCOPE, service: 'relay' });
    await db.deleteAllConsentsForUser(a);
    expect(await db.listAccountConsentsByUid(a)).toHaveLength(0);
    expect(await db.listAccountConsentsByUid(b)).toHaveLength(1);
  });

  it('removeTokensAndCodes preserves consent rows (password reset path)', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: SMARTWINDOW_SCOPE, service: 'smartwindow' });
    expect(await db.listAccountConsentsByUid(id)).toHaveLength(1);
    await db.removeTokensAndCodes(id);
    expect(await db.listAccountConsentsByUid(id)).toHaveLength(1);
  });
});

describe('hasConsentForExchange decision matrix', () => {
  it('Sync deny wins even with a service=sync consent row', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: OLDSYNC_SCOPE, service: 'sync' });
    expect(await db.hasConsentForExchange(id, OLDSYNC_SCOPE)).toMatchObject({
      result: 'denied',
      service: 'sync',
      reason: 'silent-disallowed',
    });
  });

  it('Relay scope bypasses the consent check', async () => {
    const id = track(newUid());
    expect(await db.hasConsentForExchange(id, RELAY_SCOPE)).toMatchObject({
      result: 'bypass',
      service: 'relay',
    });
  });

  it('mapped scope with consent returns allowed', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: SMARTWINDOW_SCOPE, service: 'smartwindow' });
    expect(await db.hasConsentForExchange(id, SMARTWINDOW_SCOPE)).toMatchObject(
      {
        result: 'allowed',
        service: 'smartwindow',
      }
    );
  });

  it('mapped scope without consent returns denied no-consent', async () => {
    const id = track(newUid());
    expect(await db.hasConsentForExchange(id, SMARTWINDOW_SCOPE)).toMatchObject(
      {
        result: 'denied',
        service: 'smartwindow',
        reason: 'no-consent',
      }
    );
  });

  it('cross-scope: consent for one scope under service=vpn does not authorize a different VPN scope', async () => {
    // A row written under service=vpn for an unrelated scope must NOT
    // silently authorize an exchange for the VPN scope. Consent is per
    // (uid, scope, service); the service tag alone is not a permission.
    const id = track(newUid());
    await seed({ uid: id, scope: OLDSYNC_SCOPE, service: 'vpn' });
    expect(await db.hasConsentForExchange(id, VPN_SCOPE)).toMatchObject({
      result: 'denied',
      service: 'vpn',
      reason: 'no-consent',
    });
  });

  it('VPN consent under service=vpn grants apps/vpn exchange', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: VPN_SCOPE, service: 'vpn' });
    expect(await db.hasConsentForExchange(id, VPN_SCOPE)).toMatchObject({
      result: 'allowed',
      service: 'vpn',
    });
  });

  it('Sync-only consent does not authorize VPN exchange', async () => {
    const id = track(newUid());
    await seed({ uid: id, scope: OLDSYNC_SCOPE, service: 'sync' });
    expect(await db.hasConsentForExchange(id, VPN_SCOPE)).toMatchObject({
      result: 'denied',
      service: 'vpn',
      reason: 'no-consent',
    });
  });

  it.each([
    ['profile (unmapped)', PROFILE_SCOPE],
    ['unknown URL (no mapping)', UNKNOWN_SCOPE],
  ])('%s falls through', async (_label, scope) => {
    const id = track(newUid());
    expect(await db.hasConsentForExchange(id, scope)).toMatchObject({
      result: 'fall-through',
    });
  });
});

describe('#integration - /authorization writes accountAuthorizations rows', () => {
  let testClient: any;

  beforeEach(async () => {
    testClient = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    track(testClient.uid);
  });

  function authParams(overrides: Record<string, unknown> = {}) {
    return {
      client_id: E2E_PUBLIC_CLIENT_ID,
      scope: OLDSYNC_SCOPE,
      state: 'xyz',
      access_type: 'offline',
      code_challenge: PKCE_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      ...overrides,
    };
  }

  it('writes a row with service= when the service is configured', async () => {
    await testClient.createAuthorizationCode(authParams({ service: 'sync' }));
    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ scope: OLDSYNC_SCOPE, service: 'sync' });
    expect(rows[0].clientId.toString('hex')).toBe(E2E_PUBLIC_CLIENT_ID);
  });

  it.each([
    ['unrecognised service=', { service: 'fake-svc' }],
    ['no service= on URL', {}],
  ])(
    'drops %s to empty string for non-canonical scopes',
    async (_label, overrides) => {
      // Use 'profile' so service inference cannot kick in. Canonical
      // service scopes are exercised in their own tests below.
      await testClient.createAuthorizationCode(
        authParams({ ...overrides, scope: 'profile' })
      );
      const rows = await db.listAccountConsentsByUid(testClient.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].service).toBe('');
    }
  );

  it('preserves firstAuthorizedTosAt and bumps lastAuthorizedTosAt on re-grant', async () => {
    await testClient.createAuthorizationCode(authParams({ service: 'sync' }));
    const [first] = await db.listAccountConsentsByUid(testClient.uid);
    const firstAt = Number(first.firstAuthorizedTosAt);
    const lastAt = Number(first.lastAuthorizedTosAt);

    await new Promise((r) => setTimeout(r, 5));
    await testClient.createAuthorizationCode(
      authParams({ service: 'sync', state: 'abc' })
    );

    const [after] = await db.listAccountConsentsByUid(testClient.uid);
    expect(Number(after.firstAuthorizedTosAt)).toBe(firstAt);
    expect(Number(after.lastAuthorizedTosAt)).toBeGreaterThanOrEqual(lastAt);
  });

  it('online grants also write consent rows', async () => {
    await testClient.createAuthorizationCode(
      authParams({ service: 'sync', access_type: 'online' })
    );
    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ scope: OLDSYNC_SCOPE, service: 'sync' });
  });

  it('also records the canonical service scope when service= differs from the requested scope', async () => {
    // Desktop signs in for service=vpn but requests oldsync. The writer
    // must record a row for VPN's canonical scope alongside the oldsync
    // row so later token-exchange for apps/vpn has a per-scope match.
    await testClient.createAuthorizationCode(
      authParams({ service: 'vpn', scope: OLDSYNC_SCOPE })
    );
    const rows = await db.listAccountConsentsByUid(testClient.uid);
    const scopes = rows.map((r) => r.scope).sort();
    expect(scopes).toEqual([OLDSYNC_SCOPE, VPN_SCOPE].sort());
    rows.forEach((r) => expect(r.service).toBe('vpn'));
  });
});

describe('#integration - /authorization flow gates (allowlist, prompt=none)', () => {
  // 123done's client_id is configured in dev.json and is NOT in the
  // default VPN allowlist. It is used here to exercise the off-list path.
  const TWO_THREE_DONE = 'dcdb5ae7add825d2';
  const TWO_THREE_DONE_SCOPE = 'https://identity.mozilla.com/apps/123done';

  let testClient: any;

  beforeEach(async () => {
    testClient = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    track(testClient.uid);
  });

  function authParams(overrides: Record<string, unknown> = {}) {
    return {
      client_id: E2E_PUBLIC_CLIENT_ID,
      scope: OLDSYNC_SCOPE,
      state: 'xyz',
      access_type: 'offline',
      code_challenge: PKCE_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      ...overrides,
    };
  }

  it('prompt=none does not write a consent row', async () => {
    // Silent re-auth must not create a row implicitly. The user did not
    // see a consent UI on this round trip.
    await testClient.createAuthorizationCode(
      authParams({ service: 'sync', prompt: 'none' })
    );
    expect(await db.listAccountConsentsByUid(testClient.uid)).toHaveLength(0);
  });

  it('prompt=none does not bump lastAuthorizedTosAt when a row already exists', async () => {
    await testClient.createAuthorizationCode(authParams({ service: 'sync' }));
    const [first] = await db.listAccountConsentsByUid(testClient.uid);
    const firstLast = Number(first.lastAuthorizedTosAt);

    await new Promise((r) => setTimeout(r, 20));
    await testClient.createAuthorizationCode(
      authParams({ service: 'sync', prompt: 'none', state: 'def' })
    );
    const [after] = await db.listAccountConsentsByUid(testClient.uid);
    expect(Number(after.lastAuthorizedTosAt)).toBe(firstLast);
  });

  it('off-allowlist client (123done) with service=vpn writes NO consent row', async () => {
    // The allowlist gate exists so a non-Mozilla RP cannot forge VPN
    // consent on the user behalf. The /authorization completes (a code
    // is returned), but no accountAuthorizations row is recorded.
    await testClient.createAuthorizationCode({
      client_id: TWO_THREE_DONE,
      scope: TWO_THREE_DONE_SCOPE,
      state: 'abc',
      access_type: 'offline',
      service: 'vpn',
    });
    expect(await db.listAccountConsentsByUid(testClient.uid)).toHaveLength(0);
  });

  it('on-allowlist client with service=vpn + VPN scope writes a single row at the canonical scope', async () => {
    // Mobile VPN cached signin: service=vpn + scope=VPN_SCOPE. The
    // canonical equals the requested scope so Set dedup keeps exactly
    // one row.
    await testClient.createAuthorizationCode(
      authParams({ service: 'vpn', scope: VPN_SCOPE })
    );
    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ scope: VPN_SCOPE, service: 'vpn' });
  });

  it('allowlisted client without service= URL param infers service from a canonical scope', async () => {
    // Reproduces the desktop VPN cached signin flow: client_id is on the
    // VPN allowlist, scope is the VPN canonical, and the URL does NOT
    // carry service=vpn. The writer must infer service=vpn so a later
    // token-exchange for apps/vpn finds the row.
    await testClient.createAuthorizationCode(authParams({ scope: VPN_SCOPE }));
    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ scope: VPN_SCOPE, service: 'vpn' });
  });
});

describe('#integration - allowlist downstream token-exchange consequences', () => {
  // These tests pair an /authorization writer (or a blocked writer) with a
  // token-exchange consumer from an allowed client (iOS) to confirm the
  // gate is observable end-to-end.
  const IOS_REAL = '1b1a3e44c54fbb58';
  const TWO_THREE_DONE = 'dcdb5ae7add825d2';
  const TWO_THREE_DONE_SCOPE = 'https://identity.mozilla.com/apps/123done';
  const GRANT_TOKEN_EXCHANGE =
    'urn:ietf:params:oauth:grant-type:token-exchange';
  const SUBJECT_TOKEN_TYPE_REFRESH =
    'urn:ietf:params:oauth:token-type:refresh_token';

  let testClient: any;
  let refreshToken: string;

  beforeEach(async () => {
    testClient = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    track(testClient.uid);
    const tokens = await testClient.grantOAuthTokensFromSessionToken({
      grant_type: 'fxa-credentials',
      client_id: IOS_REAL,
      access_type: 'offline',
      scope: OLDSYNC_SCOPE,
    });
    refreshToken = tokens.refresh_token;
  });

  it('123done VPN signin does NOT enable a Firefox token-exchange for VPN', async () => {
    await testClient.createAuthorizationCode({
      client_id: TWO_THREE_DONE,
      scope: TWO_THREE_DONE_SCOPE,
      state: 'abc',
      access_type: 'offline',
      service: 'vpn',
    });
    await expect(
      testClient.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: refreshToken,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: VPN_SCOPE,
      })
    ).rejects.toMatchObject({ errno: 112 });
  });

  it('an allowlisted client VPN signin DOES enable a Firefox token-exchange for VPN', async () => {
    await testClient.createAuthorizationCode({
      client_id: E2E_PUBLIC_CLIENT_ID,
      scope: VPN_SCOPE,
      state: 'abc',
      access_type: 'offline',
      code_challenge: PKCE_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      service: 'vpn',
    });
    const result = await testClient.grantOAuthTokens({
      grant_type: GRANT_TOKEN_EXCHANGE,
      subject_token: refreshToken,
      subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      scope: VPN_SCOPE,
    });
    expect(result.access_token).toBeTruthy();
    expect(result.scope).toContain(VPN_SCOPE);
  });
});

describe('#integration - lifecycle: account deletion vs connected-services revoke', () => {
  let testClient: any;

  beforeEach(async () => {
    testClient = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    track(testClient.uid);
  });

  async function writeConsent() {
    await testClient.createAuthorizationCode({
      client_id: E2E_PUBLIC_CLIENT_ID,
      scope: OLDSYNC_SCOPE,
      state: 'xyz',
      access_type: 'offline',
      code_challenge: PKCE_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      service: 'sync',
    });
  }

  it('account deletion removes all consent rows for the user', async () => {
    const uid = testClient.uid;
    await writeConsent();
    expect((await db.listAccountConsentsByUid(uid)).length).toBeGreaterThan(0);

    await testClient.destroyAccount();
    expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
  });

  // Disconnecting a client returns the user to a pre-authorization state: rows
  // whose peer group has no token left behind it go away, so the next token
  // exchange denies. Signing one device out while another stays connected must
  // not withdraw the authorization.
  describe('revoking via authorized-clients (connected services)', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authorizedClients = require('../../lib/oauth/authorized_clients');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ScopeSet = require('fxa-shared').oauth.scopes;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const hashRefreshToken = require('fxa-shared/auth/encrypt').hash;

    const buf = (v: string) => Buffer.from(v, 'hex');
    // generateRefreshToken is one of the auto-proxied MysqlStore methods, so it
    // isn't on the OauthDB facade type.
    const oauthServerDb = db as any;

    async function issueRefreshToken(
      clientId = E2E_PUBLIC_CLIENT_ID,
      scopes: string[] = [PROFILE_SCOPE, OLDSYNC_SCOPE]
    ) {
      const refreshToken = await oauthServerDb.generateRefreshToken({
        clientId: buf(clientId),
        userId: buf(testClient.uid),
        email: testClient.email,
        scope: ScopeSet.fromArray(scopes),
      });
      return hashRefreshToken(refreshToken.token).toString('hex');
    }

    it('denies the next token exchange for the revoked scope', async () => {
      const uid = testClient.uid;
      await seed({
        uid,
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId: E2E_PUBLIC_CLIENT_ID,
      });
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'allowed',
        service: 'vpn',
      });
      const only = await issueRefreshToken(E2E_PUBLIC_CLIENT_ID, [VPN_SCOPE]);

      await authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, only);

      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'denied',
        service: 'vpn',
        reason: 'no-consent',
      });
    });

    it('keeps the rows while the client still has another refresh token', async () => {
      const uid = testClient.uid;
      await writeConsent();
      const before = await db.listAccountConsentsByUid(uid);
      expect(before.length).toBeGreaterThan(0);

      const first = await issueRefreshToken();
      await issueRefreshToken();

      // Sign out one of the two devices on this client.
      await authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, first);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(
        before.length
      );
    });

    it('removes the rows once the last refresh token is signed out', async () => {
      const uid = testClient.uid;
      await writeConsent();
      expect((await db.listAccountConsentsByUid(uid)).length).toBeGreaterThan(
        0
      );

      const first = await issueRefreshToken();
      const second = await issueRefreshToken();
      await authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, first);
      await authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, second);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    it('clears the rows when concurrent disconnects race for the same client', async () => {
      // Settings disconnects every client sharing a display name in parallel,
      // so both requests observe each other's tokens. The conditional DELETE
      // is what keeps the rows from being orphaned here.
      const uid = testClient.uid;
      await writeConsent();
      const first = await issueRefreshToken();
      const second = await issueRefreshToken();

      await Promise.all([
        authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, first),
        authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid, second),
      ]);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    it("leaves a sibling client's row alone", async () => {
      // A row records the client that accepted the ToS, so disconnecting Desktop
      // says nothing about the iOS row. iOS keeps exchanging against its own.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: IOS });
      const desktopToken = await issueRefreshToken(DESKTOP);
      await issueRefreshToken(IOS, [PROFILE_SCOPE, VPN_SCOPE]);

      await authorizedClients.destroy(DESKTOP, uid, desktopToken, 0);

      const rows = await db.listAccountConsentsByUid(uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].clientId.toString('hex')).toBe(IOS);
    });

    it('does not let a mobile disconnect clear a row it only consumed', async () => {
      // Desktop authorized and wrote the only row; mobile used VPN by exchange
      // and wrote none. Mobile signing out must not withdraw Desktop's consent
      // while Desktop is still signed in.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      const mobileToken = await issueRefreshToken(IOS, [
        PROFILE_SCOPE,
        VPN_SCOPE,
      ]);
      // Consent is shared on read, so mobile can exchange against Desktop's row.
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'allowed',
        service: 'vpn',
      });

      await authorizedClients.destroy(IOS, uid, mobileToken, 1);

      const rows = await db.listAccountConsentsByUid(uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].clientId.toString('hex')).toBe(DESKTOP);
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'allowed',
        service: 'vpn',
      });
    });

    it("revokes Desktop's row once Desktop has no session, even with a live peer token", async () => {
      // Denial is not a dead end: iOS's next exchange is refused, FxA prompts,
      // and the user re-consents under the iOS client.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });

      const desktopToken = await issueRefreshToken(DESKTOP);
      await issueRefreshToken(IOS, [PROFILE_SCOPE, VPN_SCOPE]);

      await authorizedClients.destroy(DESKTOP, uid, desktopToken, 0);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'denied',
        service: 'vpn',
        reason: 'no-consent',
      });
    });

    it("revokes Desktop's row when its own remaining token lacks the scope", async () => {
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });

      const desktopToken = await issueRefreshToken(DESKTOP);
      // A second Desktop token, but it only covers Sync.
      await issueRefreshToken(DESKTOP, [PROFILE_SCOPE, OLDSYNC_SCOPE]);

      await authorizedClients.destroy(DESKTOP, uid, desktopToken, 0);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'denied',
        service: 'vpn',
        reason: 'no-consent',
      });
    });

    // A client with only access tokens shows up in Connected Services with a
    // clientId and no refreshTokenId, so disconnecting it destroys no token. Its
    // row used to strand: nothing else could ever reach it. A web RP gets no
    // session protection, since a live browser session says nothing about it.
    it('revokes a web RP row when the destroy removed no token', async () => {
      const uid = testClient.uid;
      await seed({ uid, scope: PROFILE_SCOPE, service: '', clientId: WEB_RP });

      await authorizedClients.destroy(WEB_RP, uid, undefined, 1);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    it('keeps a native client row when the destroy removed no token', async () => {
      // The vacuous case the old gate existed for: Firefox Desktop has rows and
      // no refresh tokens, so finding none must not read as a disconnect.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });

      await authorizedClients.destroy(DESKTOP, uid, undefined, 1);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(1);
    });

    it('revokes nothing when the client had no refresh token to destroy', async () => {
      // Firefox Desktop today: consent rows but no refresh tokens, so finding
      // none must not be read as a disconnect.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });

      await authorizedClients.destroy(DESKTOP, uid);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(1);
    });

    it('leaves rows for a service it is not a peer of alone', async () => {
      // An unconfigured service has a peer group of just the row's own client,
      // so a Desktop disconnect has no say over it. Desktop's own smartwindow
      // row goes, being that service's only peer and holding nothing.
      const uid = testClient.uid;
      await seed({
        uid,
        scope: SMARTWINDOW_SCOPE,
        service: 'smartwindow',
        clientId: DESKTOP,
      });
      await seed({
        uid,
        scope: PROFILE_SCOPE,
        service: '',
        clientId: E2E_PUBLIC_CLIENT_ID,
      });
      const desktopToken = await issueRefreshToken(DESKTOP);

      await authorizedClients.destroy(DESKTOP, uid, desktopToken);

      const rows = await db.listAccountConsentsByUid(uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].clientId.toString('hex')).toBe(E2E_PUBLIC_CLIENT_ID);
    });

    it('revokes via the whole-client branch when tokens are destroyed', async () => {
      // destroy() without a refreshTokenId takes the deleteClientAuthorization
      // path, which derives the destroyed count from affectedRows rather than
      // assuming one.
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      await issueRefreshToken(DESKTOP);
      await issueRefreshToken(DESKTOP);

      await authorizedClients.destroy(DESKTOP, uid);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    it("rejects and revokes nothing when the refresh token is not the user's", async () => {
      const uid = testClient.uid;
      await writeConsent();
      const before = await db.listAccountConsentsByUid(uid);

      await expect(
        authorizedClients.destroy(
          E2E_PUBLIC_CLIENT_ID,
          uid,
          'f'.repeat(64) // never issued
        )
      ).rejects.toThrow();

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(
        before.length
      );
    });
  });

  // POST /account/device/destroy accepts a refreshToken auth strategy, so a
  // browser can sign itself out without going through Settings. That is a
  // withdrawal too, so it must revoke — pinned here because it is a third
  // entry point into devices.destroy() and easy to overlook.
  describe('self-initiated sign-out via POST /account/device/destroy', () => {
    it('revokes the consent rows for the signed-out client', async () => {
      const uid = testClient.uid;
      await seed({
        uid,
        scope: OLDSYNC_SCOPE,
        service: 'sync',
        clientId: E2E_PUBLIC_CLIENT_ID,
      });
      expect((await db.listAccountConsentsByUid(uid)).length).toBeGreaterThan(
        0
      );

      const refresh = await (db as any).generateRefreshToken({
        clientId: Buffer.from(E2E_PUBLIC_CLIENT_ID, 'hex'),
        userId: Buffer.from(uid, 'hex'),
        email: testClient.email,
        scope: `${PROFILE_SCOPE} ${OLDSYNC_SCOPE}`,
      });
      const refreshToken = refresh.token.toString('hex');
      const device = await testClient.updateDeviceWithRefreshToken(
        refreshToken,
        { name: 'self sign-out device', type: 'mobile' }
      );

      await testClient.destroyDeviceWithRefreshToken(refreshToken, device.id);

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });
  });

  // Settings' own "Sign out" button hits POST /session/destroy, not the
  // connected-services route, so it needs its own hook.
  describe('signing out of Settings via POST /session/destroy', () => {
    it('revokes once it was the last session', async () => {
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      await seed({
        uid,
        scope: SMARTWINDOW_SCOPE,
        service: 'smartwindow',
        clientId: DESKTOP,
      });

      await testClient.destroySession();

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    it('keeps the rows while another session remains', async () => {
      const uid = testClient.uid;
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      const second = await Client.login(
        server.publicUrl,
        testClient.email,
        'test password',
        { version: '' }
      );

      await second.destroySession();

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(1);
    });
  });

  // The VPN-in-Desktop case. Desktop registers its device over the session token
  // and discards its sync refresh token right after sign-in, so Settings sends
  // deviceId + sessionTokenId and there is no token anywhere to gate on.
  describe('signing out a session token only device', () => {
    async function seedDesktopVpn(uid: string) {
      await seed({ uid, scope: VPN_SCOPE, service: 'vpn', clientId: DESKTOP });
      await seed({
        uid,
        scope: PROFILE_SCOPE,
        service: 'vpn',
        clientId: DESKTOP,
      });
      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(2);
    }

    it('removes the rows and denies the next exchange', async () => {
      const uid = testClient.uid;
      await seedDesktopVpn(uid);
      const device = await testClient.updateDevice({
        name: 'desktop',
        type: 'desktop',
      });

      // Settings also sends sessionTokenId, but the route only cross-checks it
      // against the device record after the destroy, so it cannot change this.
      await testClient.destroyAttachedClient({ deviceId: device.id });

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'denied',
        service: 'vpn',
        reason: 'no-consent',
      });
    });

    // Reproduces the live flow exactly: Desktop registers its device with the
    // refresh token it just got, then destroys that token. The devices row keeps
    // a dangling refreshTokenId, which is why Settings reports refreshTokenId
    // null and sends only deviceId.
    it('removes the rows when the device refreshTokenId is a dangling pointer', async () => {
      const uid = testClient.uid;
      await seedDesktopVpn(uid);

      const refresh = await (db as any).generateRefreshToken({
        clientId: Buffer.from(DESKTOP, 'hex'),
        userId: Buffer.from(uid, 'hex'),
        email: testClient.email,
        scope: `${PROFILE_SCOPE} ${VPN_SCOPE}`,
      });
      const refreshToken = refresh.token.toString('hex');
      const device = await testClient.updateDeviceWithRefreshToken(
        refreshToken,
        { name: 'desktop', type: 'desktop' }
      );
      // Desktop discards its sync refresh token right after sign-in.
      await (db as any).removeRefreshToken(refresh);
      expect(await db.getRefreshTokenScopesByUid(uid)).toHaveLength(0);

      // The dangling pointer must not be read as token backed, but the row is
      // still sustained while the account has a session left.
      await testClient.destroyAttachedClient({ deviceId: device.id });
      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(2);

      // Settings signs the remaining session out in the same batch.
      await testClient.destroyAttachedClient({
        sessionTokenId: (
          await tokens.SessionToken.fromHex(testClient.sessionToken)
        ).id,
      });
      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
    });

    // The multi-service case: VPN and smartwindow sign-ins in Desktop create a
    // session and no device record, so they reach the route's sessionTokenId
    // branch only. Signing out clears every service Desktop consented to.
    it('clears vpn, smartwindow and sync together from a session sign-out', async () => {
      const uid = testClient.uid;
      for (const [scope, service] of [
        [VPN_SCOPE, 'vpn'],
        [SMARTWINDOW_SCOPE, 'smartwindow'],
        [OLDSYNC_SCOPE, 'sync'],
        [PROFILE_SCOPE, 'vpn'],
      ] as const) {
        await seed({ uid, scope, service, clientId: DESKTOP });
      }
      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(4);

      // No device was ever registered, so this is the only reachable branch.
      await testClient.destroyAttachedClient({
        sessionTokenId: (
          await tokens.SessionToken.fromHex(testClient.sessionToken)
        ).id,
      });

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(0);
      expect(await db.hasConsentForExchange(uid, VPN_SCOPE)).toEqual({
        result: 'denied',
        service: 'vpn',
        reason: 'no-consent',
      });
    });

    it('keeps the rows while another session is still signed in', async () => {
      const uid = testClient.uid;
      await seedDesktopVpn(uid);
      const second = await Client.login(
        server.publicUrl,
        testClient.email,
        'test password',
        { version: '' }
      );

      await second.destroyAttachedClient({
        sessionTokenId: (await tokens.SessionToken.fromHex(second.sessionToken))
          .id,
      });

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(2);
    });

    it('keeps the rows while a second session device is still signed in', async () => {
      // Both Desktops share one row per scope, since the PK is per client, so
      // signing one out must not withdraw the other's authorization.
      const uid = testClient.uid;
      await seedDesktopVpn(uid);
      await testClient.updateDevice({ name: 'first', type: 'desktop' });
      const second = await Client.login(
        server.publicUrl,
        testClient.email,
        'test password',
        { version: '' }
      );
      const device = await second.updateDevice({
        name: 'second',
        type: 'desktop',
      });

      await testClient.destroyAttachedClient({ deviceId: device.id });

      expect(await db.listAccountConsentsByUid(uid)).toHaveLength(2);
    });
  });
});

describe('accountAuthorizations v2 dual-write and read (FXA-14169)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { config } = require('../../config');

  const v1ReadRows = (uid: string) =>
    db.mysql._read(
      'SELECT scope, service FROM accountAuthorizations WHERE uid=?',
      [Buffer.from(uid, 'hex')]
    );

  const v2ReadRows = (uid: string) =>
    db.mysql._read(
      'SELECT scopeId, service FROM accountAuthorizations_v2 WHERE uid=?',
      [Buffer.from(uid, 'hex')]
    );

  const trackedV2: string[] = [];
  const trackV2 = (id: string) => {
    trackedV2.push(id);
    return id;
  };

  afterEach(async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', false);
    config.set('oauthServer.accountAuthorizations.readV2', false);
    for (const id of trackedV2.splice(0)) {
      await db.mysql._write(
        'DELETE FROM accountAuthorizations_v2 WHERE uid=?',
        [Buffer.from(id, 'hex')]
      );
      await db.deleteAllConsentsForUser(id);
    }
  });

  it('writes a matching v2 row with the resolved scopeId when dualWriteV2 is on', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());

    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });

    // Verify directly against the v2 table: one row, with a resolved scopeId.
    const rows = await v2ReadRows(id);
    expect(rows).toHaveLength(1);
    expect(rows[0].scopeId).toEqual(expect.any(Number));
    expect(rows[0].service).toBe('');
  });

  it('reads consent from v2 (not v1) when readV2 is on', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());
    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });
    // Leave only the v2 row standing, so a v2 read is the only thing that can
    // still find this consent. `deleteAllConsentsForUser` now clears both
    // tables, so this deletes from v1 directly instead.
    await db.mysql._write('DELETE FROM accountAuthorizations WHERE uid=?', [
      Buffer.from(id, 'hex'),
    ]);

    config.set('oauthServer.accountAuthorizations.readV2', true);
    expect(await db.hasConsentForSignIn(id, PROFILE_SCOPE, '')).toBe(true);

    config.set('oauthServer.accountAuthorizations.readV2', false);
    expect(await db.hasConsentForSignIn(id, PROFILE_SCOPE, '')).toBe(false);
  });

  it('falls back to v1 when readV2 is on but the row exists only in v1', async () => {
    // dualWriteV2 stays off: the row lands in v1 only.
    const id = trackV2(newUid());
    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });

    config.set('oauthServer.accountAuthorizations.readV2', true);
    expect(await db.hasConsentForSignIn(id, PROFILE_SCOPE, '')).toBe(true);
  });

  it('skips an unseeded scope in v2 but still writes it to v1', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());

    await db.recordSignInConsents({
      uid: id,
      scopes: [UNKNOWN_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });

    // Resolve-only: the unseeded scope can't resolve to a scopeId, so no v2
    // row is written...
    expect(await v2ReadRows(id)).toHaveLength(0);
    // ...but v1 still recorded it, so nothing is dropped.
    expect(await db.hasConsentForSignIn(id, UNKNOWN_SCOPE, '')).toBe(true);
  });

  it('account deletion clears both v1 and v2 rows', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());

    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });
    expect(await v1ReadRows(id)).toHaveLength(1);
    expect(await v2ReadRows(id)).toHaveLength(1);

    await db.deleteAllConsentsForUser(id);

    expect(await v1ReadRows(id)).toHaveLength(0);
    expect(await v2ReadRows(id)).toHaveLength(0);
    // readV2 is off here, so this is the v1 path answering.
    expect(await db.hasConsentForSignIn(id, PROFILE_SCOPE, '')).toBe(false);
  });

  it('sign-out revocation clears both v1 and v2 rows', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());

    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });
    expect(await v1ReadRows(id)).toHaveLength(1);
    expect(await v2ReadRows(id)).toHaveLength(1);

    const [rowToDrop] = await db.listAccountConsentsByUid(id);
    expect(
      await db.deleteAccountConsentRows(id, [
        {
          scope: rowToDrop.scope,
          service: rowToDrop.service,
          clientId: DESKTOP,
          lastAuthorizedTosAt: Number(rowToDrop.lastAuthorizedTosAt),
        },
      ])
    ).toBe(1);

    expect(await v1ReadRows(id)).toHaveLength(0);
    expect(await v2ReadRows(id)).toHaveLength(0);
  });

  it('sign-out revocation clears v2 rows even when dualWriteV2 is off', async () => {
    // Rows outlive the flag, so the delete must not be gated on it.
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());
    await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });
    config.set('oauthServer.accountAuthorizations.dualWriteV2', false);

    const [row] = await db.listAccountConsentsByUid(id);
    await db.deleteAccountConsentRows(id, [
      {
        scope: row.scope,
        service: row.service,
        clientId: DESKTOP,
        lastAuthorizedTosAt: Number(row.lastAuthorizedTosAt),
      },
    ]);

    expect(await v2ReadRows(id)).toHaveLength(0);
  });
});

// FXA-14263: Firefox Desktop requests the Sync scope on every browser flow,
// so signing into another browser service used to file an apps/oldsync consent
// row for a user who never authorized Sync. The bandaid drops that row and
// must leave everything else alone. Branch coverage lives in
// lib/oauth/desktop-sync-dau-authorization-bandaid.spec.ts; this pins the behaviour
// against a real ScopeSet, a real code redemption, and real DB rows.
describe('#integration - Sync consent for non-Sync Desktop sign-ins', () => {
  let testClient: any;

  // The shared PKCE_CODE_CHALLENGE above has no published verifier, and these
  // tests redeem the code, so derive a matching pair (RFC 7636 S256).
  const CODE_VERIFIER = 'WLjNEANMbRNUSG0uQsUZMQGgIL5FUknGz2jRipY79ZC';
  const CODE_CHALLENGE = crypto
    .createHash('sha256')
    .update(CODE_VERIFIER)
    .digest('base64url');

  beforeEach(async () => {
    testClient = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    track(testClient.uid);
  });

  // Mirrors Desktop signing into Smart Window: scope= is the Sync scope
  // regardless of which service the user actually chose.
  function desktopAuthParams(overrides: Record<string, unknown> = {}) {
    return {
      client_id: DESKTOP,
      scope: OLDSYNC_SCOPE,
      state: 'xyz',
      access_type: 'offline',
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: 'S256',
      ...overrides,
    };
  }

  it('omits the Sync consent row when the resolved service is not Sync', async () => {
    await testClient.createAuthorizationCode(
      desktopAuthParams({ service: 'smartwindow' })
    );

    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows.map((r: any) => r.scope)).not.toContain(OLDSYNC_SCOPE);
    expect(rows).toEqual([
      expect.objectContaining({
        scope: SMARTWINDOW_SCOPE,
        service: 'smartwindow',
      }),
    ]);
  });

  it('still grants the Sync scope on the code and the access token', async () => {
    const authResult = await testClient.createAuthorizationCode(
      desktopAuthParams({ service: 'smartwindow' })
    );

    // The authorization response reports the granted scope...
    expect(authResult.scope).toContain(OLDSYNC_SCOPE);

    // ...and the access token minted from that code carries it too, so the
    // bandaid really is ledger-only and does not impact functionality.
    const tokens = await testClient.grantOAuthTokens({
      client_id: DESKTOP,
      code: authResult.code,
      code_verifier: CODE_VERIFIER,
    });
    expect(tokens.scope).toContain(OLDSYNC_SCOPE);
  });

  it('records the Sync consent row when the service is Sync', async () => {
    await testClient.createAuthorizationCode(
      desktopAuthParams({ service: 'sync' })
    );

    const rows = await db.listAccountConsentsByUid(testClient.uid);
    expect(rows).toEqual([
      expect.objectContaining({ scope: OLDSYNC_SCOPE, service: 'sync' }),
    ]);
  });
});

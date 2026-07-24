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

  it('revoking via authorized-clients (connected services) leaves consent rows intact', async () => {
    // Revoking an OAuth client in the Settings "Connected Services" UI
    // sweeps tokens/codes but must NOT clear the consent ledger; the
    // user has not withdrawn their ToS authorization.
    const authorizedClients = require('../../lib/oauth/authorized_clients');
    const uid = testClient.uid;
    await writeConsent();
    const before = await db.listAccountConsentsByUid(uid);
    expect(before.length).toBeGreaterThan(0);

    await authorizedClients.destroy(E2E_PUBLIC_CLIENT_ID, uid);

    const after = await db.listAccountConsentsByUid(uid);
    expect(after).toHaveLength(before.length);
  });
});

describe('accountAuthorizations v2 dual-write and read (FXA-14169)', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { config } = require('../../config');

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

    const result = await db.recordSignInConsents({
      uid: id,
      scopes: [PROFILE_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });

    expect(result).toMatchObject({ v2Written: 1, missingScopes: [] });
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
    // Drop the v1 rows only; the v2 row remains, so a v2 read is the only
    // thing that can still find this consent.
    await db.deleteAllConsentsForUser(id);

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

  it('skips an unseeded scope in v2, still writes v1, and reports it missing', async () => {
    config.set('oauthServer.accountAuthorizations.dualWriteV2', true);
    const id = trackV2(newUid());

    const result = await db.recordSignInConsents({
      uid: id,
      scopes: [UNKNOWN_SCOPE],
      service: '',
      clientId: DESKTOP,
      now: Date.now(),
    });

    expect(result).toMatchObject({
      v2Written: 0,
      missingScopes: [UNKNOWN_SCOPE],
    });
    // No v2 row for the unseeded scope...
    expect(await v2ReadRows(id)).toHaveLength(0);
    // ...but v1 still recorded it, so nothing is dropped.
    expect(await db.hasConsentForSignIn(id, UNKNOWN_SCOPE, '')).toBe(true);
  });
});

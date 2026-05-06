/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { OAUTH_SCOPE_OLD_SYNC } from 'fxa-shared/oauth/constants';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import clientFactory from '../client';
import db from '../../lib/oauth/db';
import { config } from '../../config';
import tokensFactory from '../../lib/tokens';

const Client = clientFactory();
const tokens = tokensFactory({ trace: () => {} }, config);

const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const FIREFOX_DESKTOP_CLIENT_ID = '5882386c6d801776';
const FENIX_CLIENT_ID = 'a2270f727f45f648';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const UNCONFIGURED_SCOPE = 'https://identity.mozilla.com/apps/unconfigured';
const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';
const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

function uid(): string {
  return crypto.randomBytes(16).toString('hex');
}

let server: TestServerInstance;

beforeAll(async () => {
  await db.ready();
  server = await getSharedTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

async function newClient() {
  const email = server.uniqueEmail();
  const password = 'test password';
  const client = await Client.createAndVerify(
    server.publicUrl,
    email,
    password,
    server.mailbox,
    { version: '' }
  );
  await db.deleteAllAccountAuthorizationsForUser(client.uid);
  return client;
}

describe('accountAuthorizations DB layer', () => {
  const dirtyUids: string[] = [];

  afterEach(async () => {
    for (const id of dirtyUids.splice(0)) {
      await db.deleteAllAccountAuthorizationsForUser(id);
    }
  });

  function track(id: string): string {
    dirtyUids.push(id);
    return id;
  }

  it('round-trips upsert + get + delete', async () => {
    const id = track(uid());
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now);
    const row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(row).toBeTruthy();
    expect(row.scope).toBe(RELAY_SCOPE);
    expect(row.service).toBe('relay');
    expect(Number(row.authorizedAt)).toBe(now);

    await db.deleteAccountAuthorization(id, RELAY_SCOPE, 'relay');
    const gone = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(gone).toBeNull();
  });

  it('returns null for an unknown row', async () => {
    const row = await db.getAccountAuthorization(uid(), RELAY_SCOPE, 'relay');
    expect(row).toBeNull();
  });

  it('upsert is a no-op on the primary key (first authorizedAt wins)', async () => {
    const id = track(uid());
    const t0 = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', t0);
    await db.upsertAccountAuthorization(
      id,
      RELAY_SCOPE,
      'relay',
      t0 + 86400000 * 2
    );
    const row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(Number(row.authorizedAt)).toBe(t0);
  });

  it('listAccountAuthorizationsByUid returns all rows for the user', async () => {
    const id = track(uid());
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now);
    await db.upsertAccountAuthorization(
      id,
      SMARTWINDOW_SCOPE,
      'smartwindow',
      now
    );
    const rows = await db.listAccountAuthorizationsByUid(id);
    expect(rows).toHaveLength(2);
    const services = rows.map((r: any) => r.service).sort();
    expect(services).toEqual(['relay', 'smartwindow']);
  });

  it('deleteAllAccountAuthorizationsForUser removes only the target user', async () => {
    const a = track(uid());
    const b = track(uid());
    const now = Date.now();
    await db.upsertAccountAuthorization(a, RELAY_SCOPE, 'relay', now);
    await db.upsertAccountAuthorization(b, RELAY_SCOPE, 'relay', now);

    await db.deleteAllAccountAuthorizationsForUser(a);

    const aRows = await db.listAccountAuthorizationsByUid(a);
    const bRows = await db.listAccountAuthorizationsByUid(b);
    expect(aRows).toHaveLength(0);
    expect(bRows).toHaveLength(1);
  });

  it('the same uid + scope + different service is a different row', async () => {
    const id = track(uid());
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now);
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'other', now);
    const rows = await db.listAccountAuthorizationsByUid(id);
    expect(rows).toHaveLength(2);
  });
});

describe('#integration - /oauth/token exchange honors accountAuthorizations', () => {
  let client: any;

  beforeEach(async () => {
    client = await newClient();
  });

  async function seedSyncRefreshToken() {
    const tokens = await client.grantOAuthTokensFromSessionToken({
      grant_type: 'fxa-credentials',
      client_id: FIREFOX_IOS_CLIENT_ID,
      access_type: 'offline',
      scope: OAUTH_SCOPE_OLD_SYNC,
    });
    expect(tokens.refresh_token).toBeTruthy();
    return tokens;
  }

  it('Relay scope is allowed without an authorization row (carve-out)', async () => {
    const initialTokens = await seedSyncRefreshToken();
    const exchanged = await client.grantOAuthTokens({
      grant_type: GRANT_TOKEN_EXCHANGE,
      subject_token: initialTokens.refresh_token,
      subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      scope: RELAY_SCOPE,
    });
    expect(exchanged.access_token).toBeTruthy();
    expect(exchanged.scope).toContain(RELAY_SCOPE);

    // Carve-out is read-only: token-exchange must not write a row.
    const rows = await db.listAccountAuthorizationsByUid(client.uid);
    const relayRow = rows.find((r: any) => r.service === 'relay');
    expect(relayRow).toBeUndefined();
  });

  it('Smartwindow scope is rejected without an authorization row', async () => {
    const initialTokens = await seedSyncRefreshToken();
    await expect(
      client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: SMARTWINDOW_SCOPE,
      })
    ).rejects.toMatchObject({ errno: 112 });
  });

  it('Smartwindow scope is allowed when a matching authorization row exists', async () => {
    const initialTokens = await seedSyncRefreshToken();
    const now = Date.now();
    await db.upsertAccountAuthorization(
      client.uid,
      SMARTWINDOW_SCOPE,
      'smartwindow',
      now
    );

    const exchanged = await client.grantOAuthTokens({
      grant_type: GRANT_TOKEN_EXCHANGE,
      subject_token: initialTokens.refresh_token,
      subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      scope: SMARTWINDOW_SCOPE,
    });
    expect(exchanged.access_token).toBeTruthy();
    expect(exchanged.scope).toContain(SMARTWINDOW_SCOPE);
  });

  it('Sync scope is rejected even with an authorization row (allowSilentExchange=false)', async () => {
    const initialTokens = await seedSyncRefreshToken();
    const now = Date.now();
    // Even with an authorization record, Sync requires scoped keys and must
    // not be granted silently.
    await db.upsertAccountAuthorization(
      client.uid,
      OAUTH_SCOPE_OLD_SYNC,
      'sync',
      now
    );

    await expect(
      client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: OAUTH_SCOPE_OLD_SYNC,
      })
    ).rejects.toMatchObject({ errno: 112 });
  });

  it('rejects a multi-scope request that includes a silent-disallowed service', async () => {
    // relay is silent-allowed; oldsync is not. First-match resolution would
    // have leaked oldsync via combinedScope.union(); the per-value pass must
    // reject the whole request.
    const initialTokens = await seedSyncRefreshToken();
    await expect(
      client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: `${RELAY_SCOPE} ${OAUTH_SCOPE_OLD_SYNC}`,
      })
    ).rejects.toMatchObject({ errno: 112 });
  });

  it('unconfigured scope falls through to the legacy allowlist and is rejected', async () => {
    const initialTokens = await seedSyncRefreshToken();
    await expect(
      client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: UNCONFIGURED_SCOPE,
      })
    ).rejects.toMatchObject({ errno: 112 });
  });
});

describe('#integration - accountAuthorizations writer hooks', () => {
  describe('login writers', () => {
    it('records a row when fxa-credentials grant issues an offline (refresh) token for a configured service', async () => {
      const client = await newClient();
      const tokens = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      expect(tokens.refresh_token).toBeTruthy();

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].scope).toBe(OAUTH_SCOPE_OLD_SYNC);
      expect(rows[0].service).toBe('sync');
      expect(Number(rows[0].authorizedAt)).toBeGreaterThan(0);
    });

    it('does not record a row for an online-only fxa-credentials grant', async () => {
      const client = await newClient();
      const tokens = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'online',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeUndefined();

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(0);
    });
  });

  describe('sign-out cleanup', () => {
    it('deletes the row when the last refresh token for a service is destroyed', async () => {
      const client = await newClient();
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      expect((await db.listAccountAuthorizationsByUid(client.uid)).length).toBe(
        1
      );

      const attached = await client.attachedClients();
      const oauthEntry = attached.find((c: any) => c.refreshTokenId !== null);
      expect(oauthEntry).toBeTruthy();

      await client.destroyAttachedClient({
        clientId: oauthEntry.clientId,
        refreshTokenId: oauthEntry.refreshTokenId,
      });

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(0);
    });

    it('preserves the row when another refresh token for the same service still exists', async () => {
      const client = await newClient();
      // Two offline grants for Sync via the same Firefox iOS client → two
      // refresh tokens, single accountAuthorizations row (idempotent).
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });

      const attached = await client.attachedClients();
      const oauthEntries = attached.filter(
        (c: any) => c.refreshTokenId !== null
      );
      expect(oauthEntries.length).toBeGreaterThanOrEqual(2);

      // Destroy only the first oauth client.
      await client.destroyAttachedClient({
        clientId: oauthEntries[0].clientId,
        refreshTokenId: oauthEntries[0].refreshTokenId,
      });

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
    });

    it('does not touch accountAuthorizations on a session-only destroy', async () => {
      const client = await newClient();
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      // Seed an extra row to verify it is untouched by a session destroy.
      await db.upsertAccountAuthorization(
        client.uid,
        RELAY_SCOPE,
        'relay',
        Date.now()
      );

      // Destroy the current session via the attached-clients endpoint.
      const sessionTokenId = (
        await tokens.SessionToken.fromHex(client.sessionToken)
      ).id;
      await client.destroyAttachedClient({ sessionTokenId });

      // Both the Sync row (from the offline grant) and the seeded Relay row
      // should still be present — session destroy does not affect refresh
      // tokens or accountAuthorizations.
      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      const services = rows.map((r: any) => r.service).sort();
      expect(services).toEqual(['relay', 'sync']);
    });

    it('leaves an unrelated row in place when destroy targets a different service', async () => {
      const client = await newClient();
      // Real Sync grant: writes a Sync row and creates a Sync refresh token.
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      // Seed a Relay row that has no backing refresh token. Cleanup must
      // not reach across to it because Relay was not in the pre-destroy
      // snapshot of services-with-tokens.
      await db.upsertAccountAuthorization(
        client.uid,
        RELAY_SCOPE,
        'relay',
        Date.now()
      );
      expect((await db.listAccountAuthorizationsByUid(client.uid)).length).toBe(
        2
      );

      // Destroy the Sync refresh token. Cleanup is scoped to services this
      // destroy actually touched, so Sync goes (its last token is gone) but
      // Relay stays untouched.
      const attached = await client.attachedClients();
      const oauthEntry = attached.find((c: any) => c.refreshTokenId !== null);
      await client.destroyAttachedClient({
        clientId: oauthEntry.clientId,
        refreshTokenId: oauthEntry.refreshTokenId,
      });

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows.map((r: any) => r.service)).toEqual(['relay']);
    });
  });

  describe('account deletion', () => {
    it('removes all rows for the deleted uid', async () => {
      const client = await newClient();
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      await db.upsertAccountAuthorization(
        client.uid,
        RELAY_SCOPE,
        'relay',
        Date.now()
      );
      const uid = client.uid;
      expect(
        (await db.listAccountAuthorizationsByUid(uid)).length
      ).toBeGreaterThanOrEqual(2);

      await client.destroyAccount();

      const rows = await db.listAccountAuthorizationsByUid(uid);
      expect(rows).toHaveLength(0);
    });
  });

  describe('authorization_code grant', () => {
    it('writes a row when an authorization_code grant issues a refresh token for a configured service', async () => {
      const client = await newClient();
      const codeRes = await client.createAuthorizationCode({
        client_id: FIREFOX_IOS_CLIENT_ID,
        state: 'abc',
        scope: OAUTH_SCOPE_OLD_SYNC,
        access_type: 'offline',
        response_type: 'code',
        code_challenge: MOCK_CODE_CHALLENGE,
        code_challenge_method: 'S256',
      });
      expect(codeRes.code).toBeTruthy();

      const tokens = await client.grantOAuthTokens({
        grant_type: 'authorization_code',
        client_id: FIREFOX_IOS_CLIENT_ID,
        code: codeRes.code,
        code_verifier: MOCK_CODE_VERIFIER,
      });
      expect(tokens.refresh_token).toBeTruthy();

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].service).toBe('sync');
      expect(rows[0].scope).toBe(OAUTH_SCOPE_OLD_SYNC);
    });
  });
});

describe('#integration - browser-services flows via /oauth/authorization', () => {
  // Pin the per-platform OAuth flows that produce accountAuthorizations rows.
  // These mirror the URLs Firefox surfaces actually send today.

  async function authorizeAndRedeem(
    client: any,
    params: {
      client_id: string;
      scope: string;
      service?: string;
    }
  ): Promise<void> {
    const codeRes = await client.createAuthorizationCode({
      client_id: params.client_id,
      state: 'state-abc',
      scope: params.scope,
      access_type: 'offline',
      response_type: 'code',
      code_challenge: MOCK_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      ...(params.service ? { service: params.service } : {}),
    });
    expect(codeRes.code).toBeTruthy();
    // Code redemption isn't strictly required for the writer (it fires at
    // /oauth/authorization), but exercising it confirms the flow is whole.
    await client.grantOAuthTokens({
      grant_type: 'authorization_code',
      client_id: params.client_id,
      code: codeRes.code,
      code_verifier: MOCK_CODE_VERIFIER,
    });
  }

  function rowsByService(rows: any[]): Record<string, any> {
    return Object.fromEntries(rows.map((r) => [r.service, r]));
  }

  describe('Firefox Desktop (service-ambiguous clientId)', () => {
    it('Smart Window flow writes both smartwindow and sync rows', async () => {
      // service=smartwindow, scope=oldsync → smartwindow row from
      // serviceParam, sync row from wire-scope iteration.
      const client = await newClient();
      await authorizeAndRedeem(client, {
        client_id: FIREFOX_DESKTOP_CLIENT_ID,
        scope: OAUTH_SCOPE_OLD_SYNC,
        service: 'smartwindow',
      });
      const rows = rowsByService(
        await db.listAccountAuthorizationsByUid(client.uid)
      );
      expect(Object.keys(rows).sort()).toEqual(['smartwindow', 'sync']);
      expect(rows.smartwindow.scope).toBe(SMARTWINDOW_SCOPE);
      expect(rows.sync.scope).toBe(OAUTH_SCOPE_OLD_SYNC);
    });

    it('Sync sign-in via avatar menu writes only the sync row (deduped)', async () => {
      // service=sync, scope=oldsync → serviceParam writes sync, wire-scope
      // iteration sees sync already in targets, skips.
      const client = await newClient();
      await authorizeAndRedeem(client, {
        client_id: FIREFOX_DESKTOP_CLIENT_ID,
        scope: OAUTH_SCOPE_OLD_SYNC,
        service: 'sync',
      });
      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].service).toBe('sync');
      expect(rows[0].scope).toBe(OAUTH_SCOPE_OLD_SYNC);
    });

    it('Relay integration flow writes both relay and sync rows', async () => {
      // service=relay, scope=oldsync → relay row from serviceParam (Desktop
      // is in cfg.relay.clientIds in production config), sync row from
      // wire-scope iteration.
      const client = await newClient();
      await authorizeAndRedeem(client, {
        client_id: FIREFOX_DESKTOP_CLIENT_ID,
        scope: OAUTH_SCOPE_OLD_SYNC,
        service: 'relay',
      });
      const rows = rowsByService(
        await db.listAccountAuthorizationsByUid(client.uid)
      );
      expect(Object.keys(rows).sort()).toEqual(['relay', 'sync']);
      expect(rows.relay.scope).toBe(RELAY_SCOPE);
      expect(rows.sync.scope).toBe(OAUTH_SCOPE_OLD_SYNC);
    });

    it('without service= still records the sync row from the wire scope', async () => {
      const client = await newClient();
      await authorizeAndRedeem(client, {
        client_id: FIREFOX_DESKTOP_CLIENT_ID,
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].service).toBe('sync');
    });
  });

  describe('Firefox Android / Fenix (non-ambiguous clientId)', () => {
    it('writes the sync row from wire-scope iteration', async () => {
      const client = await newClient();
      await authorizeAndRedeem(client, {
        client_id: FENIX_CLIENT_ID,
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(1);
      expect(rows[0].service).toBe('sync');
    });
  });
});

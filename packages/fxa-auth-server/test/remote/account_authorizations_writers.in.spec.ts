/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const db = require('../../lib/oauth/db');
const { config } = require('../../config');
const tokens = require('../../lib/tokens')({ trace: () => {} }, config);

const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const REFRESH_THROTTLE_MS = config.get('oauthServer.refreshToken.updateAfter');

let server: TestServerInstance;

beforeAll(async () => {
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

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
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

  describe('refresh-token throttled touch', () => {
    it('does not advance lastUsedAt when the existing value is recent', async () => {
      const client = await newClient();
      const initial = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      const before = (await db.listAccountAuthorizationsByUid(client.uid))[0];

      // Refresh immediately. Throttle should keep lastUsedAt at the original.
      await client.grantOAuthTokens({
        grant_type: 'refresh_token',
        client_id: FIREFOX_IOS_CLIENT_ID,
        refresh_token: initial.refresh_token,
      });

      const after = (await db.listAccountAuthorizationsByUid(client.uid))[0];
      expect(Number(after.lastUsedAt)).toBe(Number(before.lastUsedAt));

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    });

    it('advances lastUsedAt past the throttle window', async () => {
      const client = await newClient();
      const initial = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });

      // Backdate the lastUsedAt past the throttle so the next refresh advances it.
      const stale = Date.now() - REFRESH_THROTTLE_MS - 60_000;
      await db.upsertAccountAuthorization(
        client.uid,
        OAUTH_SCOPE_OLD_SYNC,
        'sync',
        stale,
        stale
      );

      await client.grantOAuthTokens({
        grant_type: 'refresh_token',
        client_id: FIREFOX_IOS_CLIENT_ID,
        refresh_token: initial.refresh_token,
      });

      const row = (await db.listAccountAuthorizationsByUid(client.uid))[0];
      expect(Number(row.lastUsedAt)).toBeGreaterThan(stale);

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
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

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
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
        Date.now(),
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

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    });

    it('cleans up a stale row whose service has no backing token, even when destroy targeted a different service', async () => {
      const client = await newClient();
      // Real Sync grant: writes a Sync row and creates a Sync refresh token.
      await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      // Pre-existing inconsistency: Relay row with no Relay refresh token
      // backing it. Cleanup should reconcile this regardless of which
      // service the current destroy targeted.
      await db.upsertAccountAuthorization(
        client.uid,
        RELAY_SCOPE,
        'relay',
        Date.now(),
        Date.now()
      );
      expect((await db.listAccountAuthorizationsByUid(client.uid)).length).toBe(
        2
      );

      // Destroying the Sync refresh token triggers cleanup. After-only
      // reconciliation walks every accountAuthorizations row and drops any
      // not currently backed by a token, so both Sync (no backing token now)
      // and Relay (never had one) get removed.
      const attached = await client.attachedClients();
      const oauthEntry = attached.find((c: any) => c.refreshTokenId !== null);
      await client.destroyAttachedClient({
        clientId: oauthEntry.clientId,
        refreshTokenId: oauthEntry.refreshTokenId,
      });

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      expect(rows).toHaveLength(0);
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
        Date.now(),
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
    const MOCK_CODE_VERIFIER = 'abababababababababababababababababababababa';
    const MOCK_CODE_CHALLENGE = 'YPhkZqm08uTfwjNSiYcx80-NPT9Zn94kHboQW97KyV0';

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

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    });
  });

  describe('multi-scope refresh tokens', () => {
    it('refresh-token use fills in rows for scopes added later (e.g. via token-exchange)', async () => {
      const client = await newClient();
      // Single-scope offline sign-in; writer creates the Sync row.
      const initial = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      // Token-exchange unions Relay onto the same refresh token; the read
      // path itself does not write a row.
      const exchanged = await client.grantOAuthTokens({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: initial.refresh_token,
        subject_token_type: 'urn:ietf:params:oauth:token-type:refresh_token',
        scope: RELAY_SCOPE,
      });
      expect(exchanged.scope).toContain(OAUTH_SCOPE_OLD_SYNC);
      expect(exchanged.scope).toContain(RELAY_SCOPE);

      // Backdate Sync row so the next touch fires (throttle window passed).
      const stale = Date.now() - 25 * 3600 * 1000;
      await db.upsertAccountAuthorization(
        client.uid,
        OAUTH_SCOPE_OLD_SYNC,
        'sync',
        stale,
        stale
      );

      // Use the combined refresh token. touchAuthorizationsForRefresh iterates
      // every scope on the token and inserts the missing Relay row.
      await client.grantOAuthTokens({
        grant_type: 'refresh_token',
        client_id: FIREFOX_IOS_CLIENT_ID,
        refresh_token: exchanged.refresh_token,
      });

      const rows = await db.listAccountAuthorizationsByUid(client.uid);
      const services = rows.map((r: any) => r.service).sort();
      expect(services).toEqual(['relay', 'sync']);

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    });
  });

  describe('token-exchange touches subject_token row', () => {
    it('subject_token validation bumps lastUsedAt on the source row past throttle', async () => {
      // The touch lives in OauthDB.getRefreshToken, so token-exchange's
      // subject_token lookup bumps lastUsedAt too. Pin this so a future
      // refactor cannot silently change the semantics.
      const client = await newClient();
      const initial = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: FIREFOX_IOS_CLIENT_ID,
        access_type: 'offline',
        scope: OAUTH_SCOPE_OLD_SYNC,
      });

      // Backdate so the throttle window allows the touch to fire.
      const stale = Date.now() - 25 * 3600 * 1000;
      await db.upsertAccountAuthorization(
        client.uid,
        OAUTH_SCOPE_OLD_SYNC,
        'sync',
        stale,
        stale
      );

      await client.grantOAuthTokens({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: initial.refresh_token,
        subject_token_type: 'urn:ietf:params:oauth:token-type:refresh_token',
        scope: RELAY_SCOPE,
      });

      const row = (await db.listAccountAuthorizationsByUid(client.uid))[0];
      expect(Number(row.lastUsedAt)).toBeGreaterThan(stale);

      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    });
  });
});

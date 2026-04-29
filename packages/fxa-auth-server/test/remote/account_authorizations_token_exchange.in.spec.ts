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

const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const UNCONFIGURED_SCOPE = 'https://identity.mozilla.com/apps/unconfigured';
const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';

let server: TestServerInstance;

beforeAll(async () => {
  server = await getSharedTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

describe('#integration - /oauth/token exchange honors accountAuthorizations', () => {
  let client: any;

  beforeEach(async () => {
    const email = server.uniqueEmail();
    const password = 'test password';
    client = await Client.createAndVerify(
      server.publicUrl,
      email,
      password,
      server.mailbox,
      { version: '' }
    );
    // Clean any pre-existing rows for this fresh uid so each test starts clean.
    await db.deleteAllAccountAuthorizationsForUser(client.uid);
  });

  afterEach(async () => {
    if (client?.uid) {
      await db.deleteAllAccountAuthorizationsForUser(client.uid);
    }
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
    try {
      await client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: SMARTWINDOW_SCOPE,
      });
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.errno).toBe(112); // forbidden
    }
  });

  it('Smartwindow scope is allowed when a matching authorization row exists', async () => {
    const initialTokens = await seedSyncRefreshToken();
    const now = Date.now();
    await db.upsertAccountAuthorization(
      client.uid,
      SMARTWINDOW_SCOPE,
      'smartwindow',
      now,
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
    // Pretend the user has been authorized for Sync; silent exchange should
    // still be rejected because Sync requires scoped keys.
    await db.upsertAccountAuthorization(
      client.uid,
      OAUTH_SCOPE_OLD_SYNC,
      'sync',
      now,
      now
    );

    try {
      await client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: OAUTH_SCOPE_OLD_SYNC,
      });
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.errno).toBe(112);
    }
  });

  it('unconfigured scope falls through to the legacy allowlist and is rejected', async () => {
    const initialTokens = await seedSyncRefreshToken();
    try {
      await client.grantOAuthTokens({
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: initialTokens.refresh_token,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: UNCONFIGURED_SCOPE,
      });
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.errno).toBe(112);
    }
  });
});

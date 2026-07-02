/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAUTH_SCOPE_OLD_SYNC } from 'fxa-shared/oauth/constants';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import clientFactory from '../client';
import db from '../../lib/oauth/db';

const Client = clientFactory();

const IOS = '1b1a3e44c54fbb58';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const UNCONFIGURED_SCOPE = 'https://identity.mozilla.com/apps/never-seen';

const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';

let server: TestServerInstance;

beforeAll(async () => {
  await db.ready();
  server = await getSharedTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

describe('#integration - /oauth/token exchange honors accountAuthorizations', () => {
  let client: any;
  let refreshToken: string;

  beforeEach(async () => {
    client = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      'test password',
      server.mailbox,
      { version: '' }
    );
    await db.deleteAllConsentsForUser(client.uid);
    const tokens = await client.grantOAuthTokensFromSessionToken({
      grant_type: 'fxa-credentials',
      client_id: IOS,
      access_type: 'offline',
      scope: OAUTH_SCOPE_OLD_SYNC,
    });
    refreshToken = tokens.refresh_token;
  });

  afterEach(async () => {
    if (client?.uid) {
      await db.deleteAllConsentsForUser(client.uid);
    }
  });

  async function seed(scope: string, service: string) {
    await db.recordSignInConsents({
      uid: client.uid,
      scopes: [scope],
      service,
      clientId: IOS,
      now: Date.now(),
    });
  }

  function exchange(scope: string) {
    return client.grantOAuthTokens({
      grant_type: GRANT_TOKEN_EXCHANGE,
      subject_token: refreshToken,
      subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      scope,
    });
  }

  it('Relay bypass grants without a consent row and writes none', async () => {
    const result = await exchange(RELAY_SCOPE);
    expect(result.access_token).toBeTruthy();
    expect(result.scope).toContain(RELAY_SCOPE);
    const rows = await db.listAccountConsentsByUid(client.uid);
    expect(rows.find((r: any) => r.service === 'relay')).toBeUndefined();
  });

  it('SmartWindow without consent rejects', async () => {
    await expect(exchange(SMARTWINDOW_SCOPE)).rejects.toMatchObject({
      errno: 112,
    });
  });

  it('SmartWindow with matching consent grants', async () => {
    await seed(SMARTWINDOW_SCOPE, 'smartwindow');
    const result = await exchange(SMARTWINDOW_SCOPE);
    expect(result.access_token).toBeTruthy();
    expect(result.scope).toContain(SMARTWINDOW_SCOPE);
  });

  it('cross-scope: a consent row under service=vpn for a different scope does NOT authorize a VPN exchange', async () => {
    await seed(OAUTH_SCOPE_OLD_SYNC, 'vpn');
    await expect(exchange(VPN_SCOPE)).rejects.toMatchObject({ errno: 112 });
  });

  it('VPN consent under service=vpn grants apps/vpn exchange', async () => {
    await seed(VPN_SCOPE, 'vpn');
    const result = await exchange(VPN_SCOPE);
    expect(result.access_token).toBeTruthy();
    expect(result.scope).toContain(VPN_SCOPE);
  });

  it('Sync-only consent does not authorize VPN exchange', async () => {
    await seed(OAUTH_SCOPE_OLD_SYNC, 'sync');
    await expect(exchange(VPN_SCOPE)).rejects.toMatchObject({ errno: 112 });
  });

  it('Sync deny wins even with a service=sync consent row', async () => {
    await seed(OAUTH_SCOPE_OLD_SYNC, 'sync');
    await expect(exchange(OAUTH_SCOPE_OLD_SYNC)).rejects.toMatchObject({
      errno: 112,
    });
  });

  it('multi-scope including Sync is rejected (deny wins)', async () => {
    await expect(
      exchange(`${RELAY_SCOPE} ${OAUTH_SCOPE_OLD_SYNC}`)
    ).rejects.toMatchObject({ errno: 112 });
  });

  it('unconfigured scope falls through to clients.allowedScopes', async () => {
    await expect(exchange(UNCONFIGURED_SCOPE)).rejects.toBeTruthy();
  });

  it('token-exchange does NOT bump lastAuthorizedTosAt on the consent row', async () => {
    // The exchange flow is read-only against accountAuthorizations.
    // lastAuthorizedTosAt is the per-RP ToS timestamp and only the
    // /authorization writer is allowed to move it.
    await seed(SMARTWINDOW_SCOPE, 'smartwindow');
    const [before] = await db.listAccountConsentsByUid(client.uid);
    const beforeLast = Number(before.lastAuthorizedTosAt);

    await new Promise((r) => setTimeout(r, 20));
    const result = await exchange(SMARTWINDOW_SCOPE);
    expect(result.access_token).toBeTruthy();

    const [after] = await db.listAccountConsentsByUid(client.uid);
    expect(Number(after.lastAuthorizedTosAt)).toBe(beforeLast);
  });
});

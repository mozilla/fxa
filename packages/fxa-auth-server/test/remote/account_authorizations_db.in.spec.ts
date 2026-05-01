/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';

const db = require('../../lib/oauth/db');
const { config } = require('../../config');

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';

const REFRESH_THROTTLE_MS = config.get('oauthServer.refreshToken.updateAfter');

function uid(): string {
  return crypto.randomBytes(16).toString('hex');
}

describe('accountAuthorizations DB layer', () => {
  beforeAll(async () => {
    await db.ready();
  });

  it('round-trips upsert + get + delete', async () => {
    const id = uid();
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now, now);
    const row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(row).toBeTruthy();
    expect(row.scope).toBe(RELAY_SCOPE);
    expect(row.service).toBe('relay');
    expect(Number(row.authorizedAt)).toBe(now);
    expect(Number(row.lastUsedAt)).toBe(now);

    await db.deleteAccountAuthorization(id, RELAY_SCOPE, 'relay');
    const gone = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(gone).toBeNull();
  });

  it('returns null for an unknown row', async () => {
    const row = await db.getAccountAuthorization(uid(), RELAY_SCOPE, 'relay');
    expect(row).toBeNull();
  });

  it('upsert is idempotent on the primary key', async () => {
    const id = uid();
    const t0 = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', t0, t0);
    // Second upsert with the unthrottled wrapper still preserves authorizedAt
    // because ON DUPLICATE KEY UPDATE only touches lastUsedAt.
    await db.upsertAccountAuthorization(
      id,
      RELAY_SCOPE,
      'relay',
      t0 + 86400000 * 2,
      t0 + 86400000 * 2
    );
    const row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(Number(row.authorizedAt)).toBe(t0);
    expect(Number(row.lastUsedAt)).toBe(t0 + 86400000 * 2);
  });

  it('touchAccountAuthorization respects the throttle window', async () => {
    const id = uid();
    const t0 = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', t0, t0);

    // Within throttle window: lastUsedAt should NOT advance.
    const withinWindow = t0 + Math.floor(REFRESH_THROTTLE_MS / 2);
    await db.touchAccountAuthorization(id, RELAY_SCOPE, 'relay', withinWindow);
    let row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(Number(row.lastUsedAt)).toBe(t0);

    // Past throttle window: lastUsedAt should advance.
    const pastWindow = t0 + REFRESH_THROTTLE_MS + 1000;
    await db.touchAccountAuthorization(id, RELAY_SCOPE, 'relay', pastWindow);
    row = await db.getAccountAuthorization(id, RELAY_SCOPE, 'relay');
    expect(Number(row.lastUsedAt)).toBe(pastWindow);
  });

  it('listAccountAuthorizationsByUid returns all rows for the user', async () => {
    const id = uid();
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now, now);
    await db.upsertAccountAuthorization(
      id,
      SMARTWINDOW_SCOPE,
      'smartwindow',
      now,
      now
    );
    const rows = await db.listAccountAuthorizationsByUid(id);
    expect(rows).toHaveLength(2);
    const services = rows.map((r: any) => r.service).sort();
    expect(services).toEqual(['relay', 'smartwindow']);
  });

  it('deleteAllAccountAuthorizationsForUser removes only the target user', async () => {
    const a = uid();
    const b = uid();
    const now = Date.now();
    await db.upsertAccountAuthorization(a, RELAY_SCOPE, 'relay', now, now);
    await db.upsertAccountAuthorization(b, RELAY_SCOPE, 'relay', now, now);

    await db.deleteAllAccountAuthorizationsForUser(a);

    const aRows = await db.listAccountAuthorizationsByUid(a);
    const bRows = await db.listAccountAuthorizationsByUid(b);
    expect(aRows).toHaveLength(0);
    expect(bRows).toHaveLength(1);

    await db.deleteAllAccountAuthorizationsForUser(b);
  });

  it('the same uid + scope + different service is a different row', async () => {
    const id = uid();
    const now = Date.now();
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'relay', now, now);
    await db.upsertAccountAuthorization(id, RELAY_SCOPE, 'other', now, now);
    const rows = await db.listAccountAuthorizationsByUid(id);
    expect(rows).toHaveLength(2);
  });
});

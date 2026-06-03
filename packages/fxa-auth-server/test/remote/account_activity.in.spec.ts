/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import db from '../../lib/oauth/db';

const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const SEND_SCOPE = 'https://identity.mozilla.com/apps/send';
const NOTES_SCOPE = 'https://identity.mozilla.com/apps/notes';
const EMPTY_SCOPE = '';
// Deliberately never registered in the scopes table so the FK can't resolve it.
const UNREGISTERED_SCOPE = 'https://identity.mozilla.com/apps/not-registered';

const DESKTOP = '5882386c6d801776';
const IOS = '1b1a3e44c54fbb58';

const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Fixed base timestamp so every test computes its t0/t1 from the same anchor.
const T0 = 1_700_000_000_000;

const newUid = () => crypto.randomBytes(16).toString('hex');

let server: TestServerInstance;
const dirtyUids: string[] = [];

async function ensureScope(scope: string) {
  // getScope short-circuits to null for non-URL scopes (e.g. the empty
  // string), so it can't tell us whether the row already exists. Insert and
  // tolerate the unique-key collision when the scope is already present
  // (seeded from config, or left by a prior run on the shared test DB).
  try {
    await db.registerScope({ scope, hasScopedKeys: false });
  } catch (err: any) {
    if (err?.code !== 'ER_DUP_ENTRY') {
      throw err;
    }
  }
}

beforeAll(async () => {
  await db.ready();
  server = await getSharedTestServer();
  // accountActivity.scopeId is a FK into scopes, so every scope a test records
  // must exist there first. The empty-string scope covers no-scope grants
  // (e.g. token exchange). UNREGISTERED_SCOPE is intentionally left out.
  await ensureScope(OLDSYNC_SCOPE);
  await ensureScope(SEND_SCOPE);
  await ensureScope(NOTES_SCOPE);
  await ensureScope(EMPTY_SCOPE);
}, 120000);

afterAll(async () => {
  await server.stop();
});

afterEach(async () => {
  // removeTokensAndCodes deletes the user's accountActivity rows.
  for (const uid of dirtyUids.splice(0)) {
    await db.removeTokensAndCodes(uid);
  }
});

function track(uid: string) {
  dirtyUids.push(uid);
  return uid;
}

async function record(opts: {
  uid: string;
  clientId?: string;
  scopes?: string[];
  now: number;
  throttleMs?: number;
}) {
  return db.recordAccountActivity(
    opts.uid,
    opts.clientId || DESKTOP,
    opts.scopes || [],
    opts.now,
    opts.throttleMs || THROTTLE_MS
  );
}

describe('accountActivity write path', () => {
  it('records one row per resolved scope with firstSeenAt = lastSeenAt = now', async () => {
    const uid = track(newUid());
    const now = T0;
    const { missingScopes } = await record({
      uid,
      scopes: [OLDSYNC_SCOPE, SEND_SCOPE, NOTES_SCOPE],
      now,
    });

    expect(missingScopes).toEqual([]);
    const rows = await db.listAccountActivity(uid, DESKTOP);
    expect(rows.map((r: any) => r.scope).sort()).toEqual(
      [NOTES_SCOPE, OLDSYNC_SCOPE, SEND_SCOPE].sort()
    );
    for (const row of rows) {
      expect(Number(row.firstSeenAt)).toBe(now);
      expect(Number(row.lastSeenAt)).toBe(now);
    }
  });

  it('records a single empty-scope row when the grant has no scopes', async () => {
    const uid = track(newUid());
    const now = T0;
    const { missingScopes } = await record({ uid, scopes: [], now });

    expect(missingScopes).toEqual([]);
    const rows = await db.listAccountActivity(uid, DESKTOP);
    expect(rows).toHaveLength(1);
    expect(rows[0].scope).toBe(EMPTY_SCOPE);
    expect(Number(rows[0].firstSeenAt)).toBe(now);
    expect(Number(rows[0].lastSeenAt)).toBe(now);
  });

  it('separates rows per clientId for the same user', async () => {
    const uid = track(newUid());
    const now = T0;
    await record({ uid, clientId: DESKTOP, scopes: [OLDSYNC_SCOPE], now });
    await record({ uid, clientId: IOS, scopes: [OLDSYNC_SCOPE], now });

    expect(await db.listAccountActivity(uid, DESKTOP)).toHaveLength(1);
    expect(await db.listAccountActivity(uid, IOS)).toHaveLength(1);
  });
});

describe('accountActivity missing scopes', () => {
  it('records the scopes that exist and reports the ones that do not', async () => {
    const uid = track(newUid());
    const { missingScopes } = await record({
      uid,
      scopes: [OLDSYNC_SCOPE, UNREGISTERED_SCOPE],
      now: T0,
    });

    expect(missingScopes).toEqual([UNREGISTERED_SCOPE]);
    const rows = await db.listAccountActivity(uid, DESKTOP);
    expect(rows).toHaveLength(1);
    expect(rows[0].scope).toBe(OLDSYNC_SCOPE);
  });

  it('writes nothing and reports all scopes when none are registered', async () => {
    const uid = track(newUid());
    const { missingScopes } = await record({
      uid,
      scopes: [UNREGISTERED_SCOPE],
      now: T0,
    });

    expect(missingScopes).toEqual([UNREGISTERED_SCOPE]);
    expect(await db.listAccountActivity(uid, DESKTOP)).toHaveLength(0);
  });
});

describe('accountActivity throttle', () => {
  it('does not advance lastSeenAt within the throttle window', async () => {
    const uid = track(newUid());
    const t0 = T0;
    const t1 = t0 + Math.floor(THROTTLE_MS / 2);
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: t0 });
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: t1 });

    const [row] = await db.listAccountActivity(uid, DESKTOP);
    expect(Number(row.firstSeenAt)).toBe(t0);
    expect(Number(row.lastSeenAt)).toBe(t0);
  });

  it('advances lastSeenAt after the throttle window, leaving firstSeenAt immutable', async () => {
    const uid = track(newUid());
    const t0 = T0;
    const t1 = t0 + THROTTLE_MS + 1000; // outside the window
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: t0 });
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: t1 });

    const [row] = await db.listAccountActivity(uid, DESKTOP);
    expect(Number(row.firstSeenAt)).toBe(t0);
    expect(Number(row.lastSeenAt)).toBe(t1);
  });

  it('per-scope lastSeenAt is unaffected by grants for other scopes on the same client', async () => {
    // The pollution case: recording a different scope on a later grant must not
    // bump an existing scope's lastSeenAt. t1 is past the throttle window so any
    // erroneous cross-scope write would be visible rather than throttle-masked.
    const uid = track(newUid());
    const t0 = T0;
    const t1 = t0 + THROTTLE_MS + 1000;
    await record({ uid, scopes: [SEND_SCOPE], now: t0 });
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: t1 });

    const rows = await db.listAccountActivity(uid, DESKTOP);
    const byScope = Object.fromEntries(rows.map((r: any) => [r.scope, r]));

    expect(Number(byScope[SEND_SCOPE].firstSeenAt)).toBe(t0);
    expect(Number(byScope[SEND_SCOPE].lastSeenAt)).toBe(t0); // stayed
    expect(Number(byScope[OLDSYNC_SCOPE].firstSeenAt)).toBe(t1);
    expect(Number(byScope[OLDSYNC_SCOPE].lastSeenAt)).toBe(t1);
  });

  it('does not duplicate rows when the same scope is recorded twice', async () => {
    const uid = track(newUid());
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: T0 });
    await record({ uid, scopes: [OLDSYNC_SCOPE], now: T0 });

    expect(await db.listAccountActivity(uid, DESKTOP)).toHaveLength(1);
  });
});

describe('accountActivity account deletion', () => {
  it('removeTokensAndCodes deletes the activity rows', async () => {
    const uid = track(newUid());
    await record({
      uid,
      scopes: [OLDSYNC_SCOPE, SEND_SCOPE, NOTES_SCOPE],
      now: T0,
    });
    expect(await db.listAccountActivity(uid, DESKTOP)).toHaveLength(3);

    // Inline cleanup so the afterEach hook doesn't double-process this uid.
    dirtyUids.pop();
    await db.removeTokensAndCodes(uid);

    expect(await db.listAccountActivity(uid, DESKTOP)).toHaveLength(0);
  });

  it('scopes deletion to one user', async () => {
    const a = track(newUid());
    const b = track(newUid());
    await record({ uid: a, scopes: [OLDSYNC_SCOPE], now: T0 });
    await record({ uid: b, scopes: [OLDSYNC_SCOPE], now: T0 });

    dirtyUids.splice(dirtyUids.indexOf(a), 1);
    await db.removeTokensAndCodes(a);

    expect(await db.listAccountActivity(a, DESKTOP)).toHaveLength(0);
    expect(await db.listAccountActivity(b, DESKTOP)).toHaveLength(1);
  });
});

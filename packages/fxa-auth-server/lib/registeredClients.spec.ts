/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { OAuthDb } from './registeredClients';
import { getRegisteredClientIds, reset } from './registeredClients';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
}));

/**
 * Creates a mock OAuthDb whose `getAllClientIds` resolves with the given
 * hex-encoded client ID strings converted to Buffer rows.
 */
function makeDb(ids: string[]): OAuthDb {
  return {
    mysql: {
      getAllClientIds: jest
        .fn()
        .mockResolvedValue(ids.map((id) => ({ id: Buffer.from(id, 'hex') }))),
    },
  };
}

describe('getRegisteredClientIds', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    reset();
    jest.useRealTimers();
  });

  it('fetches from DB on first call and returns client IDs', async () => {
    const db = makeDb(['aabbccdd11223344', 'deadbeefdeadbeef']);

    const result = await getRegisteredClientIds(db);

    expect(db.mysql.getAllClientIds).toHaveBeenCalledTimes(1);
    expect(result).toEqual(new Set(['aabbccdd11223344', 'deadbeefdeadbeef']));
  });

  it('returns cached IDs on second call within 60 seconds', async () => {
    const db = makeDb(['aabbccdd11223344']);

    await getRegisteredClientIds(db);
    jest.advanceTimersByTime(30_000);
    const result = await getRegisteredClientIds(db);

    expect(db.mysql.getAllClientIds).toHaveBeenCalledTimes(1);
    expect(result).toEqual(new Set(['aabbccdd11223344']));
  });

  it('refetches from DB after 60 seconds', async () => {
    const db = makeDb(['aabbccdd11223344']);

    await getRegisteredClientIds(db);
    jest.advanceTimersByTime(61_000);
    await getRegisteredClientIds(db);

    expect(db.mysql.getAllClientIds).toHaveBeenCalledTimes(2);
  });

  it('returns empty Set and captures to Sentry when DB fails on first call', async () => {
    const error = new Error('DB unavailable');
    const db: OAuthDb = {
      mysql: { getAllClientIds: jest.fn().mockRejectedValue(error) },
    };

    const result = await getRegisteredClientIds(db);

    expect(result).toEqual(new Set());
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('returns last successful Set and captures to Sentry when DB fails on subsequent call', async () => {
    const db = makeDb(['aabbccdd11223344']);

    // Successful first fetch
    await getRegisteredClientIds(db);

    // DB fails on refetch
    jest.advanceTimersByTime(61_000);
    const error = new Error('DB unavailable');
    (db.mysql.getAllClientIds as jest.Mock).mockRejectedValueOnce(error);
    const result = await getRegisteredClientIds(db);

    expect(result).toEqual(new Set(['aabbccdd11223344']));
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('returns an empty Set when DB returns no clients', async () => {
    const db = makeDb([]);

    const result = await getRegisteredClientIds(db);

    expect(result).toEqual(new Set());
  });

  it('re-fetches exactly at the 60-second boundary', async () => {
    const db = makeDb(['aabbccdd11223344']);

    await getRegisteredClientIds(db);
    jest.advanceTimersByTime(60_001);
    await getRegisteredClientIds(db);

    expect(db.mysql.getAllClientIds).toHaveBeenCalledTimes(2);
  });
});

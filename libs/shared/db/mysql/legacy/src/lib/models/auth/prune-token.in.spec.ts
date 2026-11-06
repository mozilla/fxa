/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import type { ILogger } from '@fxa/shared/log';
import { StatsD } from 'hot-shots';
import { Knex } from 'knex';
import 'reflect-metadata';
import { PruneTokens, SessionToken } from '.';
import { MetaData } from './metadata';
import { uuidTransformer } from '../../transformers';
import { defaultOpts, testDatabaseSetup } from '../../testing/helpers';
import crypto from 'crypto';

const toRandomBuff = (size: number) =>
  uuidTransformer.to(crypto.randomBytes(size).toString('hex'));

describe('PruneTokens', () => {
  const pruneInterval = 50;
  const maxJitter = 101;
  const statsd = { increment: jest.fn() };
  const log = { error: jest.fn() };
  let knex: Knex;
  let pruneTokens: PruneTokens;
  let now: number;
  let tokenIds: string[] = [];
  const age = 1e9;
  const uid = uuidTransformer.to('0123456789abcdef0000000000000000');

  beforeAll(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });

    knex.client.isDebugging = false;

    await MetaData.query().insert({
      name: 'prunedUntil',
      value: '10',
    });

    await MetaData.query().insert({
      name: 'lastPrunedAt',
      value: '10',
    });
  }, 20000);

  afterAll(async () => {
    await knex?.destroy();
  });

  beforeEach(async () => {
    pruneTokens = new PruneTokens(
      statsd as unknown as StatsD,
      log as unknown as ILogger
    );
    await SessionToken.query().delete().execute();

    now = Date.now();

    // Add a 100 dummy token that were created 10s ago
    for (let i = 0; i < 100; i++) {
      await insertToken(
        uid,
        toRandomBuff(32),
        toRandomBuff(32),
        now - age - i * 1000,
        now - age - i * 1000
      );
    }

    // Sanity check that a token does exist
    const sessionTokens1 = await SessionToken.query()
      .select('tokenId', 'createdAt')
      .orderBy('createdAt', 'DESC');

    // Keep a list of ordered token IDs for later tests.
    tokenIds = sessionTokens1.map((x) => x.tokenId);

    expect(sessionTokens1.length).toBe(100);
    expect(sessionTokens1[0].createdAt > sessionTokens1[99].createdAt).toBe(
      true
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function insertToken(
    uid: Buffer,
    tokenId: Buffer,
    tokenData: Buffer,
    createdAt: number,
    lastAccessTime: number
  ) {
    await SessionToken.query().insert({
      tokenId,
      tokenData,
      uid,
      createdAt,
      lastAccessTime,
      uaBrowser: '',
      uaBrowserVersion: '',
      uaOS: '',
      uaOSVersion: '',
      uaDeviceType: '',
      uaFormFactor: '',
      authAt: 1,
      verificationMethod: 0,
      verifiedAt: 0,
      mustVerify: 0,
    } as any);
  }

  it('Does not prune if maxAge is 0', async () => {
    pruneTokens.prune(0, 0, 10000);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );
    const sessionToken = await SessionToken.query().select('tokenId').first();
    expect(sessionToken).toEqual(expect.anything());
  });

  it('Does not prune if windowSize is 0', async () => {
    pruneTokens.prune(1, 1, 0);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );
    const sessionToken = await SessionToken.query().select('tokenId').first();
    expect(sessionToken).toEqual(expect.anything());
  });

  it('Prunes expired tokens', async () => {
    const result = await pruneTokens.prune(1, 1, 10000);

    // Check for the session token again
    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).toBe(0);
    expect(result.uids?.[0]?.uid.toString('hex')).toBe(uid.toString('hex'));
    expect(statsd.increment).toHaveBeenCalledWith('prune-tokens.start');
    expect(statsd.increment).toHaveBeenCalledWith('prune-tokens.end');
    expect(statsd.increment).not.toHaveBeenCalledWith('prune-tokens.error');
    expect(statsd.increment).toHaveBeenCalledWith(
      'prune-tokens.complete.session-tokens-deleted',
      100
    );
  });

  it('Will not prune valid tokens', async () => {
    const result = await pruneTokens.prune(now, now, 10000);
    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).toBe(100);
    expect(result.uids).toBeNull();
  });

  it('Finds large accounts', async () => {
    const result = await pruneTokens.findLargeAccounts(0, 1000);
    expect(result.length).toBe(1);
    expect(result[0].uid.toString('hex')).toBe(uid.toString('hex'));
    expect(statsd.increment).toHaveBeenCalledWith('find-large-accounts.start');
    expect(statsd.increment).toHaveBeenCalledWith('find-large-accounts.end');
    expect(statsd.increment).not.toHaveBeenCalledWith(
      'find-large-accounts.error'
    );
    expect(statsd.increment).toHaveBeenCalledWith(
      'find-large-accounts.complete.total-accounts',
      1
    );
  });

  it('Find large accounts respects session limit', async () => {
    const result = await pruneTokens.findLargeAccounts(1000, 1000);
    expect(result.length).toBe(0);
  });

  it('Finds large accounts and respects row limit', async () => {
    const result = await pruneTokens.findLargeAccounts(0, 0);
    expect(result.length).toBe(0);
  });

  it('Limit sessions', async () => {
    const result = await pruneTokens.limitSessions(
      uid.toString('hex'),
      0,
      1000
    );
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x: any) => x.tokenId.toString('hex')
    );

    expect(result.outputs['@totalDeletions']).toBe(100);
    expect(tokens.length).toBe(0);
    // should have have removed the newest token
    expect(tokens).not.toContain(tokenIds[0]);
    // should have removed the oldest token
    expect(tokens).not.toContain(tokenIds[tokenIds.length - 1]);
    expect(statsd.increment).toHaveBeenCalledWith('limit-sessions.start');
    expect(statsd.increment).toHaveBeenCalledWith('limit-sessions.end');
    expect(statsd.increment).not.toHaveBeenCalledWith('limit-sessions.error');
    expect(statsd.increment).toHaveBeenCalledWith(
      'limit-sessions.complete.total-deletions',
      100
    );
  });

  it('Limits sessions and respects deletion limit', async () => {
    const result = await pruneTokens.limitSessions(uid.toString('hex'), 0, 0);
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x: any) => x.tokenId.toString('hex')
    );

    expect(result.outputs['@totalDeletions']).toBe(0);
    expect(tokens.length).toBe(100);
    // should have kept the newest token
    expect(tokens).toContain(tokenIds[0]);
    // should have kept the oldest token
    expect(tokens).toContain(tokenIds[tokenIds.length - 1]);
  });

  it('Limits sessions and respects max sessions', async () => {
    const result = await pruneTokens.limitSessions(
      uid.toString('hex'),
      40,
      1000
    );
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x: any) => x.tokenId.toString('hex')
    );

    expect(result.outputs['@totalDeletions']).toBe(60);
    expect(tokens.length).toBe(40);
    // should have kept the newest token
    expect(tokens).toContain(tokenIds[0]);
    // should have removed the oldest token
    expect(tokens).not.toContain(tokenIds[tokenIds.length - 1]);
  });

  it('Respects max sessions and deletion limit', async () => {
    const result = await pruneTokens.limitSessions(uid.toString('hex'), 50, 10);
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x: any) => x.tokenId.toString('hex')
    );

    expect(result.outputs['@totalDeletions']).toBe(10);
    expect(tokens.length).toBe(90);
    expect(tokens).toContain(tokenIds[0]);
    expect(tokens).not.toContain(tokenIds[tokenIds.length - 1]);
  });

  describe('limitSessions_4', () => {
    const OLDER_DEVICE = {
      id: Buffer.from('a1'.repeat(16), 'hex'),
      refreshTokenId: Buffer.from('b1'.repeat(32), 'hex'),
    };
    const NEWER_DEVICE = {
      id: Buffer.from('a2'.repeat(16), 'hex'),
      refreshTokenId: Buffer.from('b2'.repeat(32), 'hex'),
    };
    let newestFirst: Buffer[];

    const sessionTokenIds = async (): Promise<Buffer[]> =>
      (
        await knex('sessionTokens')
          .select('tokenId')
          .orderBy('createdAt', 'desc')
      ).map((x) => x.tokenId);

    beforeEach(async () => {
      newestFirst = await sessionTokenIds();
      await knex('devices').delete();
      // Only the two oldest sessions have a device.
      await knex('devices').insert([
        { uid, ...NEWER_DEVICE, sessionTokenId: newestFirst[98] },
        { uid, ...OLDER_DEVICE, sessionTokenId: newestFirst[99] },
      ]);
    });

    afterEach(async () => {
      await knex('devices').delete();
    });

    async function limitSessions4(maxSessions: number) {
      const [[deletedDevices]] = await knex.raw(
        'CALL limitSessions_4(?, ?, ?, @totalDeletions)',
        [uid, maxSessions, 1000]
      );
      const { totalDeletions } = await knex
        .select(knex.raw('@totalDeletions AS totalDeletions'))
        .first();
      return { deletedDevices, totalDeletions };
    }

    it('deletes deviceless sessions before older sessions with a device', async () => {
      await limitSessions4(40);

      expect(await sessionTokenIds()).toEqual([
        ...newestFirst.slice(0, 38),
        newestFirst[98],
        newestFirst[99],
      ]);
    });

    it('returns no devices when only deviceless sessions are deleted', async () => {
      const { deletedDevices } = await limitSessions4(40);

      expect(deletedDevices).toEqual([]);
    });

    it('deletes the oldest device session once deviceless sessions run out', async () => {
      await limitSessions4(1);

      expect(await sessionTokenIds()).toEqual([newestFirst[98]]);
    });

    it('returns the devices it deletes', async () => {
      const { deletedDevices } = await limitSessions4(1);

      expect(deletedDevices).toEqual([OLDER_DEVICE]);
    });

    it('keeps the devices of sessions it keeps', async () => {
      await limitSessions4(1);

      expect(await knex('devices').select('id')).toEqual([
        { id: NEWER_DEVICE.id },
      ]);
    });

    it('counts only session tokens in totalDeletions', async () => {
      const { totalDeletions } = await limitSessions4(1);

      expect(totalDeletions).toBe(99);
    });

    describe('with concurrent transactions', () => {
      const CALL = 'CALL limitSessions_4(?, ?, ?, @totalDeletions)';
      const RACING_DEVICE = {
        id: Buffer.from('a3'.repeat(16), 'hex'),
        refreshTokenId: Buffer.from('b3'.repeat(32), 'hex'),
      };
      // Each transaction pins one connection, so the sides can interleave.
      let caller: Knex.Transaction;
      let blocker: Knex.Transaction;
      let attacher: Knex.Transaction;

      beforeEach(async () => {
        caller = await knex.transaction();
        blocker = await knex.transaction();
        attacher = await knex.transaction();
      });

      afterEach(async () => {
        // In lock order: the caller may wait on the blocker, the attacher on
        // the caller.
        for (const trx of [blocker, caller, attacher]) {
          if (!trx.isCompleted()) {
            await trx.raw('SET SESSION innodb_lock_wait_timeout = DEFAULT');
            await trx.rollback();
          }
        }
      });

      async function connectionsWaitingOnRowLocks(expected: number) {
        for (let attempt = 0; attempt < 100; attempt++) {
          const [[{ waits }]] = await knex.raw(
            'SELECT COUNT(*) AS waits FROM performance_schema.data_lock_waits'
          );
          if (waits >= expected) {
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        throw new Error(`Fewer than ${expected} connections hit a row lock`);
      }

      async function devicesDeleted() {
        const remainingIds: Buffer[] = (await knex('devices').select('id')).map(
          (device) => device.id
        );
        return [OLDER_DEVICE, NEWER_DEVICE, RACING_DEVICE].filter(
          ({ id }) => !remainingIds.some((remaining) => remaining.equals(id))
        );
      }

      it('releases the prune lock when it errors', async () => {
        await blocker('sessionTokens')
          .where({ tokenId: newestFirst[97] })
          .forUpdate()
          .select('tokenId');
        await caller.raw('SET SESSION innodb_lock_wait_timeout = 1');

        // 1205 is ER_LOCK_WAIT_TIMEOUT.
        await expect(caller.raw(CALL, [uid, 99, 1000])).rejects.toMatchObject({
          errno: 1205,
        });

        // The caller's connection is still open, so a leaked lock stays held.
        const [[{ isFree }]] = await blocker.raw(
          "SELECT IS_FREE_LOCK('fxa-auth-server.prune-lock') AS isFree"
        );
        expect(isFree).toBe(1);
      });

      it('returns every device it deletes when one is attached before it ranks sessions', async () => {
        // Left uncommitted until the call is waiting on it.
        await attacher('devices').insert({
          uid,
          ...RACING_DEVICE,
          sessionTokenId: newestFirst[97],
        });

        const call = caller.raw(CALL, [uid, 99, 1000]).then((result) => result);
        await connectionsWaitingOnRowLocks(1);
        await attacher.commit();
        const [[returnedDevices]] = await call;

        expect(returnedDevices).toEqual(await devicesDeleted());
      });

      it('returns every device it deletes when one is attached during its delete', async () => {
        // The ranking never reads unverifiedTokens, so the call gets as far as
        // its DELETE before it waits on this row.
        await blocker('unverifiedTokens').insert({
          tokenId: newestFirst[97],
          tokenVerificationId: Buffer.from('c1'.repeat(16), 'hex'),
          uid,
        });
        const call = caller.raw(CALL, [uid, 99, 1000]).then((result) => result);
        await connectionsWaitingOnRowLocks(1);

        const attach = attacher('devices')
          .insert({ uid, ...RACING_DEVICE, sessionTokenId: newestFirst[97] })
          .then((result) => result);
        await connectionsWaitingOnRowLocks(2);
        await blocker.rollback();
        const [[returnedDevices]] = await call;
        await attach;
        await attacher.commit();

        expect(returnedDevices).toEqual(await devicesDeleted());
      });
    });
  });

  it('Handles prune error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.prune(1, 1, 10000);

    expect(statsd.increment).toHaveBeenCalledWith('prune-tokens.error');
    expect(log.error).toHaveBeenCalledWith('prune-tokens', expect.anything());
  });

  it('Handles findLargeAccounts error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.findLargeAccounts(0, 1000);

    expect(statsd.increment).toHaveBeenCalledWith('find-large-accounts.error');
    expect(log.error).toHaveBeenCalledWith(
      'find-large-accounts',
      expect.anything()
    );
  });

  it('Handles limitSessions error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.limitSessions(uid.toString('hex'), 0, 1000);

    expect(statsd.increment).toHaveBeenCalledWith('limit-sessions.error');
    expect(log.error).toHaveBeenCalledWith('limit-sessions', expect.anything());
  });
});

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

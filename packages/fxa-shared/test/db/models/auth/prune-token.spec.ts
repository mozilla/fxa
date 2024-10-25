/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import { StatsD } from 'hot-shots';
import { Knex } from 'knex';
import 'mocha';
import 'reflect-metadata';
import sinon from 'sinon';
import { PruneTokens, SessionToken } from '../../../../db/models/auth';
import { MetaData } from '../../../../db/models/auth/metadata';
import { uuidTransformer } from '../../../../db/transformers';
import { ILogger } from '../../../../log';
import { defaultOpts, testDatabaseSetup } from '../../helpers';
import crypto from 'crypto';

const toRandomBuff = (size: number) =>
  uuidTransformer.to(crypto.randomBytes(size).toString('hex'));

describe('#integration - PruneTokens', () => {
  const sandbox = sinon.createSandbox();
  const pruneInterval = 50;
  const maxJitter = 101;
  const statsd = sandbox.spy({
    increment: (..._args: any[]) => {},
  });
  const log = sandbox.spy({
    error: (..._args: any[]) => {},
  });
  let knex: Knex;
  let pruneTokens: PruneTokens;
  let now: number;
  let tokenIds: string[] = [];
  const age = 1e9;
  const uid = uuidTransformer.to('0123456789abcdef0000000000000000');

  before(async () => {
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
  });

  after(async () => {
    await knex.destroy();
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
    let sessionTokens1 = await SessionToken.query()
      .select('tokenId', 'createdAt')
      .orderBy('createdAt', 'DESC');

    // Keep a list of ordered token IDs for later tests.
    tokenIds = sessionTokens1.map((x) => x.tokenId);

    expect(sessionTokens1.length).to.equal(100);
    expect(sessionTokens1[0].createdAt > sessionTokens1[99].createdAt).to.be
      .true;
  });

  afterEach(() => {
    sandbox.reset();
    sinon.restore();
  });

  async function insertToken(
    uid: Buffer,
    tokenId: Buffer,
    tokenData: Buffer,
    createdAt: number,
    lastAccessTime: number
  ) {
    await SessionToken.create({
      id: tokenId.toString('hex'),
      data: tokenData.toString('hex'),
      uid: uid.toString('hex'),
      createdAt,
      uaBrowser: '',
      uaBrowserVersion: '',
      uaOS: '',
      uaOSVersion: '',
      uaDeviceType: '',
      uaFormFactor: '',
      tokenVerificationId: '',
      mustVerify: false,
      providerId: 1,
    });
    await SessionToken.update({
      id: tokenId.toString('hex'),
      lastAccessTime,
      uaBrowser: '',
      uaBrowserVersion: '',
      uaOS: '',
      uaOSVersion: '',
      uaDeviceType: '',
      uaFormFactor: '',
      authAt: 1,
      mustVerify: false,
    });
  }

  it('Does not prune if maxAge is 0', async () => {
    pruneTokens.prune(0, 0, 10000);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );
    const sessionToken = await SessionToken.query().select('tokenId').first();
    expect(sessionToken).to.exist;
  });

  it('Does not prune if windowSize is 0', async () => {
    pruneTokens.prune(1, 1, 0);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );
    const sessionToken = await SessionToken.query().select('tokenId').first();
    expect(sessionToken).to.exist;
  });

  it('Prunes expired tokens', async () => {
    const result = await pruneTokens.prune(1, 1, 10000);

    // Check for the session token again
    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).to.equal(0);
    expect(result.uids?.[0]?.uid.toString('hex')).to.equal(uid.toString('hex'));
    expect(statsd.increment.calledWith('prune-tokens.start')).to.be.true;
    expect(statsd.increment.calledWith('prune-tokens.end')).to.be.true;
    expect(statsd.increment.calledWith('prune-tokens.error')).to.be.false;
    expect(
      statsd.increment.calledWith(
        'prune-tokens.complete.session-tokens-deleted',
        100
      )
    ).to.be.true;
  });

  it('Will not prune valid tokens', async () => {
    const result = await pruneTokens.prune(now, now, 10000);
    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).to.equal(100);
    expect(result.uids).to.be.null;
  });

  it('Finds large accounts', async () => {
    const result = await pruneTokens.findLargeAccounts(0, 1000);
    expect(result.length).to.equal(1);
    expect(result[0].uid.toString('hex')).to.equal(uid.toString('hex'));
    expect(statsd.increment.calledWith('find-large-accounts.start')).to.be.true;
    expect(statsd.increment.calledWith('find-large-accounts.end')).to.be.true;
    expect(statsd.increment.calledWith('find-large-accounts.error')).to.be
      .false;
    expect(
      statsd.increment.calledWith(
        'find-large-accounts.complete.total-accounts',
        1
      )
    ).to.be.true;
  });

  it('Find large accounts respects session limit', async () => {
    const result = await pruneTokens.findLargeAccounts(1000, 1000);
    expect(result.length).to.equal(0);
  });

  it('Finds large accounts and respects row limit', async () => {
    const result = await pruneTokens.findLargeAccounts(0, 0);
    expect(result.length).to.equal(0);
  });

  it('Limit sessions', async () => {
    const result = await pruneTokens.limitSessions(
      uid.toString('hex'),
      0,
      1000
    );
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x) => x.tokenId
    );

    expect(result.outputs['@totalDeletions']).to.equal(100);
    expect(tokens.length).to.equal(0);
    expect(tokens).to.not.include(
      tokenIds[0],
      'should have have removed the newest token'
    );
    expect(tokens).to.not.include(
      tokenIds[tokenIds.length - 1],
      'should have removed the oldest token'
    );
    expect(statsd.increment.calledWith('limit-sessions.start')).to.be.true;
    expect(statsd.increment.calledWith('limit-sessions.end')).to.be.true;
    expect(statsd.increment.calledWith('limit-sessions.error')).to.be.false;
    expect(
      statsd.increment.calledWith(
        'limit-sessions.complete.total-deletions',
        100
      )
    ).to.be.true;
  });

  it('Limits sessions and respects deletion limit', async () => {
    const result = await pruneTokens.limitSessions(uid.toString('hex'), 0, 0);
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x) => x.tokenId
    );

    expect(result.outputs['@totalDeletions']).to.equal(0);
    expect(tokens.length).to.equal(100);
    expect(tokens).to.include(tokenIds[0], 'should have kept the newest token');
    expect(tokens).to.include(
      tokenIds[tokenIds.length - 1],
      'should have kept the oldest token'
    );
  });

  it('Limits sessions and respects max sessions', async () => {
    const result = await pruneTokens.limitSessions(
      uid.toString('hex'),
      40,
      1000
    );
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x) => x.tokenId
    );

    expect(result.outputs['@totalDeletions']).to.equal(60);
    expect(tokens.length).to.equal(40);
    expect(tokens).to.include(tokenIds[0], 'should have kept the newest token');
    expect(tokens).to.not.include(
      tokenIds[tokenIds.length - 1],
      'should have removed the oldest token'
    );
  });

  it('Respects max sessions and deletion limit', async () => {
    const result = await pruneTokens.limitSessions(uid.toString('hex'), 50, 10);
    const tokens = (await SessionToken.query().select('tokenId')).map(
      (x) => x.tokenId
    );

    expect(result.outputs['@totalDeletions']).to.equal(10);
    expect(tokens.length).to.equal(90);
    expect(tokens).to.include(tokenIds[0]);
    expect(tokens).to.not.include(tokenIds[tokenIds.length - 1]);
  });

  it('Handles prune error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.prune(1, 1, 10000);

    expect(statsd.increment.calledWith('prune-tokens.error')).to.be.true;
    expect(log.error.calledWith('prune-tokens')).to.be.true;
  });

  it('Handles findLargeAccounts error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.findLargeAccounts(0, 1000);

    expect(statsd.increment.calledWith('find-large-accounts.error')).to.be.true;
    expect(log.error.calledWith('find-large-accounts')).to.be.true;
  });

  it('Handles limitSessions error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.limitSessions(uid.toString('hex'), 0, 1000);

    expect(statsd.increment.calledWith('limit-sessions.error')).to.be.true;
    expect(log.error.calledWith('limit-sessions')).to.be.true;
  });
});

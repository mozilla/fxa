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

describe('PruneTokens', () => {
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
  const age = 1e4;

  before(async () => {
    knex = await testDatabaseSetup({
      ...defaultOpts,
      auth: true,
      oauth: false,
      profile: false,
    });

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

    // Add a dummy token that was created 10s ago
    await insertToken(now - age, now - age);

    // Sanity check that a token does exist
    const sessionTokens1 = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );
    expect(sessionTokens1.length).to.equal(1);
  });

  afterEach(() => {
    sandbox.reset();
  });

  async function insertToken(createdAt: number, lastAccessTime: number) {
    await SessionToken.query().insert({
      tokenId: uuidTransformer.to('0123456789abcdef0123456789abcdef'),
      tokenData: uuidTransformer.to('0123456789abcdef0123456789abcdef'),
      uid: uuidTransformer.to('0123456789abcdef'),
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
    });
  }

  it('Does not prune if maxAge is 0', async () => {
    pruneTokens.prune(0, 0);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );
    const sessionToken = await SessionToken.query().select('tokenId').first();
    expect(sessionToken).to.exist;
  });

  it('Prunes expired tokens', async () => {
    pruneTokens.prune(1, 1);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );

    // Check for the session token again
    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).to.equal(0);
  });

  it('Will not prune valid tokens', async () => {
    pruneTokens.prune(now - age - 1, 1 - age - 1);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );

    const sessionTokens = await SessionToken.query().select(
      'tokenId',
      'createdAt'
    );

    expect(sessionTokens.length).to.equal(1);
  });

  it('Will limit sessions', async () => {
    const result = await pruneTokens.limitSessions(0);

    expect(result.outputs['@accountsOverLimit']).to.equal(1);
    expect(result.outputs['@totalDeletions']).to.equal(1);
    expect(result.results?.rows[1]?.[0]?.uid?.toString('hex')).to.equal(
      '0123456789abcdef0000000000000000'
    );
  });

  it('Calls statsd', async () => {
    pruneTokens.prune(1, 1);
    await new Promise((resolve) =>
      setTimeout(resolve, pruneInterval + maxJitter)
    );

    expect(statsd.increment.calledWith('prune-tokens.start')).to.be.true;
    expect(statsd.increment.calledWith('prune-tokens.error')).to.be.false;
    expect(
      statsd.increment.calledWith(
        'prune-tokens.complete.session-tokens-deleted',
        1
      )
    ).to.be.true;
  });

  it('Handles error', async () => {
    // Causes error, will be reset on subsequent test
    (PruneTokens as any).knex = null;

    await pruneTokens.prune(1, 1);

    expect(statsd.increment.calledWith('prune-tokens.error')).to.be.true;
    expect(log.error.calledWith('prune-tokens')).to.be.true;
  });
});

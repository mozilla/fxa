/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('path');
const mocks = require(`../../test/mocks`);
const crypto = require('crypto');

const config = require('../../config').default.getProperties();
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);

const { Account } = require('fxa-shared/db/models/auth/account');
const { SessionToken } = require('fxa-shared/db/models/auth/session-token');
const {
  PasswordChangeToken,
} = require('fxa-shared/db/models/auth/password-change-token');
const {
  PasswordForgotToken,
} = require('fxa-shared/db/models/auth/password-forgot-token');
const { AccountResetToken, Device } = require('fxa-shared/db/models/auth');
const { UnblockCodes } = require('fxa-shared/db/models/auth/unblock-codes');
const { SignInCodes } = require('fxa-shared/db/models/auth/sign-in-codes');
const { uuidTransformer } = require('fxa-shared/db/transformers');

const log = mocks.mockLog();
const Token = require('../../lib/tokens')(log, config);
const { createDB } = require('../../lib/db');
const DB = createDB(config, log, Token, UnblockCode);

const redis = require('../../lib/redis')(
  {
    ...config.redis,
    ...config.redis.sessionTokens,
    maxttl: 1337,
  },
  mocks.mockLog()
);

describe('#integration - scripts/prune-tokens', () => {
  let db: any;

  const toRandomBuff = (size: number) =>
    uuidTransformer.to(crypto.randomBytes(size).toString('hex'));
  const toZeroBuff = (size: number) =>
    Buffer.from(Array(size).fill(0), 'hex').toString('hex');

  const cwd = path.resolve(__dirname, '../..');

  // Use a really big number for max age.
  const maxAge = 10000;

  // Set createdAt 1 day before maxAge
  const createdAt =
    Date.now() -
    moment.duration(maxAge, 'days').asMilliseconds() -
    moment.duration(1, 'day').asMilliseconds();
  const uid = uuidTransformer.to(crypto.randomBytes(16).toString('hex'));
  const email = `${crypto.randomBytes(16).toString('hex')}blue@test.com`;
  const account = {
    uid,
    createdAt,
    email,
    emailCode: toZeroBuff(16),
    normalizedEmail: email,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: toZeroBuff(32),
    authSalt: toZeroBuff(32),
    kA: toZeroBuff(32),
    wrapWrapKb: toZeroBuff(32),
    verifierSetAt: createdAt,
    locale: 'en-US',
  };

  const sessionToken = () => ({
    id: toRandomBuff(32),
    data: toRandomBuff(32),
    tokenVerificationId: null,
    uid,
    createdAt,
    lastAccessTime: Date.now(),
    location: {
      city: 'pdx',
      state: 'or',
      stateCode: 'or',
      country: 'usa',
      countryCode: 'usa',
    },
    uaBrowser: '',
    uaBrowserVersion: '',
    uaOS: '',
    uaOSVersion: '',
    uaDeviceType: '',
    uaFormFactor: '',
  });

  function serialize(t: any) {
    return {
      ...t,
      ...{
        id: t.id.toString('hex'),
        data: t.data.toString('hex'),
        uid: t.uid.toString('hex'),
      },
    };
  }

  const device = (uid: any, sessionTokenId: any) => ({
    id: toRandomBuff(16),
    uid,
    sessionTokenId,
    refreshTokenId: null,
    name: null,
    type: null,
    createdAt: Date.now(),
    pushCallback: null,
    pushPublicKey: null,
    pushAuthKey: null,
    availableCommands: null,
  });

  const passwordChangeToken = {
    id: toRandomBuff(32),
    data: toRandomBuff(32),
    uid,
    createdAt,
  };

  const passwordForgotToken = {
    id: toRandomBuff(32),
    data: toRandomBuff(32),
    passCode: toRandomBuff(3),
    tries: 0,
    uid,
    createdAt,
  };

  const accountResetToken = {
    tokenId: toRandomBuff(32),
    tokenData: toRandomBuff(32),
    uid,
    createdAt,
  };

  const unblockCode = {
    unblockCodeHash: toRandomBuff(32),
    uid,
    createdAt,
  };

  const signInCode = {
    hash: toRandomBuff(32),
    flowid: toRandomBuff(32),
    uid,
    createdAt,
  };

  async function clearDb() {
    await Device.knexQuery().where({ uid }).del();
    await SessionToken.knexQuery().where({ uid }).del();
    await PasswordChangeToken.knexQuery().where({ uid }).del();
    await PasswordForgotToken.knexQuery().where({ uid }).del();
    await AccountResetToken.knexQuery().where({ uid }).del();
    await UnblockCodes.knexQuery().where({ uid }).del();
    await SignInCodes.knexQuery().where({ uid }).del();
  }

  beforeAll(async () => {
    db = await DB.connect(
      Object.assign({}, config, { log: { level: 'error' } })
    );
    await clearDb();
    await Account.create(account);
  });

  afterAll(async () => {
    await db.deleteAccount(account);
    await clearDb();
    await db.close();
    await redis.close();
  });

  it('prints help', async () => {
    const { stdout } = await exec(
      'NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts --help',
      {
        cwd,
      }
    );

    expect(/Usage:/.test(stdout)).toBe(true);
  });

  it('prints warnings when args are missing', async () => {
    const { stderr } = await exec(
      `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts `,
      {
        cwd,
        shell: '/bin/bash',
      }
    );
    expect(/skipping limit sessions operation./.test(stderr)).toBe(true);
    expect(/skipping token pruning operation./.test(stderr)).toBe(true);
  });

  it('parses args', async () => {
    const { stderr } = await exec(
      `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts --maxTokenAge=0 --maxTokenAgeWindowSize=0 --maxCodeAge=0 --maxSessions=0 --maxSessionsMaxAccounts=0 --maxSessionsMaxDeletions=0  --maxSessionsBatchSize=0 --wait=1`,
      {
        cwd,
        shell: '/bin/bash',
      }
    );

    expect(stderr).toMatch(/"maxTokenAge":"0"/);
    expect(stderr).toMatch(/"maxCodeAge":"0"/);
    expect(stderr).toMatch(/"maxSessions":"0"/);
    expect(stderr).toMatch(/"maxSessionsMaxAccounts":"0"/);
    expect(stderr).toMatch(/"maxSessionsMaxDeletions":"0"/);
    expect(stderr).toMatch(/"maxSessionsBatchSize":"0"/);
    expect(stderr).toMatch(/"maxTokenAgeWindowSize":"0"/);
    expect(stderr).toMatch(/"wait":"1"/);
  });

  describe('prune tokens', () => {
    let token: any;

    beforeAll(async () => {
      await clearDb();

      token = sessionToken();
      await SessionToken.create(token);
      await PasswordChangeToken.create(passwordChangeToken);
      await PasswordForgotToken.create(passwordForgotToken);
      await AccountResetToken.knexQuery().insert(accountResetToken);
      await UnblockCodes.knexQuery().insert(unblockCode);
      await SignInCodes.knexQuery().insert(signInCode);
      await redis.touchSessionToken(uid.toString('hex'), serialize(token));
    });

    afterAll(async () => {
      await clearDb();
      await redis.del(uid.toString('hex'));
    });

    it('prunes tokens', async () => {
      // Note that logger output, directs to standard err.
      const { stderr } = await exec(
        `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts '--maxTokenAge=${maxAge}-days' '--maxCodeAge=${maxAge}-days' `,
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      expect(/"@passwordForgotTokensDeleted":1/.test(stderr)).toBe(true);
      expect(/"@passwordChangeTokensDeleted":1/.test(stderr)).toBe(true);
      expect(/"@accountResetTokensDeleted":1/.test(stderr)).toBe(true);
      expect(/"@sessionTokensDeleted":1/.test(stderr)).toBe(true);
      expect(/"@unblockCodesDeleted":1/.test(stderr)).toBe(true);
      expect(/"@signInCodesDeleted":1/.test(stderr)).toBe(true);
      expect(/pruning orphaned sessions in redis/.test(stderr)).toBe(true);

      const redisTokens = await redis.getSessionTokens(uid.toString('hex'));
      expect(Object.keys(redisTokens).length).toBe(0);
      expect(await SessionToken.findByTokenId(token.id)).toBeNull();
      expect(
        await PasswordChangeToken.findByTokenId(passwordChangeToken.id)
      ).toBeNull();
      expect(
        await PasswordForgotToken.findByTokenId(passwordForgotToken.id)
      ).toBeNull();
      expect(
        await AccountResetToken.findByTokenId(accountResetToken.tokenId)
      ).toBeNull();
      expect(
        await UnblockCodes.knexQuery().where({ uid: unblockCode.uid })
      ).toHaveLength(0);
      expect(
        await SignInCodes.knexQuery().where({ uid: signInCode.uid })
      ).toHaveLength(0);
    });
  });

  describe('limits sessions', () => {
    const size = 20;
    let tokens: any[] = [];
    let devices: any[] = [];

    const sessionAt = (i: number) =>
      SessionToken.findByTokenId(tokens.at(i).id);

    const deviceAt = (i: number) =>
      Device.findByPrimaryKey(devices.at(i).uid, devices.at(i).id);

    const sessionCount = async () =>
      (await SessionToken.knexQuery().where({ uid }).count())[0]['count(*)'];

    const deviceCount = async () =>
      (await Device.knexQuery().where({ uid }).count())[0]['count(*)'];

    beforeEach(async () => {
      await clearDb();
      await redis.del(uid.toString('hex'));
      tokens = [];
      devices = [];

      // Add tokens. The first token will be the oldest, and the last token
      // will be the newest.
      for (let i = 0; i < size; i++) {
        const curToken = sessionToken();
        const curDevice = device(account.uid, curToken.id);
        curToken.createdAt = Date.now();

        await SessionToken.create(curToken);
        await Device.create(curDevice);
        await new Promise((r) => setTimeout(r, 10));

        await redis.touchSessionToken(
          curToken.uid.toString('hex'),
          serialize(curToken)
        );

        tokens.push(curToken);
        devices.push(curDevice);
      }

      // Check initial DB state is correct
      expect(await sessionAt(0)).not.toBeNull();
      expect(await sessionAt(-1)).not.toBeNull();
      expect(await deviceAt(0)).not.toBeNull();
      expect(await deviceAt(-1)).not.toBeNull();
      expect(await sessionCount()).toBe(size);
      expect(await deviceCount()).toBe(size);
    });

    afterEach(async () => {
      await clearDb();
      await redis.del(uid.toString('hex'));
    });

    async function testScript(
      args: string,
      opts: { remaining: number; totalDeletions: number }
    ) {
      // Note that logger output, directs to standard err.
      const { stderr } = await exec(
        `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts ${args}`,
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      // Get the remaining redis tokens
      const redisTokens = await redis.getSessionTokens(uid.toString('hex'));

      // Expected counts
      expect(await sessionCount()).toBe(opts.remaining);
      expect(await deviceCount()).toBe(opts.remaining);
      expect(Object.keys(redisTokens).length).toBe(opts.remaining);

      // Expected program output. Note that there are two deletions,
      // one for the sessionToken and one for the device.
      if (opts.totalDeletions > 0) {
        expect(
          new RegExp(
            'limit sessions complete.*"deletions":' + opts.totalDeletions
          ).test(stderr)
        ).toBe(true);

        expect(/pruning orphaned sessions/.test(stderr)).toBe(true);
      }

      // Expect that oldest session & device were removed
      for (let i = 0; i < size - opts.remaining; i++) {
        expect(await sessionAt(i)).toBeNull();
        expect(await deviceAt(i)).toBeNull();
        expect(redisTokens[tokens.at(i).id]).toBeUndefined();
      }

      // Expect that the first set of sessions & devices are intact
      for (let i = opts.remaining; i < size; i++) {
        expect(await sessionAt(i)).not.toBeNull();
        expect(await deviceAt(i)).not.toBeNull();
        expect(await redisTokens[tokens.at(i).id]).not.toBeNull();
      }
    }

    it('limits with --maxSessionsBatchSize=1000', async () => {
      await testScript(
        `--maxSessions=10 --maxSessionsBatchSize=1000 --wait=10 `,
        {
          remaining: size - 10,
          totalDeletions: 10 * 2,
        }
      );
    });

    it('limits with --maxSessionsBatchSize=2', async () => {
      await testScript(`--maxSessions=10 --maxSessionsBatchSize=2 --wait=10`, {
        remaining: size - 10,
        totalDeletions: 10 * 2,
      });
    });

    it('limits with --maxSessionsMaxDeletions=2', async () => {
      await testScript(
        `--maxSessions=10 --maxSessionsMaxDeletions=2 --maxSessionsBatchSize=2 --wait=10`,
        {
          remaining: size - 2,
          totalDeletions: 2 * 2,
        }
      );
    });

    it('limits with --maxSessionsMaxDeletions=0', async () => {
      await testScript(
        `--maxSessions=10 --maxSessionsMaxDeletions=0 --wait=10`,
        {
          remaining: size,
          totalDeletions: 0,
        }
      );
    });

    it('limits with --maxSessionsMaxAccounts=0', async () => {
      await testScript(
        `--maxSessions=10 --maxSessionsMaxAccounts=0 --wait=10`,
        {
          remaining: size,
          totalDeletions: 0,
        }
      );
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const moment = require('moment');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('path');
const mocks = require(`../../test/mocks`);
const crypto = require('crypto');

const config = require('../../config').getProperties();
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
const DB = require('../../lib/db')(config, log, Token, UnblockCode);

const redis = require('../../lib/redis')(
  {
    ...config.redis,
    ...config.redis.sessionTokens,
    maxttl: 1337,
  },
  mocks.mockLog()
);

describe('scripts/prune-tokens', () => {
  let db;

  const toRandomBuff = (size) =>
    uuidTransformer.to(crypto.randomBytes(size).toString('hex'));
  const toZeroBuff = (size) =>
    Buffer.from(Array(size).fill(0), 'hex').toString('hex');

  const cwd = path.resolve(__dirname, '../..');

  // Usea really big number for max age.
  const maxAge = 10000;

  // Set createdAt 1 day before maxAge
  const createdAt =
    Date.now() -
    moment.duration(maxAge, 'days').asMilliseconds() -
    moment.duration(1, 'day').asMilliseconds();
  const uid = uuidTransformer.to('f9916686c226415abd06ae550f073cea');
  const email = 'user1@test.com';
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

  function serialize(t) {
    return {
      ...t,
      ...{
        id: t.id.toString('hex'),
        data: t.data.toString('hex'),
        uid: t.uid.toString('hex'),
      },
    };
  }

  const device = (uid, sessionTokenId) => ({
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
    await SessionToken.knexQuery().del();
    await PasswordChangeToken.knexQuery().del();
    await PasswordForgotToken.knexQuery().del();
    await AccountResetToken.knexQuery().del();
    await UnblockCodes.knexQuery().del();
    await SignInCodes.knexQuery().del();
  }

  before(async () => {
    db = await DB.connect(
      Object.assign({}, config, { log: { level: 'error' } })
    );
    await clearDb();
    await Account.create(account);
  });

  after(async () => {
    await db.deleteAccount(account);
    await clearDb();
  });

  it('prints help', async () => {
    const { stdout } = await exec(
      'NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts --help',
      {
        cwd,
      }
    );

    assert.isTrue(/Usage:/.test(stdout));
  });

  it('prints warnings when args are missing', async () => {
    const { stderr } = await exec(
      `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts `,
      {
        cwd,
        shell: '/bin/bash',
      }
    );
    assert.isTrue(/skipping limit sessions operation./.test(stderr));
    assert.isTrue(/skipping token pruning operation./.test(stderr));
  });

  describe('prune tokens', () => {
    let token;

    before(async () => {
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

    after(async () => {
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

      assert.isTrue(/"@passwordForgotTokensDeleted":1/.test(stderr));
      assert.isTrue(/"@passwordChangeTokensDeleted":1/.test(stderr));
      assert.isTrue(/"@accountResetTokensDeleted":1/.test(stderr));
      assert.isTrue(/"@sessionTokensDeleted":1/.test(stderr));
      assert.isTrue(/"@unblockCodesDeleted":1/.test(stderr));
      assert.isTrue(/"@signInCodesDeleted":1/.test(stderr));
      assert.isTrue(/pruning orphaned tokens/.test(stderr));

      const redisTokens = await redis.getSessionTokens(uid.toString('hex'));
      assert.equal(Object.keys(redisTokens).length, 0);
      assert.isNull(await SessionToken.findByTokenId(token.id));
      assert.isNull(
        await PasswordChangeToken.findByTokenId(passwordChangeToken.id)
      );
      assert.isNull(
        await PasswordForgotToken.findByTokenId(passwordForgotToken.id)
      );
      assert.isNull(
        await AccountResetToken.findByTokenId(accountResetToken.tokenId)
      );
      assert.isEmpty(
        await UnblockCodes.knexQuery().where({ uid: unblockCode.uid })
      );
      assert.isEmpty(
        await SignInCodes.knexQuery().where({ uid: signInCode.uid })
      );
    });
  });

  describe('limits sessions', async () => {
    const size = 20;
    let tokens = [];
    let devices = [];

    const sessionAt = (i) => SessionToken.findByTokenId(tokens.at(i).id);

    const deviceAt = (i) =>
      Device.findByPrimaryKey(devices.at(i).uid, devices.at(i).id);

    const sessionCount = async () =>
      (await SessionToken.knexQuery().count())[0]['count(*)'];

    const deviceCount = async () =>
      (await Device.knexQuery().count())[0]['count(*)'];

    before(async () => {
      await clearDb();
      await redis.del(uid.toString('hex'));
      tokens = [];
      devices = [];

      // Make sure db state is clean
      await SessionToken.knexQuery().del();
      await Device.knexQuery().del();

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
      assert.isNotNull(await sessionAt(0));
      assert.isNotNull(await sessionAt(-1));
      assert.isNotNull(await deviceAt(0));
      assert.isNotNull(await deviceAt(-1));
      assert.equal(await sessionCount(), size);
      assert.equal(await deviceCount(), size);
    });

    after(async () => {
      await clearDb();
      await redis.del(uid.toString('hex'));
    });

    async function testScript(args, opts) {
      // Note that logger output, directs to standard err.
      const { stderr } = await exec(
        `NODE_ENV=dev node -r esbuild-register scripts/prune-tokens.ts ${args}`,
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      console.log('!!! stderr', stderr);

      // Get the remaining redis tokens
      const redisTokens = await redis.getSessionTokens(uid.toString('hex'));

      // Expected counts
      assert.equal(await sessionCount(), opts.remaining);
      assert.equal(await deviceCount(), opts.remaining);
      assert.equal(Object.keys(redisTokens).length, opts.remaining);

      // Expected program output. Note that there are two deletions,
      // one for the sessionToken and one for the device.
      assert.isTrue(
        new RegExp(
          'limit sessions complete.*"deletions":' + opts.remaining
        ).test(stderr)
      );
      assert.isTrue(/pruning orphaned tokens/.test(stderr));

      // Expect that oldest session & device were removed
      for (let i = 0; i < size - opts.remaining; i++) {
        assert.isNull(await sessionAt(i));
        assert.isNull(await deviceAt(i));
        assert.isUndefined(redisTokens[tokens.at(i).id]);
      }

      // Expect that the first set of sessions & devices are intact
      for (let i = opts.remaining; i < size; i++) {
        assert.isNotNull(await sessionAt(i));
        assert.isNotNull(await deviceAt(i));
        assert.isNotNull(await redisTokens[tokens.at(i).id]);
      }
    }

    it('limits with large delete batch size', async () => {
      testScript(`--maxSessions=10 --maxSessionsBatchSize=1000 `, {
        remaining: size - 10,
        totalDeletions: 10 * 2,
      });
    });

    it('limits with small delete batch size', async () => {
      testScript(`--maxSessions=10 --maxSessionsBatchSize=2 `, {
        remaining: size - 10,
        totalDeletions: 10 * 2,
      });
    });

    it('limits with --maxSessionsMaxDeletions=2', async () => {
      testScript(`--maxSessions=10 --maxSessionsMaxDeletions=2`, {
        remaining: size - 2,
        totalDeletions: 2 * 2,
      });
    });

    it('limits with --maxSessionsMaxDeletions=0', async () => {
      testScript(`--maxSessions=10 --maxSessionsMaxDeletions=2`, {
        remaining: size,
        totalDeletions: 0,
      });
    });

    it('limits with maxSessionsMaxAccounts arg', async () => {
      testScript(`--maxSessions=10 --maxSessionsMaxAccounts=0`, {
        remaining: size,
        totalDeletions: 0,
      });
    });
  });
});

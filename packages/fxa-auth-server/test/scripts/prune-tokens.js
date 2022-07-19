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
const { AccountResetToken } = require('fxa-shared/db/models/auth');
const { UnblockCodes } = require('fxa-shared/db/models/auth/unblock-codes');
const { SignInCodes } = require('fxa-shared/db/models/auth/sign-in-codes');
import { uuidTransformer } from 'fxa-shared/db/transformers';

const log = mocks.mockLog();
const Token = require('../../lib/tokens')(log, config);
const DB = require('../../lib/db')(config, log, Token, UnblockCode);

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

  const sessionToken = {
    id: toRandomBuff(32),
    data: toRandomBuff(32),
    tokenVerificationId: null,
    uid,
    createdAt,
  };

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

  before(async () => {
    db = await DB.connect(config);
    await db.deleteAccount(account);
    await Account.create(account);
    await SessionToken.create(sessionToken);
    await PasswordChangeToken.create(passwordChangeToken);
    await PasswordForgotToken.create(passwordForgotToken);
    await AccountResetToken.knexQuery().insert(accountResetToken);
    await UnblockCodes.knexQuery().insert(unblockCode);
    await SignInCodes.knexQuery().insert(signInCode);
  });

  after(async () => {
    // await db.deleteAccount(account);
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
  });
});

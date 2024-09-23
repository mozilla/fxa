/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { promisify } from 'util';
import cp from 'child_process';
import { assert } from 'chai';
import path from 'path';
import mocks from '../../test/mocks';
import crypto from 'crypto';
import fs from 'fs';

const cwd = path.resolve(__dirname, '../..');
cp.execAsync = promisify(cp.exec);

const log = mocks.mockLog();
import configModule from "../../config";
const config = configModule.getProperties();
import TokenModule from "../../lib/tokens";
const Token = TokenModule(log, config);
import UnblockCodeModule from "../../lib/crypto/random";
const UnblockCode = UnblockCodeModule.base32(config.signinUnblock.codeLength);

const twoBuffer16 = Buffer.from(
  '22222222222222222222222222222222',
  'hex'
).toString('hex');
const twoBuffer32 = Buffer.from(
  '2222222222222222222222222222222222222222222222222222222222222222',
  'hex'
).toString('hex');

function createAccount(email, uid) {
  return {
    uid,
    email,
    emailCode: twoBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: twoBuffer32,
    authSalt: twoBuffer32,
    kA: twoBuffer32,
    wrapWrapKb: twoBuffer32,
    tokenVerificationId: twoBuffer16,
  };
}

const account1Mock = createAccount(
  `${Math.random() * 10000}@zmail.com`,
  crypto.randomBytes(16).toString('hex')
);
const account2Mock = createAccount(
  `${Math.random() * 10000}@zmail.com`,
  crypto.randomBytes(16).toString('hex')
);

import DBModule from "../../lib/db";
const DB = DBModule(config, log, Token, UnblockCode);

describe('#integration - scripts/must-reset', async function () {
  this.timeout(10000);

  let db, oneEmailFilename, oneUidFilename, twoEmailsFilename, twoUidsFilename;

  before(async () => {
    db = await DB.connect(config);
    await db.createAccount(account1Mock);
    await db.createAccount(account2Mock);

    const data = `${account1Mock.email}\n`;
    oneEmailFilename = `./test/scripts/fixtures/${crypto
      .randomBytes(16)
      .toString('hex')}_one_email.txt`;
    fs.writeFileSync(oneEmailFilename, data);

    const data2 = `${account1Mock.uid}\n`;
    oneUidFilename = `./test/scripts/fixtures/${crypto
      .randomBytes(16)
      .toString('hex')}_one_uid.txt`;
    fs.writeFileSync(oneUidFilename, data2);

    const data3 = `${account1Mock.email}\n${account2Mock.email}\n`;
    twoEmailsFilename = `./test/scripts/fixtures/${crypto
      .randomBytes(16)
      .toString('hex')}_two_emails.txt`;
    fs.writeFileSync(twoEmailsFilename, data3);

    const data4 = `${account1Mock.uid}\n${account2Mock.uid}\n`;
    twoUidsFilename = `./test/scripts/fixtures/${crypto
      .randomBytes(16)
      .toString('hex')}_two_uids.txt`;
    fs.writeFileSync(twoUidsFilename, data4);
  });

  after(async () => {
    await db.close();
    fs.unlinkSync(oneEmailFilename);
    fs.unlinkSync(oneUidFilename);
    fs.unlinkSync(twoEmailsFilename);
    fs.unlinkSync(twoUidsFilename);
  });

  it('fails if -i is not specified', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset ${oneEmailFilename}`,
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if neither --emails nor --uids is specified', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset -i ${oneEmailFilename}`,
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if both --emails and --uids are specified', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset --emails --uids -i ${oneEmailFilename}`,
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --emails specified w/o --input', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --emails',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --uids specified w/o --input', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --uids',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --uids and --input specified w/ file missing', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --uids -input does_not_exist',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --emails and --input specified w/ file missing', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --emails --input does_not_exist',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --uids and -i specified w/ invalid uid', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --uids -i ./test/scripts/fixtures/invalid_uid.txt',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('fails if --emails and -i specified w/ invalid email', async () => {
    try {
      await cp.execAsync(
        'node --require esbuild-register scripts/must-reset --emails -i ./test/scripts/fixtures/invalid_email.txt',
        {
          cwd,
        }
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('succeeds with --uids and --input containing 1 uid', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset --uids --input ${oneUidFilename}`,
        {
          cwd,
        }
      );
      const account = await db.account(account1Mock.uid);
      assert.equal(
        account.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
    } catch (err) {
      assert(false, 'script should have succeeded');
    }
  });

  it('succeeds with --emails and --input containing 1 email', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset --emails --input ${oneEmailFilename}`,
        {
          cwd,
        }
      );
      const account = await db.account(account1Mock.uid);
      assert.equal(
        account.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
    } catch (err) {
      assert(false, 'script should have succeeded');
    }
  });

  it('succeeds with --uids and --input containing 2 uids', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset --uids --input ${twoUidsFilename}`,
        {
          cwd,
        }
      );

      const account1 = await db.account(account1Mock.uid);
      const account2 = await db.account(account2Mock.uid);

      assert.equal(
        account1.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
      assert.equal(
        account2.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
    } catch (err) {
      assert(false, 'script should have succeeded');
    }
  });

  it('succeeds with --emails and --input containing 2 emails', async () => {
    try {
      await cp.execAsync(
        `node --require esbuild-register scripts/must-reset --emails --input ${twoEmailsFilename}`,
        {
          cwd,
        }
      );

      const account1 = await db.account(account1Mock.uid);
      const account2 = await db.account(account2Mock.uid);

      assert.equal(
        account1.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
      assert.equal(
        account2.authSalt,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
    } catch (err) {
      assert(false, 'script should have succeeded');
    }
  });
});

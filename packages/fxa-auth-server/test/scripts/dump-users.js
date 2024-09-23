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

const zeroBuffer16 = Buffer.from(
  '00000000000000000000000000000000',
  'hex'
).toString('hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
).toString('hex');

function createAccount(email, uid) {
  return {
    uid,
    email,
    emailCode: zeroBuffer16,
    emailVerified: false,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    authSalt: zeroBuffer32,
    kA: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
    tokenVerificationId: zeroBuffer16,
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

const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('#integration - scripts/dump-users', function () {
  this.timeout(20000);

  let db, oneEmailFilename, twoEmailsFilename, oneUidFilename, twoUidsFilename;

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

  it('fails if neither --emails nor --uids is specified', () => {
    return cp
      .execAsync('node -r esbuild-register scripts/dump-users', execOptions)
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if both --emails nor --uids are specified', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/dump-users --emails --uids',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --emails specified w/o list of emails or --input', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/dump-users --emails',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --uids specified w/o list of uids or --input', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/dump-users --uids',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --uids w/ invalid uid', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/dump-users --uids deadbeef',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with --uids and 1 valid uid1', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --uids ${account1Mock.uid}`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --uids and 2 valid uids', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --uids ${account1Mock.uid},${account2Mock.uid}`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);

        assert.equal(result[1].email, account2Mock.email);
        assert.equal(result[1].uid, account2Mock.uid);
      });
  });

  it('succeeds with --uids and --input containing 1 uid', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --uids --input ${
          '../' + oneUidFilename
        }`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --uids and --input containing 2 uids', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --uids --input ${
          '../' + twoUidsFilename
        }`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);

        assert.equal(result[1].email, account2Mock.email);
        assert.equal(result[1].uid, account2Mock.uid);
      });
  });

  it('fails if --emails w/ invalid emails', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/dump-users --emails user3@test.com',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with --emails and 1 valid email', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --emails ${account1Mock.email}`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --emails and 2 valid emails', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --emails ${account1Mock.email},${account2Mock.email}`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);

        assert.equal(result[1].email, account2Mock.email);
        assert.equal(result[1].uid, account2Mock.uid);
      });
  });

  it('succeeds with --emails and --input containing 1 email', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --emails --input ${
          '../' + oneEmailFilename
        }`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --emails and --input containing 2 email', () => {
    return cp
      .execAsync(
        `node -r esbuild-register scripts/dump-users --emails --input ${
          '../' + twoEmailsFilename
        }`,
        execOptions
      )
      .then(({ stdout: output }) => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);

        assert.equal(result[1].email, account2Mock.email);
        assert.equal(result[1].uid, account2Mock.uid);
      });
  });
});

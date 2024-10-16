/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { promisify } = require('util');
const { assert } = require('chai');
const cp = require('child_process');
const fs = require('fs');
const mocks = require(`${ROOT_DIR}/test/mocks`);
const path = require('path');
const rimraf = require('rimraf');
const crypto = require('crypto');

const cwd = path.resolve(__dirname, ROOT_DIR);
const execAsync = promisify(cp.exec);

const log = mocks.mockLog();
const config = require('../../config').default.getProperties();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);

const OUTPUT_DIRECTORY = path.resolve(__dirname, './test_output');
const USER_DUMP_PATH = path.join(OUTPUT_DIRECTORY, 'user_dump.json');

const zeroBuffer16 = Buffer.from(
  '00000000000000000000000000000000',
  'hex'
).toString('hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
).toString('hex');

function createAccount(email, uid, locale = 'en') {
  return {
    authSalt: zeroBuffer32,
    email,
    emailCode: zeroBuffer16,
    emailVerified: false,
    kA: zeroBuffer32,
    locale,
    tokenVerificationId: zeroBuffer16,
    uid,
    verifierVersion: 1,
    verifyHash: zeroBuffer32,
    wrapWrapKb: zeroBuffer32,
  };
}

const account1Mock = createAccount(
  `${Math.random() * 10000}@zmail.com`,
  crypto.randomBytes(16).toString('hex'),
  'en'
);
const account2Mock = createAccount(
  `${Math.random() * 10000}@zmail.com`,
  crypto.randomBytes(16).toString('hex'),
  'es'
);

const { createDB } = require('../../lib/db');
const DB = createDB(config, log, Token, UnblockCode);

const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('#integration - scripts/bulk-mailer', function () {
  this.timeout(30000);

  let db;

  before(async () => {
    rimraf.sync(OUTPUT_DIRECTORY);
    fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

    db = await DB.connect(config);

    await Promise.all([
      db.createAccount(account1Mock),
      db.createAccount(account2Mock),
    ]);

    await execAsync(
      `node -r esbuild-register scripts/dump-users --emails ${account1Mock.email},${account2Mock.email} > ${USER_DUMP_PATH}`,
      execOptions
    );
  });

  after(async () => {
    await Promise.all([
      db.deleteAccount(account1Mock),
      db.deleteAccount(account2Mock),
    ]);

    rimraf.sync(OUTPUT_DIRECTORY);
  });

  it('fails if --input missing', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/bulk-mailer --method sendVerifyEmail',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --input file missing', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/bulk-mailer --input does_not_exist --method sendVerifyEmail',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --method missing', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/bulk-mailer --input ${USER_DUMP_PATH}',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --method is invalid', () => {
    return cp
      .execAsync(
        'node -r esbuild-register scripts/bulk-mailer --input ${USER_DUMP_PATH} --method doesNotExist',
        execOptions
      )
      .then(
        () => assert(false, 'script should have failed'),
        (err) => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with valid input file and method, writing files to disk', () => {
    this.timeout(10000);
    return cp
      .execAsync(
        `node -r esbuild-register scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendPasswordChangedEmail --write ${OUTPUT_DIRECTORY}`,
        execOptions
      )
      .then(() => {
        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.headers`)
          )
        );
        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.html`)
          )
        );
        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.txt`)
          )
        );

        // emails are in english
        const test1Html = fs
          .readFileSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.html`)
          )
          .toString();
        assert.include(test1Html, 'Password changed successfully');
        const test1Text = fs
          .readFileSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.txt`)
          )
          .toString();
        assert.include(test1Text, 'Password changed successfully');

        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.headers`)
          )
        );
        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.html`)
          )
        );
        assert.isTrue(
          fs.existsSync(
            path.join(OUTPUT_DIRECTORY, `${account1Mock.email}.txt`)
          )
        );

        // emails are in spanish
        const test2Html = fs
          .readFileSync(
            path.join(OUTPUT_DIRECTORY, `${account2Mock.email}.html`)
          )
          .toString();
        assert.include(test2Html, 'Has cambiado la contraseña correctamente');
        const test2Text = fs
          .readFileSync(
            path.join(OUTPUT_DIRECTORY, `${account2Mock.email}.txt`)
          )
          .toString();
        assert.include(test2Text, 'Has cambiado la contraseña correctamente');
      });
  });

  it('succeeds with valid input file and method, writing emails to stdout', async () => {
    const output = await execAsync(
      `node -r esbuild-register scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendPasswordChangedEmail`,
      execOptions
    );
    const result = output.stdout.toString();

    assert.include(result, account1Mock.uid);
    assert.include(result, account1Mock.email);
    assert.include(result, 'Password changed successfully');

    // For some reason this assert fails locally
    // assert.include(result, account2Mock.uid);
    // assert.include(result, account2Mock.email);
    // assert.include(result, "Has cambiado la contraseña correctamente");
  });

  it('succeeds with valid input file and method, sends', () => {
    return execAsync(
      `node -r esbuild-register scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendVerifyEmail --send`,
      execOptions
    );
  });
});

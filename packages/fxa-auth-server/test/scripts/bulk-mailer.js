/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const cp = require('child_process');
const fs = require('fs');
const mkdirp = require('mkdirp');
const mocks = require(`${ROOT_DIR}/test/mocks`);
const path = require('path');
const P = require('bluebird');
const rimraf = require('rimraf');

const cwd = path.resolve(__dirname, ROOT_DIR);
cp.execAsync = P.promisify(cp.exec);

const log = mocks.mockLog();
const config = require('../../config').getProperties();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);
const TestServer = require('../test_server');

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
  'user1@test.com',
  'f9916686c226415abd06ae550f073cec',
  'en'
);
const account2Mock = createAccount(
  'user2@test.com',
  'f9916686c226415abd06ae550f073ced',
  'es'
);

const DB = require('../../lib/db')(config, log, Token, UnblockCode);

describe('scripts/bulk-mailer', function() {
  this.timeout(10000);

  let db, server;

  before(() => {
    rimraf.sync(OUTPUT_DIRECTORY);
    mkdirp.sync(OUTPUT_DIRECTORY);

    return TestServer.start(config)
      .then(s => {
        server = s;
        return DB.connect(config[config.db.backend]);
      })
      .then(_db => {
        db = _db;
        return P.all([
          db.createAccount(account1Mock),
          db.createAccount(account2Mock),
        ]);
      })
      .then(() => {
        return cp.execAsync(
          `node scripts/dump-users --uids ${account1Mock.uid},${account2Mock.uid} > ${USER_DUMP_PATH}`,
          { cwd }
        );
      });
  });

  after(() => {
    return P.all([
      db.deleteAccount(account1Mock),
      db.deleteAccount(account2Mock),
    ])
      .then(() => TestServer.stop(server))
      .then(() => rimraf.sync(OUTPUT_DIRECTORY));
  });

  it('fails if --input missing', () => {
    return cp
      .execAsync('node scripts/bulk-mailer --method sendVerifyEmail', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --input file missing', () => {
    return cp
      .execAsync(
        'node scripts/bulk-mailer --input does_not_exist --method sendVerifyEmail',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --method missing', () => {
    return cp
      .execAsync('node scripts/bulk-mailer --input ${USER_DUMP_PATH}', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --method is invalid', () => {
    return cp
      .execAsync(
        'node scripts/bulk-mailer --input ${USER_DUMP_PATH} --method doesNotExist',
        { cwd }
      )
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with valid input file and method, writing files to disk', () => {
    return cp
      .execAsync(
        `node scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendVerifyEmail --write ${OUTPUT_DIRECTORY}`,
        { cwd }
      )
      .then(() => {
        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.headers'))
        );
        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.html'))
        );
        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.txt'))
        );

        // emails are in english
        const test1Html = fs
          .readFileSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.html'))
          .toString();
        assert.include(test1Html, 'This is an automated email');
        const test1Text = fs
          .readFileSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.txt'))
          .toString();
        assert.include(test1Text, 'This is an automated email');

        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.headers'))
        );
        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.html'))
        );
        assert.isTrue(
          fs.existsSync(path.join(OUTPUT_DIRECTORY, 'user1@test.com.txt'))
        );

        // emails are in spanish
        const test2Html = fs
          .readFileSync(path.join(OUTPUT_DIRECTORY, 'user2@test.com.html'))
          .toString();
        assert.include(test2Html, 'Este es un correo automatizado');
        const test2Text = fs
          .readFileSync(path.join(OUTPUT_DIRECTORY, 'user2@test.com.txt'))
          .toString();
        assert.include(test2Text, 'Este es un correo automatizado');
      });
  });

  it('succeeds with valid input file and method, writing emails to stdout', () => {
    return cp
      .execAsync(
        `node scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendVerifyEmail`,
        { cwd }
      )
      .then(result => {
        assert.include(result, account1Mock.uid);
        assert.include(result, account1Mock.email);
        assert.include(result, 'This is an automated email');

        assert.include(result, account2Mock.uid);
        assert.include(result, account2Mock.email);
        assert.include(result, 'Este es un correo automatizado');
      });
  });

  it('succeeds with valid input file and method, sends', () => {
    return cp.execAsync(
      `node scripts/bulk-mailer --input ${USER_DUMP_PATH} --method sendVerifyEmail --send`,
      { cwd }
    );
  });
});

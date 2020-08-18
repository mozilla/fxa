/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const cp = require('child_process');
const { assert } = require('chai');
const path = require('path');
const P = require('bluebird');
const mocks = require(`${ROOT_DIR}/test/mocks`);

const cwd = path.resolve(__dirname, ROOT_DIR);
cp.execAsync = P.promisify(cp.exec);

const log = mocks.mockLog();
const config = require('../../config').getProperties();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);
const TestServer = require('../test_server');

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
  'user1@test.com',
  'f9916686c226415abd06ae550f073cec'
);
const account2Mock = createAccount(
  'user2@test.com',
  'f9916686c226415abd06ae550f073ced'
);

const DB = require('../../lib/db')(config, log, Token, UnblockCode);

describe('scripts/must-reset', async function () {
  this.timeout(30000);

  let db, server;

  before(async () => {
    server = await TestServer.start(config);
    db = await DB.connect(config[config.db.backend]);
    await db.deleteAccount(account1Mock);
    await db.deleteAccount(account2Mock);
  });

  after(async () => {
    await db.deleteAccount(account1Mock);
    await db.deleteAccount(account2Mock);
    return await TestServer.stop(server);
  });

  beforeEach(async () => {
    await db.createAccount(account1Mock);
    await db.createAccount(account2Mock);
  });

  afterEach(async () => {
    await db.deleteAccount(account1Mock);
    await db.deleteAccount(account2Mock);
  });

  it('fails if -i is not specified', async () => {
    try {
      await cp.execAsync(
        'node --require ts-node/register scripts/must-reset ./test/scripts/fixtures/one_email.txt',
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
        'node --require ts-node/register scripts/must-reset -i ./test/scripts/fixtures/one_email.txt',
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
        'node --require ts-node/register scripts/must-reset --emails --uids -i ./test/scripts/fixtures/one_email.txt',
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
        'node --require ts-node/register scripts/must-reset --emails',
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
        'node --require ts-node/register scripts/must-reset --uids',
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
        'node --require ts-node/register scripts/must-reset --uids -input does_not_exist',
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
        'node --require ts-node/register scripts/must-reset --emails --input does_not_exist',
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
        'node --require ts-node/register scripts/must-reset --uids -i ./test/scripts/fixtures/invalid_uid.txt',
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
        'node --require ts-node/register scripts/must-reset --emails -i ./test/scripts/fixtures/invalid_email.txt',
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
        'node --require ts-node/register scripts/must-reset --uids --input ./test/scripts/fixtures/one_uid.txt',
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
        'node --require ts-node/register scripts/must-reset --emails --input ./test/scripts/fixtures/one_email.txt',
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
        'node --require ts-node/register scripts/must-reset --uids --input ./test/scripts/fixtures/two_uids.txt',
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
        'node --require ts-node/register scripts/must-reset --emails --input ./test/scripts/fixtures/two_emails.txt',
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

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
  'user1@test.com',
  'f9916686c226415abd06ae550f073cec'
);
const account2Mock = createAccount(
  'user2@test.com',
  'f9916686c226415abd06ae550f073ced'
);

const DB = require('../../lib/db')(config, log, Token, UnblockCode);

describe('scripts/dump-users', function() {
  this.timeout(10000);

  let db, server;

  before(() => {
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
      });
  });

  after(() => {
    return P.all([
      db.deleteAccount(account1Mock),
      db.deleteAccount(account2Mock),
    ]).then(() => TestServer.stop(server));
  });

  it('fails if neither --emails nor --uids is specified', () => {
    return cp.execAsync('node scripts/dump-users', { cwd }).then(
      () => assert(false, 'script should have failed'),
      err => {
        assert.include(err.message, 'Command failed');
      }
    );
  });

  it('fails if both --emails nor --uids are specified', () => {
    return cp
      .execAsync('node scripts/dump-users --emails --uids', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('fails if --emails specified w/o list of emails or --input', () => {
    return cp.execAsync('node scripts/dump-users --emails', { cwd }).then(
      () => assert(false, 'script should have failed'),
      err => {
        assert.include(err.message, 'Command failed');
      }
    );
  });

  it('fails if --uids specified w/o list of uids or --input', () => {
    return cp.execAsync('node scripts/dump-users --uids', { cwd }).then(
      () => assert(false, 'script should have failed'),
      err => {
        assert.include(err.message, 'Command failed');
      }
    );
  });

  it('fails if --uids w/ invalid uid', () => {
    return cp
      .execAsync('node scripts/dump-users --uids deadbeef', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with --uids and 1 valid uid1', () => {
    return cp
      .execAsync(`node scripts/dump-users --uids ${account1Mock.uid}`, { cwd })
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --uids and 2 valid uids', () => {
    return cp
      .execAsync(
        `node scripts/dump-users --uids ${account1Mock.uid},${account2Mock.uid}`,
        { cwd }
      )
      .then(output => {
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
        'node scripts/dump-users --uids --input ../test/scripts/fixtures/one_uid.txt',
        { cwd }
      )
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, 'user1@test.com');
        assert.equal(result[0].uid, 'f9916686c226415abd06ae550f073cec');
      });
  });

  it('succeeds with --uids and --input containing 2 uids', () => {
    return cp
      .execAsync(
        'node scripts/dump-users --uids --input ../test/scripts/fixtures/two_uids.txt',
        { cwd }
      )
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, 'user1@test.com');
        assert.equal(result[0].uid, 'f9916686c226415abd06ae550f073cec');

        assert.equal(result[1].email, 'user2@test.com');
        assert.equal(result[1].uid, 'f9916686c226415abd06ae550f073ced');
      });
  });

  it('fails if --emails w/ invalid emails', () => {
    return cp
      .execAsync('node scripts/dump-users --emails user3@test.com', { cwd })
      .then(
        () => assert(false, 'script should have failed'),
        err => {
          assert.include(err.message, 'Command failed');
        }
      );
  });

  it('succeeds with --emails and 1 valid email', () => {
    return cp
      .execAsync(`node scripts/dump-users --emails ${account1Mock.email}`, {
        cwd,
      })
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, account1Mock.email);
        assert.equal(result[0].uid, account1Mock.uid);
      });
  });

  it('succeeds with --emails and 2 valid emails', () => {
    return cp
      .execAsync(
        `node scripts/dump-users --emails ${account1Mock.email},${account2Mock.email}`,
        { cwd }
      )
      .then(output => {
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
        'node scripts/dump-users --emails --input ../test/scripts/fixtures/one_email.txt',
        { cwd }
      )
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 1);

        assert.equal(result[0].email, 'user1@test.com');
        assert.equal(result[0].uid, 'f9916686c226415abd06ae550f073cec');
      });
  });

  it('succeeds with --emails and --input containing 2 email', () => {
    return cp
      .execAsync(
        'node scripts/dump-users --emails --input ../test/scripts/fixtures/two_emails.txt',
        { cwd }
      )
      .then(output => {
        const result = JSON.parse(output);
        assert.lengthOf(result, 2);

        assert.equal(result[0].email, 'user1@test.com');
        assert.equal(result[0].uid, 'f9916686c226415abd06ae550f073cec');

        assert.equal(result[1].email, 'user2@test.com');
        assert.equal(result[1].uid, 'f9916686c226415abd06ae550f073ced');
      });
  });
});

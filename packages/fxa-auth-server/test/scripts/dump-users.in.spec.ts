/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { promisify } = require('util');
const cp = require('child_process');
const path = require('path');
const mocks = require('../../test/mocks');
const crypto = require('crypto');
const fs = require('fs');

const ROOT_DIR = '../..';
const cwd = path.resolve(__dirname, ROOT_DIR);
cp.execAsync = promisify(cp.exec);

const log = mocks.mockLog();
const config = require('../../config').default.getProperties();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);

const zeroBuffer16 = Buffer.from(
  '00000000000000000000000000000000',
  'hex'
).toString('hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
).toString('hex');

function createAccount(email: string, uid: string) {
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

describe('#integration - scripts/dump-users', () => {
  let db: any,
    oneEmailFilename: string,
    twoEmailsFilename: string,
    oneUidFilename: string,
    twoUidsFilename: string;

  beforeAll(async () => {
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

  afterAll(async () => {
    await db.close();
    fs.unlinkSync(oneEmailFilename);
    fs.unlinkSync(oneUidFilename);
    fs.unlinkSync(twoEmailsFilename);
    fs.unlinkSync(twoUidsFilename);
  });

  it('fails if neither --emails nor --uids is specified', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('fails if both --emails nor --uids are specified', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails --uids',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('fails if --emails specified w/o list of emails or --input', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('fails if --uids specified w/o list of uids or --input', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('fails if --uids w/ invalid uid', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids deadbeef',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('succeeds with --uids and 1 valid uid1', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids ${account1Mock.uid}`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(1);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);
  });

  it('succeeds with --uids and 2 valid uids', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids ${account1Mock.uid},${account2Mock.uid}`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(2);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);

    expect(result[1].email).toBe(account2Mock.email);
    expect(result[1].uid).toBe(account2Mock.uid);
  });

  it('succeeds with --uids and --input containing 1 uid', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids --input ${
        '../' + oneUidFilename
      }`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(1);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);
  });

  it('succeeds with --uids and --input containing 2 uids', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --uids --input ${
        '../' + twoUidsFilename
      }`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(2);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);

    expect(result[1].email).toBe(account2Mock.email);
    expect(result[1].uid).toBe(account2Mock.uid);
  });

  it('fails if --emails w/ invalid emails', async () => {
    try {
      await cp.execAsync(
        'node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails user3@test.com',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
    }
  });

  it('succeeds with --emails and 1 valid email', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails ${account1Mock.email}`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(1);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);
  });

  it('succeeds with --emails and 2 valid emails', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails ${account1Mock.email},${account2Mock.email}`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(2);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);

    expect(result[1].email).toBe(account2Mock.email);
    expect(result[1].uid).toBe(account2Mock.uid);
  });

  it('succeeds with --emails and --input containing 1 email', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails --input ${
        '../' + oneEmailFilename
      }`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(1);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);
  });

  it('succeeds with --emails and --input containing 2 email', async () => {
    const { stdout: output } = await cp.execAsync(
      `node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/dump-users --emails --input ${
        '../' + twoEmailsFilename
      }`,
      execOptions
    );
    const result = JSON.parse(output);
    expect(result).toHaveLength(2);

    expect(result[0].email).toBe(account1Mock.email);
    expect(result[0].uid).toBe(account1Mock.uid);

    expect(result[1].email).toBe(account2Mock.email);
    expect(result[1].uid).toBe(account2Mock.uid);
  });
});

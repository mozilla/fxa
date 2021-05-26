/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Chance from 'chance';
import fs from 'fs';
import { knex, Knex } from 'knex';
import path from 'path';

import { Account, EmailBounces } from '.';

export type AccountIsh = Pick<
  Account,
  'uid' | 'email' | 'emails' | 'normalizedEmail'
>;
export type BounceIsh = Pick<
  EmailBounces,
  'bounceSubType' | 'bounceType' | 'createdAt' | 'email'
>;

export const chance = new Chance();

const thisDir = path.dirname(__filename);
export const accountTable = fs.readFileSync(
  path.join(thisDir, './accounts.sql'),
  'utf8'
);
export const emailsTable = fs.readFileSync(
  path.join(thisDir, './emails.sql'),
  'utf8'
);
export const emailBouncesTable = fs.readFileSync(
  path.join(thisDir, './email-bounces.sql'),
  'utf8'
);
export const totpTable = fs.readFileSync(
  path.join(thisDir, './totp.sql'),
  'utf8'
);
export const recoveryKeysTable = fs.readFileSync(
  path.join(thisDir, './recovery-keys.sql'),
  'utf8'
);
export const sessionTokensTable = fs.readFileSync(
  path.join(thisDir, './session-tokens.sql'),
  'utf8'
);

export function randomAccount() {
  const email = chance.email();
  return {
    authSalt: Buffer.from('0', 'hex'),
    createdAt: chance.timestamp(),
    email,
    emailCode: Buffer.from('0', 'hex'),
    emailVerified: true,
    kA: Buffer.from('0', 'hex'),
    normalizedEmail: email,
    uid: chance.guid({ version: 4 }).replace(/-/g, ''),
    verifierSetAt: chance.timestamp(),
    verifierVersion: 0,
    verifyHash: Buffer.from('0', 'hex'),
    wrapWrapKb: Buffer.from('0', 'hex'),
  };
}

export function randomEmailBounce(email: string): BounceIsh {
  return {
    bounceSubType: chance.integer({ min: 0, max: 14 }),
    bounceType: chance.integer({ min: 0, max: 3 }),
    createdAt: chance.timestamp(),
    email,
  };
}

export function randomEmail(account: AccountIsh, createSecondaryEmail = false) {
  const email = createSecondaryEmail ? chance.email() : account.email;
  const normalizedEmail = createSecondaryEmail
    ? email
    : account.normalizedEmail;
  return {
    createdAt: chance.timestamp(),
    email,
    normalizedEmail,
    emailCode: '',
    isPrimary: !createSecondaryEmail,
    isVerified: true,
    uid: account.uid,
  };
}

export function randomTotp(account: AccountIsh) {
  return {
    uid: account.uid,
    sharedSecret: 'abcd1234',
    epoch: 0,
    createdAt: chance.timestamp(),
    verified: true,
    enabled: true,
  };
}

export function randomRecoveryKey(account: AccountIsh) {
  return {
    uid: account.uid,
    recoveryData: 'abcd1234',
    recoveryKeyIdHash:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    createdAt: chance.timestamp(),
    verifiedAt: chance.timestamp(),
    enabled: true,
  };
}

export function randomSessionToken(account: AccountIsh) {
  return {
    tokenId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    tokenData:
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    uid: account.uid,
    createdAt: chance.timestamp(),
    uaBrowser: 'Chrome',
    uaBrowserVersion: '89.0.4389',
    uaOS: 'Mac OS X',
    uaOSVersion: '11.2.1',
    uaDeviceType: 'Mac',
    lastAccessTime: chance.timestamp(),
    uaFormFactor: 'abcd1234',
    authAt: chance.timestamp(),
    verificationMethod: 1,
    verifiedAt: chance.timestamp(),
    mustVerify: false,
  };
}

function typeCasting(field: any, next: any) {
  if (field.type === 'TINY' && field.length === 1) {
    return field.string() === '1';
  }
  return next();
}

export async function testDatabaseSetup(dbname: string): Promise<Knex> {
  // Create the db if it doesn't exist
  let instance = knex({
    client: 'mysql',
    connection: {
      charset: 'utf8',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  });

  await instance.raw(`DROP DATABASE IF EXISTS ${dbname}`);
  await instance.raw(`CREATE DATABASE ${dbname}`);
  await instance.destroy();
  instance = knex({
    connection: {
      typeCast: typeCasting,
      database: dbname,
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
    client: 'mysql',
  });

  await instance.raw(accountTable);
  await instance.raw(emailsTable);
  await instance.raw(emailBouncesTable);
  await instance.raw(totpTable);
  await instance.raw(recoveryKeysTable);
  await instance.raw(sessionTokensTable);

  /* Debugging Assistance
  knex.on('query', data => {
    console.dir(data);
  });
  */

  return instance;
}

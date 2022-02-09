/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import Chance from 'chance';
import { knex, Knex } from 'knex';

import { setupAuthDatabase } from '../../../../db';
import { Account, EmailBounce } from '../../../../db/models/auth';

export type AccountIsh = Pick<
  Account,
  'uid' | 'email' | 'emails' | 'normalizedEmail'
>;
export type BounceIsh = Pick<
  EmailBounce,
  'bounceSubType' | 'bounceType' | 'createdAt' | 'email' | 'emailTypeId'
>;

export const chance = new Chance();

export function randomAccount() {
  const email = chance.email();
  return {
    authSalt: '00',
    createdAt: chance.timestamp(),
    email,
    emailCode: '00',
    emailVerified: true,
    kA: '00',
    normalizedEmail: email,
    uid: chance.guid({ version: 4 }).replace(/-/g, ''),
    verifierSetAt: chance.timestamp(),
    verifierVersion: 0,
    verifyHash: '00',
    wrapWrapKb: '00',
  };
}

export function randomEmail(account: AccountIsh, primary = true) {
  return {
    createdAt: chance.timestamp(),
    email: account.email,
    emailCode: '00000000000000000000000000000000',
    isPrimary: primary,
    isVerified: true,
    normalizedEmail: account.normalizedEmail,
    uid: account.uid,
  };
}

export function randomEmailBounce(email: string): BounceIsh {
  return {
    bounceSubType: chance.integer({ min: 0, max: 14 }),
    bounceType: chance.integer({ min: 0, max: 3 }),
    createdAt: chance.timestamp(),
    emailTypeId: chance.integer({ min: 1, max: 30 }),
    email,
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

export async function testDatabaseSetup(): Promise<Knex> {
  // Create the db if it doesn't exist
  let instance = knex({
    client: 'mysql',
    connection: {
      charset: 'UTF8MB4_BIN',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  });

  await instance.raw('DROP DATABASE IF EXISTS testAdmin');
  await instance.raw('CREATE DATABASE testAdmin');
  await instance.destroy();

  instance = setupAuthDatabase({
    database: 'testAdmin',
    host: 'localhost',
    password: '',
    port: 3306,
    user: 'root',
  });

  const runSql = async (filePaths: string[]) =>
    Promise.all(
      filePaths
        .map((x) => path.join(__dirname, x))
        .map((x) => fs.readFileSync(x, 'utf8'))
        .map((x) => instance.raw.bind(instance)(x))
    );

  await runSql([
    './accounts.sql',
    './devices.sql',
    './emails.sql',
    './account-customers.sql',
    './paypal-ba.sql',
    './email-types.sql',
    './email-bounces.sql',
    './totp.sql',
    './recovery-keys.sql',
    './session-tokens.sql',
    './linked-accounts.sql',
  ]);
  // The order matters for inserts or foreign key refs
  await runSql(['./insert-email-types.sql', './sent-emails.sql']);

  /*/ Debugging Assistance
  knex.on('query', (data) => {
    console.dir(data);
  });
  //*/
  return instance;
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import Chance from 'chance';
import { knex, Knex } from 'knex';

import { setupAuthDatabase } from '../../../../db';
import { Account } from '../../../../db/models/auth/account';

export type AccountIsh = Pick<
  Account,
  'uid' | 'email' | 'emails' | 'normalizedEmail'
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

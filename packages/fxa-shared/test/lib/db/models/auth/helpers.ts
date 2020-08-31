/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import Chance from 'chance';
import Knex from 'knex';

import { setupAuthDatabase } from '../../../../../lib/db';
import { Account } from '../../../../../lib/db/models/auth/account';

export type AccountIsh = Pick<
  Account,
  'uid' | 'email' | 'emails' | 'normalizedEmail'
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
  let knex = Knex({
    client: 'mysql',
    connection: {
      charset: 'UTF8MB4_BIN',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  });

  await knex.raw('DROP DATABASE IF EXISTS testAdmin');
  await knex.raw('CREATE DATABASE testAdmin');
  await knex.destroy();

  knex = setupAuthDatabase({
    database: 'testAdmin',
    host: 'localhost',
    password: '',
    port: 3306,
    user: 'root',
  });

  await knex.raw(accountTable);
  await knex.raw(emailsTable);

  /* Debugging Assistance
  knex.on('query', (data) => {
    console.dir(data);
  });
  */
  return knex;
}

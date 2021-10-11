/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import path from 'path';
import { assert } from 'chai';
import Chance from 'chance';
import { knex, Knex } from 'knex';

import { setupAuthDatabase } from 'fxa-shared/db';
import { Account } from 'fxa-shared/db/models/auth';

import { processStripeCustomer } from '../../scripts/populate-stripe-customer-db';

type AccountIsh = Pick<Account, 'uid' | 'email' | 'emails' | 'normalizedEmail'>;

export const chance = new Chance();

const thisDir = path.dirname(__filename);
export const accountTable = fs.readFileSync(
  path.join(thisDir, './fixtures/accounts.sql'),
  'utf8'
);
export const emailsTable = fs.readFileSync(
  path.join(thisDir, './fixtures/emails.sql'),
  'utf8'
);
export const accountCustomersTable = fs.readFileSync(
  path.join(thisDir, './fixtures/account-customers.sql'),
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

async function testDatabaseSetup(): Promise<Knex> {
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

  await instance.raw(accountTable);
  await instance.raw(emailsTable);
  await instance.raw(accountCustomersTable);
  return instance;
}

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const customer1Mock = {
  id: 'cus_1',
  metadata: {
    userid: USER_1.uid,
  },
};

const customer2Mock_noMatch = {
  id: 'cus_2',
  metadata: {
    userid: '00006686c226415abd06ae550f073ced',
  },
};

describe('scripts/populate-stripe-customer-db', function () {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the user in
    await Account.query().insertGraph({ ...USER_1, emails: [EMAIL_1] });
  });

  after(async () => {
    await knex.raw('DROP DATABASE IF EXISTS testAdmin');
    await knex.destroy();
  });

  describe('processStripeCustomer', () => {
    const successMsg = 'CustomerAccount record successfully created.';
    const notFoundMsg = 'Firefox account not found.';
    const errMsg = 'Failed to create record:';

    it('logs successful creation', async () => {
      const actual = await processStripeCustomer(
        customer1Mock.metadata.userid,
        customer1Mock.id
      );
      assert.equal(actual, successMsg);
    });

    it('logs when no fxa account is found', async () => {
      const actual = await processStripeCustomer(
        customer2Mock_noMatch.metadata.userid,
        customer1Mock.id
      );
      assert.equal(actual, notFoundMsg);
    });
  });
});

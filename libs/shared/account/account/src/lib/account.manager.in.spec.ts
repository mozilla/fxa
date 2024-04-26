/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Kysely } from 'kysely';

import { faker } from '@faker-js/faker';
import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import { AccountAlreadyExistsError } from './account.error';
import { AccountManager } from './account.manager';

describe('accountManager', () => {
  let accountManager: AccountManager;
  let kyselyDb: Kysely<DB>;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup(['accounts', 'emails']);
    accountManager = new AccountManager(kyselyDb);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createAccountStub', () => {
    it('should create an account', async () => {
      const email = faker.internet.email();
      const uid = await accountManager.createAccountStub(email, 1, 'en-US');
      expect(uid).toBeTruthy();

      // Fetch the account row
      const account = await kyselyDb
        .selectFrom('accounts')
        .selectAll()
        .where('uid', '=', Buffer.from(uid, 'hex'))
        .executeTakeFirst();
      expect(account?.email).toBe(email);

      // Fetch the emails row
      const emailRow = await kyselyDb
        .selectFrom('emails')
        .selectAll()
        .where('uid', '=', Buffer.from(uid, 'hex'))
        .executeTakeFirst();
      expect(emailRow?.email).toBe(email);
      expect(emailRow?.isPrimary).toBe(true);
    });

    it('should throw an error if the email already exists', async () => {
      const email = faker.internet.email();

      await accountManager.createAccountStub(email, 1, 'en-US');

      expect.assertions(1);
      await expect(
        accountManager.createAccountStub(email, 1, 'en-US')
      ).rejects.toBeInstanceOf(AccountAlreadyExistsError);
    });
  });
});

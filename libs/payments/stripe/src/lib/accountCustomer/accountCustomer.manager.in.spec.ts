/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import {
  AccountCustomerNotCreatedError,
  AccountCustomerNotDeletedError,
  AccountCustomerNotFoundError,
  AccountCustomerNotUpdatedError,
} from './accountCustomer.error';
import { CreateAccountCustomerFactory } from './accountCustomer.factories';
import { AccountCustomerManager } from './accountCustomer.manager';

describe('AccountCustomer Manager', () => {
  let kyselyDb: Kysely<DB>;
  let accountCustomerManager: AccountCustomerManager;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup(['accountCustomers']);
    accountCustomerManager = new AccountCustomerManager(kyselyDb);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createAccountCustomer', () => {
    it('creates an accountCustomer successfully', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();

      const result = await accountCustomerManager.createAccountCustomer(
        mockAccountCustomer
      );

      expect(result).toEqual({
        ...mockAccountCustomer,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    it('throws an AccountCustomerNotCreatedError when the DB throws', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory({
        stripeCustomerId: faker.string.alphanumeric({ length: 50 }),
      });

      await expect(
        accountCustomerManager.createAccountCustomer(mockAccountCustomer)
      ).rejects.toBeInstanceOf(AccountCustomerNotCreatedError);
    });
  });

  describe('getAccountCustomerByUid', () => {
    it('fetches an existing accountCustomer successfully', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();
      await accountCustomerManager.createAccountCustomer(mockAccountCustomer);

      const result = await accountCustomerManager.getAccountCustomerByUid(
        mockAccountCustomer.uid
      );

      expect(result).toEqual({
        ...mockAccountCustomer,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    it('throws an AccountCustomerNotFoundError when accountCustomer does not exist', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();

      await expect(
        accountCustomerManager.getAccountCustomerByUid(mockAccountCustomer.uid)
      ).rejects.toBeInstanceOf(AccountCustomerNotFoundError);
    });
  });

  describe('updateAccountCustomer', () => {
    it('updates an existing accountCustomer successfully', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();
      await accountCustomerManager.createAccountCustomer(mockAccountCustomer);

      const newStripeCustomerId = faker.string.alphanumeric({ length: 14 });
      const mockUpdatedAccountCustomer = {
        ...mockAccountCustomer,
        stripeCustomerId: newStripeCustomerId,
      };

      const result = await accountCustomerManager.updateAccountCustomer(
        mockAccountCustomer.uid,
        mockUpdatedAccountCustomer
      );

      expect(result).toEqual(true);
    });

    it('throws an AccountCustomerNotUpdatedError when accountCustomer does not exist', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();

      await accountCustomerManager.createAccountCustomer(mockAccountCustomer);

      const mockUpdatedAccountCustomer = {
        ...mockAccountCustomer,
        stripeCustomerId: faker.string.alphanumeric({ length: 50 }),
      };

      await expect(
        accountCustomerManager.updateAccountCustomer(
          mockAccountCustomer.uid,
          mockUpdatedAccountCustomer
        )
      ).rejects.toBeInstanceOf(AccountCustomerNotUpdatedError);
    });
  });

  describe('deleteAccountCustomer', () => {
    it('deletes an existing AccountCustomer successfully', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();
      const resultAccountCustomer =
        await accountCustomerManager.createAccountCustomer(mockAccountCustomer);

      const result = await accountCustomerManager.deleteAccountCustomer(
        resultAccountCustomer
      );

      expect(result).toEqual(true);
    });

    it('throws an AccountCustomerNotDeletedError when accountCustomer does not exist', async () => {
      const mockAccountCustomer = CreateAccountCustomerFactory();
      const resultAccountCustomer =
        await accountCustomerManager.createAccountCustomer(mockAccountCustomer);

      await accountCustomerManager.deleteAccountCustomer(resultAccountCustomer);

      // Customer is already deleted, this should now throw
      await expect(
        accountCustomerManager.deleteAccountCustomer(resultAccountCustomer)
      ).rejects.toBeInstanceOf(AccountCustomerNotDeletedError);
    });
  });
});

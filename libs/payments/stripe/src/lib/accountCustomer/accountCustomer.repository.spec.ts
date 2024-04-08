/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import {
  AccountCustomerFactory,
  DB,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';

import { AccountCustomerNotUpdatedError } from './accountCustomer.error';
import {
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  updateAccountCustomer,
} from './accountCustomer.repository';

describe('AccountCustomer Repository', () => {
  let kyselyDb: Kysely<DB>;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup(['accountCustomers']);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createAccountCustomer', () => {
    it('creates an accountCustomer in the DB when the uid and customer id are valid', async () => {
      const mockAccountCustomer = AccountCustomerFactory();

      const result = await createAccountCustomer(kyselyDb, mockAccountCustomer);
      expect(result).toEqual(mockAccountCustomer);
    });

    it('fails to create an accountCustomer with a duplicateID in the DB', async () => {
      const accountCustomer = AccountCustomerFactory();
      await createAccountCustomer(kyselyDb, accountCustomer);

      expect(
        createAccountCustomer(kyselyDb, accountCustomer)
      ).rejects.toThrow();
    });

    it('fails to create an accountCustomer when the uid is invalid', async () => {
      const mockAccountCustomer = AccountCustomerFactory({
        uid: Buffer.from('27384d1476564252aade14e9c71bec4\\'),
      });

      await expect(
        createAccountCustomer(kyselyDb, mockAccountCustomer)
      ).rejects.toThrowError("Data too long for column 'uid' at row 1");
    });
  });

  describe('getAccountCustomerByUid', () => {
    it('finds an existing accountCustomer', async () => {
      const mockAccountCustomer = AccountCustomerFactory();
      await createAccountCustomer(kyselyDb, mockAccountCustomer);

      const result = await getAccountCustomerByUid(
        kyselyDb,
        mockAccountCustomer.uid
      );

      expect(result).toEqual(mockAccountCustomer);
    });

    it('does not find a non-existent accountCustomer', async () => {
      const mockAccountCustomer = AccountCustomerFactory({});
      await createAccountCustomer(kyselyDb, mockAccountCustomer);

      const nonExistentBufferUid = Buffer.from(
        '11114d1476500002aade14e9c71baaaa'
      );

      expect(
        getAccountCustomerByUid(kyselyDb, nonExistentBufferUid)
      ).rejects.toThrow();
    });

    it('handles bad input', async () => {
      const mockInvalidHex = Buffer.from('asfgewarger089_');

      expect(
        getAccountCustomerByUid(kyselyDb, mockInvalidHex)
      ).rejects.toThrow();
    });
  });

  describe('updateAccountCustomer', () => {
    it('updates an accountCustomer in the DB', async () => {
      const mockAccountCustomer = AccountCustomerFactory();
      await createAccountCustomer(kyselyDb, mockAccountCustomer);

      const newStripeCustomerId = faker.string.alphanumeric({ length: 14 });
      await updateAccountCustomer(kyselyDb, mockAccountCustomer.uid, {
        stripeCustomerId: newStripeCustomerId,
      });

      const result = await getAccountCustomerByUid(
        kyselyDb,
        mockAccountCustomer.uid
      );
      expect(result).toEqual({
        ...mockAccountCustomer,
        stripeCustomerId: newStripeCustomerId,
      });
    });

    it('throws if accountCustomer is not found', async () => {
      const mockAccountCustomer = AccountCustomerFactory();
      expect(
        updateAccountCustomer(kyselyDb, mockAccountCustomer.uid, {
          stripeCustomerId: '',
        })
      ).rejects.toThrow(AccountCustomerNotUpdatedError);
    });
  });

  describe('deleteAccountCustomer', () => {
    it('deletes an accountCustomer in the DB', async () => {
      const mockAccountCustomer = AccountCustomerFactory();
      const dbAccountCustomer = await createAccountCustomer(
        kyselyDb,
        mockAccountCustomer
      );

      const result = await deleteAccountCustomer(
        kyselyDb,
        dbAccountCustomer.uid
      );

      expect(result).toEqual(true);

      // accountCustomer has already been deleted, fetching should throw
      expect(
        getAccountCustomerByUid(kyselyDb, mockAccountCustomer.uid)
      ).rejects.toThrow();
    });

    it('returns false if no records have been deleted', async () => {
      const mockAccountCustomer = AccountCustomerFactory();

      const result = await deleteAccountCustomer(
        kyselyDb,
        mockAccountCustomer.uid
      );

      expect(result).toEqual(false);
    });
  });
});

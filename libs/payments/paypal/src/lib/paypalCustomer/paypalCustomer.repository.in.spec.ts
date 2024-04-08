/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  createPaypalCustomer,
  deletePaypalCustomer,
  fetchPaypalCustomer,
  fetchPaypalCustomersByBillingAgreementId,
  fetchPaypalCustomersByUid,
  updatePaypalCustomer,
} from './paypalCustomer.repository';
import { Kysely } from 'kysely';

import {
  DB,
  PaypalCustomerFactory,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { PaypalCustomerNotUpdatedError } from './paypalCustomer.error';

describe('PaypalCustomer Repository', () => {
  let kyselyDb: Kysely<DB>;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup(['paypalCustomers']);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createPaypalCustomer', () => {
    it('creates a paypalCustomer in the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      const result = await createPaypalCustomer(kyselyDb, paypalCustomer);

      expect(result).toEqual(paypalCustomer);
    });

    it('fails to create a paypalCustomer with a duplicate ID in the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      await createPaypalCustomer(kyselyDb, paypalCustomer);
      expect(createPaypalCustomer(kyselyDb, paypalCustomer)).rejects.toThrow();
    });
  });

  describe('fetchPaypalCustomer', () => {
    it('retrieves a paypalCustomer from the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      await createPaypalCustomer(kyselyDb, paypalCustomer);
      const result = await fetchPaypalCustomer(
        kyselyDb,
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId
      );

      expect(result).toEqual(paypalCustomer);
    });

    it("throws if paypalCustomer isn't found", async () => {
      const paypalCustomer = PaypalCustomerFactory();
      expect(
        fetchPaypalCustomer(
          kyselyDb,
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId
        )
      ).rejects.toThrow();
    });
  });

  describe('fetchPaypalCustomersByUid', () => {
    it('retrieves a paypalCustomer from the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      await createPaypalCustomer(kyselyDb, paypalCustomer);
      const result = await fetchPaypalCustomersByUid(
        kyselyDb,
        paypalCustomer.uid
      );

      expect(result).toEqual([paypalCustomer]);
    });

    it('returns empty set if no matching paypalCustomers are found', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      const result = await fetchPaypalCustomersByUid(
        kyselyDb,
        paypalCustomer.uid
      );
      expect(result).toEqual([]);
    });
  });

  describe('fetchPaypalCustomersByBillingAgreementId', () => {
    it('retrieves a paypalCustomer from the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      await createPaypalCustomer(kyselyDb, paypalCustomer);
      const result = await fetchPaypalCustomersByBillingAgreementId(
        kyselyDb,
        paypalCustomer.billingAgreementId
      );

      expect(result).toEqual([paypalCustomer]);
    });

    it('returns empty set if no matching paypalCustomers are found', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      const result = await fetchPaypalCustomersByBillingAgreementId(
        kyselyDb,
        paypalCustomer.billingAgreementId
      );
      expect(result).toEqual([]);
    });
  });

  describe('updatePaypalCustomer', () => {
    it('updates a paypalCustomer in the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      await createPaypalCustomer(kyselyDb, paypalCustomer);
      await updatePaypalCustomer(
        kyselyDb,
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId,
        {
          status: 'XYZ',
        }
      );
      const result = await fetchPaypalCustomer(
        kyselyDb,
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId
      );

      expect(result).toEqual({
        ...paypalCustomer,
        status: 'XYZ',
      });
    });

    it("throws if paypalCustomer isn't found", async () => {
      const paypalCustomer = PaypalCustomerFactory();
      expect(
        updatePaypalCustomer(
          kyselyDb,
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId,
          {
            status: 'XYZ',
          }
        )
      ).rejects.toThrow(PaypalCustomerNotUpdatedError);
    });
  });

  describe('deletePaypalCustomer', () => {
    it('deletes a paypalCustomer in the DB', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      const dbPaypalCustomer = await createPaypalCustomer(
        kyselyDb,
        paypalCustomer
      );
      const result = await deletePaypalCustomer(
        kyselyDb,
        dbPaypalCustomer.uid,
        dbPaypalCustomer.billingAgreementId
      );

      expect(result).toEqual(true);

      // paypalCustomer has already been deleted, fetching should throw
      expect(
        fetchPaypalCustomer(
          kyselyDb,
          paypalCustomer.uid,
          paypalCustomer.billingAgreementId
        )
      ).rejects.toThrow();
    });

    it('returns false if no records have been deleted', async () => {
      const paypalCustomer = PaypalCustomerFactory();
      const result = await deletePaypalCustomer(
        kyselyDb,
        paypalCustomer.uid,
        paypalCustomer.billingAgreementId
      );

      expect(result).toEqual(false);
    });
  });
});

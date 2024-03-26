/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import { CurrencyManager } from '@fxa/payments/currency';
import { StripeClient, StripeManager } from '@fxa/payments/stripe';
import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import { PayPalClient } from './paypal.client';
import { PayPalManager } from './paypal.manager';
import { PayPalService } from './paypal.service';
import { ResultPaypalCustomerFactory } from './paypalCustomer/paypalCustomer.factories';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';

describe('PayPalService', () => {
  let kyselyDb: Kysely<DB>;
  let paypalClient: PayPalClient;
  let paypalManager: PayPalManager;
  let stripeClient: StripeClient;
  let stripeManager: StripeManager;
  let paypalCustomerManager: PaypalCustomerManager;
  let currencyManager: CurrencyManager;
  let paypalService: PayPalService;

  beforeAll(async () => {
    kyselyDb = await testAccountDatabaseSetup([
      'paypalCustomers',
      'accountCustomers',
    ]);

    paypalClient = new PayPalClient({
      sandbox: false,
      user: faker.string.uuid(),
      pwd: faker.string.uuid(),
      signature: faker.string.uuid(),
    });

    stripeClient = new StripeClient({} as any);
    stripeManager = new StripeManager(stripeClient);
    paypalCustomerManager = new PaypalCustomerManager(kyselyDb);

    paypalManager = new PayPalManager(
      kyselyDb,
      paypalClient,
      stripeManager,
      paypalCustomerManager
    );

    currencyManager = new CurrencyManager();

    paypalService = new PayPalService(
      paypalManager,
      paypalCustomerManager,
      currencyManager
    );
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createBillingAgreement', () => {
    it('creates a billing agreement', async () => {
      const mockNewPaypalCustomer = ResultPaypalCustomerFactory();

      const uid = faker.string.sample();
      const token = faker.string.sample();
      const currency = faker.string.sample();
      const options = { uid, token, currency };

      paypalService.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockNewPaypalCustomer);

      const result = await paypalService.createBillingAgreement(options);
      expect(result).toEqual(mockNewPaypalCustomer);
    });
  });
});

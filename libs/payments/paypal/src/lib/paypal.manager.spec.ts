import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import {
  NVPBAUpdateTransactionResponseFactory,
  NVPSetExpressCheckoutResponseFactory,
} from './factories';
import { PayPalClient } from './paypal.client';
import { PayPalManager } from './paypal.manager';
import { BillingAgreementStatus } from './paypal.types';

describe('paypalManager', () => {
  let kyselyDb: Kysely<DB>;
  let paypalClient: PayPalClient;
  let paypalManager: PayPalManager;

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

    paypalManager = new PayPalManager(kyselyDb, paypalClient);
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  it('instantiates class (TODO: remove me)', () => {
    expect(paypalManager).toBeTruthy();
  });

  describe('getBillingAgreement', () => {
    it('returns agreement details (active status)', async () => {
      const billingAgreementId = faker.string.sample();
      const successfulBAUpdateResponse = NVPBAUpdateTransactionResponseFactory({
        BILLINGAGREEMENTSTATUS: 'Active',
      });

      paypalClient.baUpdate = jest
        .fn()
        .mockResolvedValueOnce(successfulBAUpdateResponse);

      const expected = {
        city: successfulBAUpdateResponse.CITY,
        countryCode: successfulBAUpdateResponse.COUNTRYCODE,
        firstName: successfulBAUpdateResponse.FIRSTNAME,
        lastName: successfulBAUpdateResponse.LASTNAME,
        state: successfulBAUpdateResponse.STATE,
        status: BillingAgreementStatus.Active,
        street: successfulBAUpdateResponse.STREET,
        street2: successfulBAUpdateResponse.STREET2,
        zip: successfulBAUpdateResponse.ZIP,
      };

      const result = await paypalManager.getBillingAgreement(
        billingAgreementId
      );
      expect(result).toEqual(expected);
      expect(paypalClient.baUpdate).toBeCalledTimes(1);
      expect(paypalClient.baUpdate).toBeCalledWith({ billingAgreementId });
    });

    it('returns agreement details (cancelled status)', async () => {
      const billingAgreementId = faker.string.sample();
      const successfulBAUpdateResponse = NVPBAUpdateTransactionResponseFactory({
        BILLINGAGREEMENTSTATUS: 'Canceled',
      });

      paypalClient.baUpdate = jest
        .fn()
        .mockResolvedValueOnce(successfulBAUpdateResponse);

      const expected = {
        city: successfulBAUpdateResponse.CITY,
        countryCode: successfulBAUpdateResponse.COUNTRYCODE,
        firstName: successfulBAUpdateResponse.FIRSTNAME,
        lastName: successfulBAUpdateResponse.LASTNAME,
        state: successfulBAUpdateResponse.STATE,
        status: BillingAgreementStatus.Cancelled,
        street: successfulBAUpdateResponse.STREET,
        street2: successfulBAUpdateResponse.STREET2,
        zip: successfulBAUpdateResponse.ZIP,
      };

      const result = await paypalManager.getBillingAgreement(
        billingAgreementId
      );
      expect(result).toEqual(expected);
      expect(paypalClient.baUpdate).toBeCalledTimes(1);
      expect(paypalClient.baUpdate).toBeCalledWith({ billingAgreementId });
    });
  });

  describe('getCheckoutToken', () => {
    it('returns token and calls setExpressCheckout with passed options', async () => {
      const currencyCode = faker.finance.currencyCode();
      const token = faker.string.uuid();
      const successfulSetExpressCheckoutResponse =
        NVPSetExpressCheckoutResponseFactory({
          TOKEN: token,
        });

      paypalClient.setExpressCheckout = jest
        .fn()
        .mockResolvedValueOnce(successfulSetExpressCheckoutResponse);

      const result = await paypalManager.getCheckoutToken(currencyCode);

      expect(result).toEqual(successfulSetExpressCheckoutResponse.TOKEN);
      expect(paypalClient.setExpressCheckout).toBeCalledTimes(1);
      expect(paypalClient.setExpressCheckout).toBeCalledWith({ currencyCode });
    });
  });
});

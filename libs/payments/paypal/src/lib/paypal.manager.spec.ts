import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import {
  CustomerFactory,
  InvoiceFactory,
  StripeClient,
  StripeManager,
} from '@fxa/payments/stripe';
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
  let stripeClient: StripeClient;
  let stripeManager: StripeManager;

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
    paypalManager = new PayPalManager(kyselyDb, paypalClient, stripeManager);
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

  describe('processZeroInvoice', () => {
    it('finalizes invoices with no amount set to zero', async () => {
      const mockInvoice = InvoiceFactory();

      stripeManager.finalizeInvoiceWithoutAutoAdvance = jest
        .fn()
        .mockResolvedValueOnce({});

      const result = await paypalManager.processZeroInvoice(mockInvoice.id);

      expect(result).toEqual({});
      expect(stripeManager.finalizeInvoiceWithoutAutoAdvance).toBeCalledWith(
        mockInvoice.id
      );
    });
  });

  describe('processInvoice', () => {
    it('calls processZeroInvoice when amount is less than minimum amount', async () => {
      const mockInvoice = InvoiceFactory({
        amount_due: 0,
        currency: 'usd',
      });

      paypalManager.processZeroInvoice = jest.fn().mockResolvedValueOnce({});

      const result = await paypalManager.processInvoice(mockInvoice);
      expect(result).toEqual({});
      expect(paypalManager.processZeroInvoice).toBeCalledWith(mockInvoice.id);
    });

    it('calls PayPalManager processNonZeroInvoice when amount is greater than minimum amount', async () => {
      const mockCustomer = CustomerFactory();
      const mockInvoice = InvoiceFactory({
        amount_due: 50,
        currency: 'usd',
        customer: mockCustomer,
      });

      stripeManager.fetchActiveCustomer = jest
        .fn()
        .mockResolvedValueOnce(mockCustomer);
      paypalManager.processNonZeroInvoice = jest.fn().mockResolvedValueOnce({});

      const result = await paypalManager.processInvoice(mockInvoice);
      expect(result).toEqual({});
      expect(paypalManager.processNonZeroInvoice).toBeCalledWith(
        mockCustomer,
        mockInvoice
      );
    });
  });
});

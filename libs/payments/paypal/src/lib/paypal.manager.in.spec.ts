/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Kysely } from 'kysely';

import {
  StripeApiListFactory,
  StripeClient,
  StripeConfig,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripeManager,
  StripeSubscription,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { DB, testAccountDatabaseSetup } from '@fxa/shared/db/mysql/account';

import {
  NVPBAUpdateTransactionResponseFactory,
  NVPSetExpressCheckoutResponseFactory,
} from './factories';
import { PayPalClient } from './paypal.client';
import { PayPalManager } from './paypal.manager';
import { BillingAgreementStatus } from './paypal.types';
import { PaypalCustomerMultipleRecordsError } from './paypalCustomer/paypalCustomer.error';
import { ResultPaypalCustomerFactory } from './paypalCustomer/paypalCustomer.factories';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { PaypalManagerError } from './paypal.error';

describe('PaypalManager', () => {
  let kyselyDb: Kysely<DB>;
  let paypalClient: PayPalClient;
  let paypalManager: PayPalManager;
  let stripeClient: StripeClient;
  let stripeConfig: StripeConfig;
  let stripeManager: StripeManager;
  let paypalCustomerManager: PaypalCustomerManager;

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

    stripeConfig = {
      apiKey: faker.string.uuid(),
      taxIds: { EUR: 'EU1234' },
    };

    stripeClient = new StripeClient({} as any);
    stripeManager = new StripeManager(stripeClient, stripeConfig);
    paypalCustomerManager = new PaypalCustomerManager(kyselyDb);

    paypalManager = new PayPalManager(
      paypalClient,
      stripeManager,
      paypalCustomerManager
    );
  });

  afterAll(async () => {
    if (kyselyDb) {
      await kyselyDb.destroy();
    }
  });

  describe('createBillingAgreement', () => {
    it('creates a billing agreement', async () => {
      const token = faker.string.uuid();
      const mockBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      paypalClient.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockBillingAgreement);

      const result = await paypalManager.createBillingAgreement(token);
      expect(result).toEqual(mockBillingAgreement.BILLINGAGREEMENTID);
      expect(paypalClient.createBillingAgreement).toBeCalledWith({
        token,
      });
    });
  });

  describe('getOrCreateBillingAgreementId', () => {
    it('returns without creating if there is an existing billing agreement', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();
      const mockPayPalCustomer = ResultPaypalCustomerFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([mockPayPalCustomer]);

      paypalClient.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockNewBillingAgreement);

      const result = await paypalManager.getOrCreateBillingAgreementId(
        uid,
        false,
        token
      );
      expect(result).toEqual(mockPayPalCustomer.billingAgreementId);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });

    it('returns a new billing agreement when no billing agreement exists and token passed', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([]);

      paypalClient.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockNewBillingAgreement);

      const result = await paypalManager.getOrCreateBillingAgreementId(
        uid,
        false,
        token
      );
      expect(result).toEqual(mockNewBillingAgreement.BILLINGAGREEMENTID);
      expect(paypalClient.createBillingAgreement).toBeCalledWith({
        token,
      });
    });

    it('throws an error if no billing agreement id is present and user has subscriptions', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([]);

      paypalClient.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockNewBillingAgreement);

      expect(
        paypalManager.getOrCreateBillingAgreementId(uid, true, token)
      ).rejects.toBeInstanceOf(PaypalManagerError);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });

    it('throws an error if no billing agreement id is present and token is not provided', async () => {
      const uid = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([]);

      paypalClient.createBillingAgreement = jest
        .fn()
        .mockResolvedValueOnce(mockNewBillingAgreement);

      expect(
        paypalManager.getOrCreateBillingAgreementId(uid, false)
      ).rejects.toBeInstanceOf(PaypalManagerError);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });
  });

  describe('cancelBillingAgreement', () => {
    it('cancels a billing agreement', async () => {
      const billingAgreementId = faker.string.sample();

      paypalClient.baUpdate = jest
        .fn()
        .mockResolvedValueOnce(NVPBAUpdateTransactionResponseFactory());

      const result = await paypalManager.cancelBillingAgreement(
        billingAgreementId
      );
      expect(result).toBeUndefined();
      expect(paypalClient.baUpdate).toBeCalledWith({
        billingAgreementId,
        cancel: true,
      });
    });

    it('throws an error', async () => {
      expect(paypalManager.cancelBillingAgreement).rejects.toThrowError();
    });
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

  describe('getCustomerBillingAgreementId', () => {
    it("returns the customer's current PayPal billing agreement ID", async () => {
      const mockPayPalCustomer = ResultPaypalCustomerFactory();
      const mockStripeCustomer = StripeCustomerFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([mockPayPalCustomer]);

      const result = await paypalManager.getCustomerBillingAgreementId(
        mockStripeCustomer.id
      );
      expect(result).toEqual(mockPayPalCustomer.billingAgreementId);
    });

    it('returns undefined if no PayPal customer record', async () => {
      const mockStripeCustomer = StripeCustomerFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([]);

      const result = await paypalManager.getCustomerBillingAgreementId(
        mockStripeCustomer.id
      );
      expect(result).toEqual(undefined);
    });

    it('throws PaypalCustomerMultipleRecordsError if more than one PayPal customer found', async () => {
      const mockPayPalCustomer1 = ResultPaypalCustomerFactory();
      const mockPayPalCustomer2 = ResultPaypalCustomerFactory();
      const mockStripeCustomer = StripeCustomerFactory();

      paypalCustomerManager.fetchPaypalCustomersByUid = jest
        .fn()
        .mockResolvedValueOnce([mockPayPalCustomer1, mockPayPalCustomer2]);

      expect.assertions(1);
      expect(
        paypalManager.getCustomerBillingAgreementId(mockStripeCustomer.id)
      ).rejects.toBeInstanceOf(PaypalCustomerMultipleRecordsError);
    });
  });

  describe('getCustomerPayPalSubscriptions', () => {
    it('return customer subscriptions where collection method is send_invoice', async () => {
      const mockPayPalSubscription = StripeSubscriptionFactory({
        collection_method: 'send_invoice',
        status: 'active',
      });

      const mockSubscriptionList = StripeApiListFactory([
        mockPayPalSubscription,
      ]);

      const mockCustomer = StripeCustomerFactory();

      const expected = [mockPayPalSubscription];

      stripeManager.getSubscriptions = jest
        .fn()
        .mockResolvedValueOnce(mockSubscriptionList);

      const result = await paypalManager.getCustomerPayPalSubscriptions(
        mockCustomer.id
      );
      expect(result).toEqual(expected);
    });

    it('returns empty array when no subscriptions', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockPayPalSubscription = [] as StripeSubscription[];
      const mockSubscriptionList = StripeApiListFactory([
        mockPayPalSubscription,
      ]);

      stripeManager.getSubscriptions = jest
        .fn()
        .mockResolvedValueOnce(mockSubscriptionList);

      const result = await paypalManager.getCustomerPayPalSubscriptions(
        mockCustomer.id
      );
      expect(result).toEqual([]);
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
      const mockInvoice = StripeInvoiceFactory();

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
      const mockInvoice = StripeInvoiceFactory({
        amount_due: 0,
        currency: 'usd',
      });

      paypalManager.processZeroInvoice = jest.fn().mockResolvedValueOnce({});

      const result = await paypalManager.processInvoice(mockInvoice);
      expect(result).toEqual({});
      expect(paypalManager.processZeroInvoice).toBeCalledWith(mockInvoice.id);
    });

    it('calls PayPalManager processNonZeroInvoice when amount is greater than minimum amount', async () => {
      const mockCustomer = StripeCustomerFactory();
      const mockInvoice = StripeInvoiceFactory({
        amount_due: 50,
        currency: 'usd',
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

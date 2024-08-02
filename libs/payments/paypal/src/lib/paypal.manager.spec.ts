/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import {
  CustomerManager,
  InvoiceManager,
  MockStripeConfigProvider,
  StripeClient,
  StripeCustomerFactory,
  StripeInvoiceFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
  SubscriptionManager,
} from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';

import {
  NVPCreateBillingAgreementResponseFactory,
  NVPBAUpdateTransactionResponseFactory,
} from './factories';
import { PayPalClient } from './paypal.client';
import { PayPalManager } from './paypal.manager';
import { BillingAgreementStatus } from './paypal.types';
import {
  AmountExceedsPayPalCharLimitError,
  PaypalManagerError,
} from './paypal.error';
import { PaypalCustomerMultipleRecordsError } from './paypalCustomer/paypalCustomer.error';
import { ResultPaypalCustomerFactory } from './paypalCustomer/paypalCustomer.factories';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { MockPaypalClientConfigProvider } from './paypal.client.config';

describe('PayPalManager', () => {
  let paypalManager: PayPalManager;
  let paypalClient: PayPalClient;
  let paypalCustomerManager: PaypalCustomerManager;
  let customerManager: CustomerManager;
  let subscriptionManager: SubscriptionManager;
  let invoiceManager: InvoiceManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MockAccountDatabaseNestFactory,
        MockStripeConfigProvider,
        MockPaypalClientConfigProvider,
        PayPalManager,
        PayPalClient,
        StripeClient,
        CustomerManager,
        SubscriptionManager,
        InvoiceManager,
        PaypalCustomerManager,
      ],
    }).compile();

    paypalManager = moduleRef.get(PayPalManager);
    paypalClient = moduleRef.get(PayPalClient);
    customerManager = moduleRef.get(CustomerManager);
    subscriptionManager = moduleRef.get(SubscriptionManager);
    invoiceManager = moduleRef.get(InvoiceManager);
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getOrCreateBillingAgreementId', () => {
    it('returns without creating if there is an existing billing agreement', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();
      const mockPayPalCustomer = ResultPaypalCustomerFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPayPalCustomer]);

      jest
        .spyOn(paypalClient, 'createBillingAgreement')
        .mockResolvedValue(mockNewBillingAgreement);

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
      const mockBillingAgreementId = faker.string.uuid();

      jest
        .spyOn(paypalManager, 'getCustomerBillingAgreementId')
        .mockResolvedValue(undefined);

      jest
        .spyOn(paypalManager, 'createBillingAgreement')
        .mockResolvedValue(mockBillingAgreementId);

      const result = await paypalManager.getOrCreateBillingAgreementId(
        uid,
        false,
        token
      );
      expect(result).toEqual(mockBillingAgreementId);
      expect(paypalManager.createBillingAgreement).toBeCalledWith(uid, token);
    });

    it('throws an error if no billing agreement id is present and user has subscriptions', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);

      jest
        .spyOn(paypalClient, 'createBillingAgreement')
        .mockResolvedValue(mockNewBillingAgreement);

      await expect(
        paypalManager.getOrCreateBillingAgreementId(uid, true, token)
      ).rejects.toBeInstanceOf(PaypalManagerError);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });

    it('throws an error if no billing agreement id is present and token is not provided', async () => {
      const uid = faker.string.uuid();
      const mockNewBillingAgreement = NVPBAUpdateTransactionResponseFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);

      jest
        .spyOn(paypalClient, 'createBillingAgreement')
        .mockResolvedValue(mockNewBillingAgreement);

      await expect(
        paypalManager.getOrCreateBillingAgreementId(uid, false)
      ).rejects.toBeInstanceOf(PaypalManagerError);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });
  });

  describe('cancelBillingAgreement', () => {
    it('cancels a billing agreement', async () => {
      const billingAgreementId = faker.string.sample();

      jest
        .spyOn(paypalClient, 'baUpdate')
        .mockResolvedValue(NVPBAUpdateTransactionResponseFactory());

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
      const billingAgreementId = faker.string.sample();

      jest.spyOn(paypalClient, 'baUpdate').mockRejectedValue(new Error('Boom'));

      await expect(() =>
        paypalManager.cancelBillingAgreement(billingAgreementId)
      ).rejects.toThrowError();
    });
  });

  describe('createBillingAgreement', () => {
    it('creates a billing agreement', async () => {
      const uid = faker.string.uuid();
      const token = faker.string.uuid();

      const billingAgreement = NVPCreateBillingAgreementResponseFactory();
      const paypalCustomer = ResultPaypalCustomerFactory();

      jest
        .spyOn(paypalClient, 'createBillingAgreement')
        .mockResolvedValue(billingAgreement);

      jest
        .spyOn(paypalCustomerManager, 'createPaypalCustomer')
        .mockResolvedValue(paypalCustomer);

      const result = await paypalManager.createBillingAgreement(uid, token);

      expect(paypalClient.createBillingAgreement).toHaveBeenCalledWith({
        token,
      });

      expect(paypalCustomerManager.createPaypalCustomer).toHaveBeenCalledWith({
        uid: uid,
        billingAgreementId: billingAgreement.BILLINGAGREEMENTID,
        status: 'active',
        endedAt: null,
      });

      expect(result).toEqual(paypalCustomer.billingAgreementId);
    });

    it('throws an error', async () => {
      await expect(paypalManager.createBillingAgreement).rejects.toThrowError();
    });
  });

  describe('getBillingAgreement', () => {
    it('returns agreement details (active status)', async () => {
      const nvpBillingAgreementMock = NVPBAUpdateTransactionResponseFactory();
      const billingAgreementId = faker.string.sample();

      const baUpdateMock = jest
        .spyOn(paypalClient, 'baUpdate')
        .mockResolvedValue(nvpBillingAgreementMock);

      const result = await paypalManager.getBillingAgreement(
        billingAgreementId
      );
      expect(result).toEqual({
        city: nvpBillingAgreementMock.CITY,
        countryCode: nvpBillingAgreementMock.COUNTRYCODE,
        firstName: nvpBillingAgreementMock.FIRSTNAME,
        lastName: nvpBillingAgreementMock.LASTNAME,
        state: nvpBillingAgreementMock.STATE,
        status: BillingAgreementStatus.Active,
        street: nvpBillingAgreementMock.STREET,
        street2: nvpBillingAgreementMock.STREET2,
        zip: nvpBillingAgreementMock.ZIP,
      });
      expect(baUpdateMock).toBeCalledTimes(1);
      expect(baUpdateMock).toBeCalledWith({ billingAgreementId });
    });

    it('returns agreement details (cancelled status)', async () => {
      const billingAgreementId = faker.string.sample();
      const nvpBillingAgreementMock = NVPBAUpdateTransactionResponseFactory({
        BILLINGAGREEMENTSTATUS: 'Canceled',
      });

      const baUpdateMock = jest
        .spyOn(paypalClient, 'baUpdate')
        .mockResolvedValue(nvpBillingAgreementMock);

      const result = await paypalManager.getBillingAgreement(
        billingAgreementId
      );
      expect(result).toEqual({
        city: nvpBillingAgreementMock.CITY,
        countryCode: nvpBillingAgreementMock.COUNTRYCODE,
        firstName: nvpBillingAgreementMock.FIRSTNAME,
        lastName: nvpBillingAgreementMock.LASTNAME,
        state: nvpBillingAgreementMock.STATE,
        status: BillingAgreementStatus.Cancelled,
        street: nvpBillingAgreementMock.STREET,
        street2: nvpBillingAgreementMock.STREET2,
        zip: nvpBillingAgreementMock.ZIP,
      });
      expect(baUpdateMock).toBeCalledTimes(1);
      expect(baUpdateMock).toBeCalledWith({ billingAgreementId });
    });
  });

  describe('getCustomerBillingAgreementId', () => {
    it("returns the customer's current PayPal billing agreement ID", async () => {
      const uid = faker.string.uuid();
      const mockPayPalCustomer = ResultPaypalCustomerFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPayPalCustomer]);

      const result = await paypalManager.getCustomerBillingAgreementId(uid);
      expect(result).toEqual(mockPayPalCustomer.billingAgreementId);
    });

    it('returns undefined if no PayPal customer record', async () => {
      const uid = faker.string.uuid();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);

      const result = await paypalManager.getCustomerBillingAgreementId(uid);
      expect(result).toEqual(undefined);
    });

    it('throws PaypalCustomerMultipleRecordsError if more than one PayPal customer found', async () => {
      const uid = faker.string.uuid();
      const mockPayPalCustomer1 = ResultPaypalCustomerFactory();
      const mockPayPalCustomer2 = ResultPaypalCustomerFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPayPalCustomer1, mockPayPalCustomer2]);

      await expect(
        paypalManager.getCustomerBillingAgreementId(uid)
      ).rejects.toBeInstanceOf(PaypalCustomerMultipleRecordsError);
    });
  });

  describe('getCustomerPayPalSubscriptions', () => {
    it('return customer subscriptions where collection method is send_invoice', async () => {
      const mockPayPalSubscription = StripeSubscriptionFactory({
        collection_method: 'send_invoice',
        status: 'active',
      });

      const mockCustomer = StripeCustomerFactory();

      const expected = [mockPayPalSubscription];

      jest
        .spyOn(subscriptionManager, 'listForCustomer')
        .mockResolvedValue([mockPayPalSubscription]);

      const result = await paypalManager.getCustomerPayPalSubscriptions(
        mockCustomer.id
      );
      expect(result).toEqual(expected);
    });
  });

  it('returns empty array when no subscriptions', async () => {
    const mockCustomer = StripeCustomerFactory();

    jest
      .spyOn(subscriptionManager, 'listForCustomer')
      .mockResolvedValueOnce([]);

    const result = await paypalManager.getCustomerPayPalSubscriptions(
      mockCustomer.id
    );
    expect(result).toEqual([]);
  });

  describe('processZeroInvoice', () => {
    it('finalizes invoices with no amount set to zero', async () => {
      const mockInvoice = StripeResponseFactory(StripeInvoiceFactory());

      jest
        .spyOn(invoiceManager, 'finalizeWithoutAutoAdvance')
        .mockResolvedValue(mockInvoice);

      const result = await paypalManager.processZeroInvoice(mockInvoice.id);

      expect(result).toEqual(mockInvoice);
      expect(invoiceManager.finalizeWithoutAutoAdvance).toBeCalledWith(
        mockInvoice.id
      );
    });
  });

  describe('processInvoice', () => {
    it('calls processZeroInvoice when amount is less than minimum amount', async () => {
      const mockInvoice = StripeResponseFactory(
        StripeInvoiceFactory({
          amount_due: 0,
          currency: 'usd',
        })
      );

      jest.spyOn(subscriptionManager, 'getMinimumAmount').mockReturnValue(10);
      jest
        .spyOn(paypalManager, 'processZeroInvoice')
        .mockResolvedValue(mockInvoice);
      jest.spyOn(paypalManager, 'processNonZeroInvoice').mockResolvedValue();

      await paypalManager.processInvoice(mockInvoice);
      expect(paypalManager.processZeroInvoice).toBeCalledWith(mockInvoice.id);
      expect(paypalManager.processNonZeroInvoice).not.toHaveBeenCalled();
    });

    it('calls PayPalManager processNonZeroInvoice when amount is greater than minimum amount', async () => {
      const mockCustomer = StripeResponseFactory(StripeCustomerFactory());
      const mockInvoice = StripeInvoiceFactory({
        amount_due: 50,
        currency: 'usd',
      });

      jest.spyOn(subscriptionManager, 'getMinimumAmount').mockReturnValue(10);
      jest.spyOn(customerManager, 'retrieve').mockResolvedValue(mockCustomer);
      jest
        .spyOn(paypalManager, 'processZeroInvoice')
        .mockResolvedValue(StripeResponseFactory(mockInvoice));
      jest.spyOn(paypalManager, 'processNonZeroInvoice').mockResolvedValue();

      await paypalManager.processInvoice(mockInvoice);

      expect(paypalManager.processNonZeroInvoice).toBeCalledWith(
        mockCustomer,
        mockInvoice
      );
      expect(paypalManager.processZeroInvoice).not.toHaveBeenCalled();
    });
  });

  describe('getPayPalAmountStringFromAmountInCents', () => {
    it('returns correctly formatted string', () => {
      const amountInCents = 9999999999;
      const expectedResult = (amountInCents / 100).toFixed(2);

      const result =
        paypalManager.getPayPalAmountStringFromAmountInCents(amountInCents);

      expect(result).toEqual(expectedResult);
    });

    it('throws an error if number exceeds digit limit', () => {
      const amountInCents = 12345678910;

      expect(() => {
        paypalManager.getPayPalAmountStringFromAmountInCents(amountInCents);
      }).toThrow(AmountExceedsPayPalCharLimitError);
    });
  });
});

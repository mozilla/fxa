/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

import { MockStripeConfigProvider, StripeClient } from '@fxa/payments/stripe';
import { MockAccountDatabaseNestFactory } from '@fxa/shared/db/mysql/account';

import {
  NVPCreateBillingAgreementResponseFactory,
  NVPBAUpdateTransactionResponseFactory,
} from './factories';
import { PayPalClient } from './paypal.client';
import { MockPaypalClientConfigProvider } from './paypal.client.config';
import { PaypalBillingAgreementManagerError } from './paypal.error';
import { BillingAgreementStatus } from './paypal.types';
import { PaypalBillingAgreementManager } from './paypalBillingAgreement.manager';
import { PaypalCustomerMultipleRecordsError } from './paypalCustomer/paypalCustomer.error';
import { ResultPaypalCustomerFactory } from './paypalCustomer/paypalCustomer.factories';
import { PaypalCustomerManager } from './paypalCustomer/paypalCustomer.manager';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

describe('PaypalBillingAgreementManager', () => {
  let paypalClient: PayPalClient;
  let paypalBillingAgreementManager: PaypalBillingAgreementManager;
  let paypalCustomerManager: PaypalCustomerManager;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PaypalBillingAgreementManager,
        PayPalClient,
        PaypalCustomerManager,
        MockAccountDatabaseNestFactory,
        MockStripeConfigProvider,
        MockPaypalClientConfigProvider,
        StripeClient,
        MockStatsDProvider,
      ],
    }).compile();

    paypalClient = moduleRef.get(PayPalClient);
    paypalCustomerManager = moduleRef.get(PaypalCustomerManager);
    paypalBillingAgreementManager = moduleRef.get(
      PaypalBillingAgreementManager
    );
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

      const result = await paypalBillingAgreementManager.retrieveOrCreateId(
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
        .spyOn(paypalBillingAgreementManager, 'retrieveActiveId')
        .mockResolvedValue(undefined);

      jest
        .spyOn(paypalBillingAgreementManager, 'create')
        .mockResolvedValue(mockBillingAgreementId);

      const result = await paypalBillingAgreementManager.retrieveOrCreateId(
        uid,
        false,
        token
      );
      expect(result).toEqual(mockBillingAgreementId);
      expect(paypalBillingAgreementManager.create).toBeCalledWith(uid, token);
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
        paypalBillingAgreementManager.retrieveOrCreateId(uid, true, token)
      ).rejects.toBeInstanceOf(PaypalBillingAgreementManagerError);
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
        paypalBillingAgreementManager.retrieveOrCreateId(uid, false)
      ).rejects.toBeInstanceOf(PaypalBillingAgreementManagerError);
      expect(paypalClient.createBillingAgreement).not.toBeCalled();
    });
  });

  describe('cancelBillingAgreement', () => {
    it('cancels a billing agreement', async () => {
      const billingAgreementId = faker.string.sample();

      jest
        .spyOn(paypalClient, 'baUpdate')
        .mockResolvedValue(NVPBAUpdateTransactionResponseFactory());

      const result = await paypalBillingAgreementManager.cancel(
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
        paypalBillingAgreementManager.cancel(billingAgreementId)
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

      const result = await paypalBillingAgreementManager.create(uid, token);

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
      await expect(paypalBillingAgreementManager.create).rejects.toThrowError();
    });
  });

  describe('getBillingAgreement', () => {
    it('returns agreement details (active status)', async () => {
      const nvpBillingAgreementMock = NVPBAUpdateTransactionResponseFactory();
      const billingAgreementId = faker.string.sample();

      const baUpdateMock = jest
        .spyOn(paypalClient, 'baUpdate')
        .mockResolvedValue(nvpBillingAgreementMock);

      const result = await paypalBillingAgreementManager.retrieve(
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

      const result = await paypalBillingAgreementManager.retrieve(
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

  describe('retrieveActiveId', () => {
    it("returns the customer's current active PayPal billing agreement ID", async () => {
      const uid = faker.string.uuid();
      const mockPayPalCustomer = ResultPaypalCustomerFactory();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPayPalCustomer]);

      const result = await paypalBillingAgreementManager.retrieveActiveId(uid);
      expect(result).toEqual(mockPayPalCustomer.billingAgreementId);
    });

    it('returns undefined if no PayPal customer record', async () => {
      const uid = faker.string.uuid();

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([]);

      const result = await paypalBillingAgreementManager.retrieveActiveId(uid);
      expect(result).toEqual(undefined);
    });

    it('returns undefined if billing agreement is not active', async () => {
      const uid = faker.string.uuid();
      const mockPayPalCustomer = ResultPaypalCustomerFactory({ status: 'Cancelled' });

      jest
        .spyOn(paypalCustomerManager, 'fetchPaypalCustomersByUid')
        .mockResolvedValue([mockPayPalCustomer]);

      const result = await paypalBillingAgreementManager.retrieveActiveId(uid);
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
        paypalBillingAgreementManager.retrieveActiveId(uid)
      ).rejects.toBeInstanceOf(PaypalCustomerMultipleRecordsError);
    });
  });
});

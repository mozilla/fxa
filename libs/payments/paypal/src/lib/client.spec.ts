/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import nock from 'nock';
import { faker } from '@faker-js/faker';

import { PayPalClient } from './client';

import { PayPalClientError } from './error';

import {
  BAUpdateOptions,
  DoReferenceTransactionOptions,
  PaypalMethods,
  RefundTransactionOptions,
  RefundType,
  TransactionSearchOptions,
} from './types';

import {
  PAYPAL_SANDBOX_BASE,
  PAYPAL_SANDBOX_IPN_BASE,
  PAYPAL_NVP_ROUTE,
  PAYPAL_IPN_ROUTE,
  PLACEHOLDER_URL,
  PAYPAL_VERSION,
} from './constants';

import {
  NVPBAUpdateTransactionResponseFactory,
  NVPDoReferenceTransactionResponseFactory,
  NVPErrorResponseFactory,
  NVPRefundTransactionResponseFactory,
  NVPResponseFactory,
  NVPSetExpressCheckoutResponseFactory,
  NVPTransactionSearchResponseFactory,
} from './factories';
import { objectToNVP, toIsoString } from './util';

describe('PayPalClient', () => {
  const commonPayloadArgs = {
    USER: 'user',
    PWD: 'pwd',
    SIGNATURE: 'sig',
    VERSION: PAYPAL_VERSION,
  };

  let client: PayPalClient;

  beforeEach(() => {
    client = new PayPalClient({
      user: 'user',
      sandbox: true,
      pwd: 'pwd',
      signature: 'sig',
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('setExpressCheckout', () => {
    const defaultPayload = {
      CANCELURL: PLACEHOLDER_URL,
      L_BILLINGAGREEMENTDESCRIPTION0: 'Mozilla',
      L_BILLINGTYPE0: 'MerchantInitiatedBilling',
      NOSHIPPING: 1,
      PAYMENTREQUEST_0_AMT: '0',
      PAYMENTREQUEST_0_PAYMENTACTION: 'AUTHORIZATION',
      RETURNURL: PLACEHOLDER_URL,
      METHOD: PaypalMethods.SetExpressCheckout,
      ...commonPayloadArgs,
    };

    it('calls api with correct method and data', async () => {
      const currencyCode = faker.finance.currencyCode();

      const expectedPayload = {
        ...defaultPayload,
        PAYMENTREQUEST_0_CURRENCYCODE: currencyCode,
      };

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(NVPSetExpressCheckoutResponseFactory()));

      await client.setExpressCheckout({
        currencyCode,
      });
    });

    it('if request unsuccessful, throws PayPalClientError', async () => {
      const currencyCode = faker.finance.currencyCode();

      const expectedPayload = {
        ...defaultPayload,
        PAYMENTREQUEST_0_CURRENCYCODE: currencyCode,
      };
      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(NVPErrorResponseFactory()));

      try {
        await client.setExpressCheckout({
          currencyCode,
        });
        fail('Request should have thrown an error.');
      } catch (err) {
        expect(err).toBeInstanceOf(PayPalClientError);
        expect(err.name).toEqual('PayPalClientError');
        expect(err.raw).toMatch(/ACK=Failure/);
        expect(err.data.ACK).toEqual('Failure');
        expect(typeof err.errorCode).toBe('number');
      }
    });
  });

  describe('createBillingAgreement', () => {
    it('calls API with valid token', async () => {
      const token = faker.string.alphanumeric();

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.CreateBillingAgreement,
        token,
      };

      const response = NVPResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.createBillingAgreement({
        token,
      });

      expect(result).toMatchObject(response);
    });
  });

  describe('doReferenceTransaction', () => {
    it('calls api with correct method and data', async () => {
      const options = {
        amount: faker.finance.amount(),
        currencyCode: faker.finance.currencyCode(),
        idempotencyKey: faker.string.sample(),
        ipaddress: faker.internet.ipv4(),
        billingAgreementId: faker.string.sample(),
        invoiceNumber: faker.string.sample(),
      } satisfies DoReferenceTransactionOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.DoReferenceTransaction,
        PAYMENTACTION: 'Sale',
        PAYMENTTYPE: 'instant',
        AMT: options.amount,
        CURRENCYCODE: options.currencyCode,
        CUSTOM: options.idempotencyKey,
        INVNUM: options.invoiceNumber,
        IPADDRESS: options.ipaddress,
        MSGSUBID: options.idempotencyKey,
        REFERENCEID: options.billingAgreementId,
      };

      const response = NVPDoReferenceTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.doReferenceTransaction(options);

      expect(result).toMatchObject(response);
    });

    it('calls api with requested optional tax amount', async () => {
      const taxAmount = faker.finance.amount();
      const options = {
        amount: faker.finance.amount(),
        currencyCode: faker.finance.currencyCode(),
        idempotencyKey: faker.string.sample(),
        ipaddress: faker.internet.ipv4(),
        billingAgreementId: faker.string.sample(),
        invoiceNumber: faker.string.sample(),
        taxAmount,
      } satisfies DoReferenceTransactionOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.DoReferenceTransaction,
        PAYMENTACTION: 'Sale',
        PAYMENTTYPE: 'instant',
        AMT: options.amount,
        CURRENCYCODE: options.currencyCode,
        CUSTOM: options.idempotencyKey,
        INVNUM: options.invoiceNumber,
        IPADDRESS: options.ipaddress,
        MSGSUBID: options.idempotencyKey,
        REFERENCEID: options.billingAgreementId,
        TAXAMT: options.taxAmount,
        L_AMT0: options.amount,
        L_TAXAMT0: options.taxAmount,
        ITEMAMT: (Number(options.amount) - Number(taxAmount)).toFixed(2),
      };

      const response = NVPDoReferenceTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.doReferenceTransaction(options);

      expect(result).toMatchObject(response);
    });
  });

  describe('refundTransaction', () => {
    it('runs partial refund with amount', async () => {
      const options = {
        amount: faker.number.int(),
        transactionId: faker.string.sample(),
        refundType: RefundType.Partial,
        idempotencyKey: faker.string.sample(),
      } satisfies RefundTransactionOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.RefundTransaction,
        TRANSACTIONID: options.transactionId,
        MSGSUBID: options.idempotencyKey,
        REFUNDTYPE: options.refundType,
        AMT: (options.amount / 100).toFixed(2),
      };

      const response = NVPRefundTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.refundTransaction(options);

      expect(result).toMatchObject(response);
    });

    it('runs full refund without amount', async () => {
      const options = {
        transactionId: faker.string.sample(),
        refundType: RefundType.Full,
        idempotencyKey: faker.string.sample(),
      } satisfies RefundTransactionOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.RefundTransaction,
        TRANSACTIONID: options.transactionId,
        MSGSUBID: options.idempotencyKey,
        REFUNDTYPE: options.refundType,
      };

      const response = NVPRefundTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.refundTransaction(options);

      expect(result).toMatchObject(response);
    });
  });

  describe('baUpdate', () => {
    it('calls bill agreement update without cancel', async () => {
      const options = {
        billingAgreementId: faker.string.sample(),
      } satisfies BAUpdateOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.BillAgreementUpdate,
        REFERENCEID: options.billingAgreementId,
      };

      const response = NVPBAUpdateTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.baUpdate(options);

      expect(result).toMatchObject(response);
    });

    it('calls bill agreement update with cancel', async () => {
      const options = {
        billingAgreementId: faker.string.sample(),
        cancel: true,
      } satisfies BAUpdateOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.BillAgreementUpdate,
        REFERENCEID: options.billingAgreementId,
        BILLINGAGREEMENTSTATUS: 'Canceled',
      };

      const response = NVPBAUpdateTransactionResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.baUpdate(options);

      expect(result).toMatchObject(response);
    });
  });

  describe('ipnVerify', () => {
    it('calls API with valid message', async () => {
      const message = faker.string.alphanumeric();
      const verifyPayload = 'cmd=_notify-validate&' + message;
      nock(PAYPAL_SANDBOX_IPN_BASE)
        .post(PAYPAL_IPN_ROUTE, verifyPayload)
        .reply(200, 'VERIFIED');
      const result = await client.ipnVerify(message);
      expect(result).toEqual('VERIFIED');
    });
  });

  describe('transactionSearch', () => {
    it('calls API with valid message', async () => {
      const options = {
        startDate: faker.date.past(),
        endDate: faker.date.recent(),
        email: faker.internet.email(),
        invoice: faker.string.sample(),
        transactionId: faker.string.sample(),
      } satisfies TransactionSearchOptions;

      const expectedPayload = {
        ...commonPayloadArgs,
        METHOD: PaypalMethods.TransactionSearch,
        STARTDATE: toIsoString(options.startDate),
        ENDDATE: toIsoString(options.endDate),
        EMAIL: options.email,
        INVNUM: options.invoice,
        TRANSACTIONID: options.transactionId,
      };

      const response = NVPTransactionSearchResponseFactory();

      nock(PAYPAL_SANDBOX_BASE)
        .post(PAYPAL_NVP_ROUTE, objectToNVP(expectedPayload))
        .reply(200, objectToNVP(response));

      const result = await client.transactionSearch(options);

      expect(result).toMatchObject(response);
    });
  });
});

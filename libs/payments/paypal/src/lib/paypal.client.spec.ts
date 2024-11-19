/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import nock from 'nock';

import { faker } from '@faker-js/faker';

import {
  PAYPAL_IPN_ROUTE,
  PAYPAL_NVP_ROUTE,
  PAYPAL_SANDBOX_BASE,
  PAYPAL_SANDBOX_IPN_BASE,
  PAYPAL_VERSION,
  PLACEHOLDER_URL,
} from './constants';
import { PayPalClient } from './paypal.client';
import { PayPalClientError, PayPalNVPError } from './paypal.error';
import {
  ChargeOptionsFactory,
  ChargeResponseFactory,
  NVPBAUpdateTransactionResponseFactory,
  NVPDoReferenceTransactionResponseFactory,
  NVPErrorFactory,
  NVPErrorResponseFactory,
  NVPRefundTransactionResponseFactory,
  NVPResponseFactory,
  NVPSetExpressCheckoutResponseFactory,
  NVPTransactionSearchResponseFactory,
} from './factories';
import {
  BAUpdateOptions,
  DoReferenceTransactionOptions,
  NVPErrorSeverity,
  PaypalMethods,
  RefundTransactionOptions,
  RefundType,
  TransactionSearchOptions,
} from './paypal.client.types';
import { objectToNVP, toIsoString } from './util';
import { Test } from '@nestjs/testing';
import { MockPaypalClientConfigProvider } from './paypal.client.config';
import { ChargeResponse } from './paypal.types';

describe('PayPalClient', () => {
  const commonPayloadArgs = {
    USER: 'user',
    PWD: 'pwd',
    SIGNATURE: 'sig',
    VERSION: PAYPAL_VERSION,
  };

  let paypalClient: PayPalClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MockPaypalClientConfigProvider, PayPalClient],
    }).compile();

    paypalClient = module.get(PayPalClient);
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

      await paypalClient.setExpressCheckout({
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
        await paypalClient.setExpressCheckout({
          currencyCode,
        });
        fail('Request should have thrown an error.');
      } catch (err) {
        expect(err).toBeInstanceOf(PayPalClientError);
        expect(err.name).toEqual('PayPalClientError');
        expect(err.raw).toMatch(/ACK=Failure/);
        expect(err.data.ACK).toEqual('Failure');
        expect(typeof err.getPrimaryError().errorCode).toBe('number');
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

      const result = await paypalClient.createBillingAgreement({
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

      const result = await paypalClient.doReferenceTransaction(options);

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

      const result = await paypalClient.doReferenceTransaction(options);

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

      const result = await paypalClient.refundTransaction(options);

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

      const result = await paypalClient.refundTransaction(options);

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

      const result = await paypalClient.baUpdate(options);

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

      const result = await paypalClient.baUpdate(options);

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
      const result = await paypalClient.ipnVerify(message);
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

      const result = await paypalClient.transactionSearch(options);

      expect(result).toMatchObject(response);
    });
  });

  describe('getListOfPayPalNVPErrors', () => {
    const raw = faker.word.words();

    it('returns a general error message when no errors are provided', () => {
      const data = NVPErrorResponseFactory({ L: undefined });
      const nvpError = new PayPalNVPError(raw, data, {
        message:
          'PayPal NVP returned a non-success ACK. See "this.raw" or "this.data" for more details.',
      });
      const actual = PayPalClient.getListOfPayPalNVPErrors(raw, data);
      const expected = [nvpError];
      expect(actual).toStrictEqual(expected);
    });

    it('handles multiple errors', () => {
      const err1 = NVPErrorFactory();
      const err2 = NVPErrorFactory();
      const data = NVPErrorResponseFactory({
        L: [err1, err2],
      });
      const actual = PayPalClient.getListOfPayPalNVPErrors(raw, data);
      const expected = [
        new PayPalNVPError(raw, data, {
          message: err1.LONGMESSAGE,
          errorCode: parseInt(err1.ERRORCODE),
        }),
        new PayPalNVPError(raw, data, {
          message: err2.LONGMESSAGE,
          errorCode: parseInt(err2.ERRORCODE),
        }),
      ];
      expect(actual).toStrictEqual(expected);
    });

    it('prioritizes errors over warnings', () => {
      const err1 = NVPErrorFactory({
        SEVERITYCODE: NVPErrorSeverity.Warning,
      });
      const err2 = NVPErrorFactory();
      const data = NVPErrorResponseFactory({
        L: [err1, err2],
      });
      const actual = PayPalClient.getListOfPayPalNVPErrors(raw, data);
      const expected = [
        new PayPalNVPError(raw, data, {
          message: err2.LONGMESSAGE,
          errorCode: parseInt(err2.ERRORCODE),
        }),
        new PayPalNVPError(raw, data, {
          message: err1.LONGMESSAGE,
          errorCode: parseInt(err1.ERRORCODE),
        }),
      ];
      // In this case, the order of the array of errors matters.
      expect(actual).toMatchObject<PayPalNVPError[]>(expected);
    });
  });

  describe('chargeCustomer', () => {
    it('calls API with valid message', async () => {
      const mockOptions = ChargeOptionsFactory();
      const mockReferenceTransactionResponse =
        NVPDoReferenceTransactionResponseFactory();
      const mockChargeResponse = ChargeResponseFactory({
        amount: mockReferenceTransactionResponse.AMT,
        currencyCode: mockReferenceTransactionResponse.CURRENCYCODE,
        avsCode: mockReferenceTransactionResponse.AVSCODE,
        cvv2Match: mockReferenceTransactionResponse.CVV2MATCH,
        orderTime: mockReferenceTransactionResponse.ORDERTIME,
        parentTransactionId:
          mockReferenceTransactionResponse.PARENTTRANSACTIONID,
        paymentStatus:
          mockReferenceTransactionResponse.PAYMENTSTATUS as ChargeResponse['paymentStatus'],
        paymentType: mockReferenceTransactionResponse.PAYMENTTYPE,
        pendingReason:
          mockReferenceTransactionResponse.PENDINGREASON as ChargeResponse['pendingReason'],
        reasonCode:
          mockReferenceTransactionResponse.REASONCODE as ChargeResponse['reasonCode'],
        transactionId: mockReferenceTransactionResponse.TRANSACTIONID,
        transactionType:
          mockReferenceTransactionResponse.TRANSACTIONTYPE as ChargeResponse['transactionType'],
      });
      jest
        .spyOn(paypalClient, 'doReferenceTransaction')
        .mockResolvedValue(mockReferenceTransactionResponse);

      const result = await paypalClient.chargeCustomer(mockOptions);

      expect(result).toMatchObject(mockChargeResponse);
    });
  });
});

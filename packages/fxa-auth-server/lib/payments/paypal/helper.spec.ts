/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/paypal.js (Mocha → Jest). */

import sinon from 'sinon';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import {
  PayPalClient,
  PayPalClientError,
  PayPalNVPError,
  RefundType,
  objectToNVP,
  nvpToObject,
  PaypalNVPAckOptions,
  NVPErrorSeverity,
} from '@fxa/payments/paypal';
import type { NVPErrorResponse } from '@fxa/payments/paypal';
import { PayPalHelper, RefusedError } from '.';
import { AppError as error } from '@fxa/accounts/errors';
import { StripeHelper } from '../stripe';
import { CurrencyHelper } from '../currencies';
import {
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_APP_ERRORS,
  PAYPAL_RETRY_ERRORS,
} from './error-codes';
import { RefundError } from './helper';

const { mockLog } = require('../../../test/mocks');

const successfulSetExpressCheckoutResponse = require('../../../test/local/payments/fixtures/paypal/set_express_checkout_success.json');
const successfulDoReferenceTransactionResponse = require('../../../test/local/payments/fixtures/paypal/do_reference_transaction_success.json');
const successfulRefundTransactionResponse = require('../../../test/local/payments/fixtures/paypal/refund_transaction_success.json');
const failedDoReferenceTransactionResponse = require('../../../test/local/payments/fixtures/paypal/do_reference_transaction_failure.json');
const successfulBAUpdateResponse = require('../../../test/local/payments/fixtures/paypal/ba_update_success.json');
const searchTransactionResponse = require('../../../test/local/payments/fixtures/paypal/transaction_search_success.json');
const eventCustomerSourceExpiring = require('../../../test/local/payments/fixtures/stripe/event_customer_source_expiring.json');
const sampleIpnMessage = require('../../../test/local/payments/fixtures/paypal/sample_ipn_message.json');

function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('PayPalHelper', () => {
  let paypalHelper: any;
  let mockStripeHelper: any;

  const chargeId = 'ch_1GVm24BVqmGyQTMaUhRAfUmA';
  const sourceId = eventCustomerSourceExpiring.data.object.id;
  const mockInvoice = {
    id: 'inv_0000000000',
    number: '1234567',
    charge: chargeId,
    default_source: { id: sourceId },
    total: 1234,
    currency: 'usd',
    period_end: 1587426018,
    customer_shipping: { address: { country: 'US' } },
    lines: {
      data: [
        {
          period: { end: 1590018018 },
        },
      ],
    },
  };

  const mockCustomer: any = {
    invoice_settings: {
      default_payment_method: {},
    },
    metadata: {
      userid: 'test1234',
    },
  };

  const mockConfig = {
    currenciesToCountries: { ZAR: ['AS', 'CA'] },
  };

  beforeEach(() => {
    // Make StripeHelper
    mockStripeHelper = {};
    Container.set(StripeHelper, mockStripeHelper);
    // Make StatsD
    const statsd = { increment: sinon.spy(), timing: sinon.spy() };
    Container.set(StatsD, statsd);
    // Make PayPalClient
    const paypalClient = new PayPalClient(
      {
        user: 'user',
        sandbox: true,
        pwd: 'pwd',
        signature: 'sig',
      },
      statsd as any
    );
    Container.set(PayPalClient, paypalClient);
    // Make currencyHelper
    const currencyHelper = new CurrencyHelper(mockConfig as any);
    Container.set(CurrencyHelper, currencyHelper);
    // Make PayPalHelper
    paypalHelper = new PayPalHelper({ log: mockLog });
  });

  afterEach(() => {
    Container.reset();
  });

  describe('constructor', () => {
    it('sets client, statsd, logger, and currencyHelper', () => {
      const statsd = { increment: sinon.spy(), timing: sinon.spy() };
      const paypalClient = new PayPalClient(
        {
          user: 'user',
          sandbox: true,
          pwd: 'pwd',
          signature: 'sig',
        },
        statsd as any
      );
      Container.set(PayPalClient, paypalClient);
      Container.set(StatsD, statsd);

      const pph: any = new PayPalHelper({ log: mockLog, config: mockConfig });
      expect(pph.client).toBe(paypalClient);
      expect(pph.log).toBe(mockLog);
      expect(pph.metrics).toBe(statsd);

      const expectedCurrencyHelper = new CurrencyHelper(mockConfig as any);
      expect(pph.currencyHelper).toEqual(expectedCurrencyHelper);
    });
  });

  describe('generateIdempotencyKey', () => {
    const invoiceId = 'inv_000';
    const paymentAttempt = 0;

    it('successfully creates an idempotency key', async () => {
      const result = paypalHelper.generateIdempotencyKey(
        invoiceId,
        paymentAttempt
      );
      expect(result).toEqual(invoiceId + '-' + paymentAttempt);
    });
  });

  describe('parseIdempotencyKey', () => {
    const invoiceId = 'inv_000';
    const paymentAttempt = 0;

    it('successfully parses an idempotency key', async () => {
      const result = paypalHelper.parseIdempotencyKey(
        invoiceId + '-' + paymentAttempt
      );
      expect(result).toEqual({
        invoiceId,
        paymentAttempt: paymentAttempt + 1,
      });
    });
  });

  describe('getCheckoutToken', () => {
    const validOptions = { currencyCode: 'USD' };

    it('it returns the token from doRequest', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const token = await paypalHelper.getCheckoutToken(validOptions);
      expect(token).toEqual(successfulSetExpressCheckoutResponse.TOKEN);
    });

    it('if doRequest unsuccessful, throws an error', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {} as NVPErrorResponse,
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {} as NVPErrorResponse)
      );
      await expect(
        paypalHelper.getCheckoutToken(validOptions)
      ).rejects.toThrow(PayPalClientError);
    });

    it('calls setExpressCheckout with passed options', async () => {
      paypalHelper.client.setExpressCheckout = sinon.fake.resolves(
        successfulSetExpressCheckoutResponse
      );
      const currencyCode = 'EUR';
      await paypalHelper.getCheckoutToken({ currencyCode });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.setExpressCheckout,
        { currencyCode }
      );
    });
  });

  describe('createBillingAgreement', () => {
    const validOptions = {
      token: 'insert_token_value_here',
    };

    const expectedResponse = {
      BILLINGAGREEMENTID: 'B-7FB31251F28061234',
      ACK: 'Success',
    };

    it('calls createBillingAgreement with passed options', async () => {
      paypalHelper.client.createBillingAgreement =
        sinon.fake.resolves(expectedResponse);
      const response = await paypalHelper.createBillingAgreement(validOptions);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.createBillingAgreement,
        validOptions
      );
      expect(response).toEqual('B-7FB31251F28061234');
    });
  });

  describe('chargeCustomer', () => {
    const validOptions = {
      amountInCents: 1099,
      billingAgreementId: 'B-12345',
      currencyCode: 'usd',
      countryCode: 'US',
      invoiceNumber: 'in_asdf',
      idempotencyKey: ' in_asdf-0',
    };

    it('calls doReferenceTransaction with options and amount converted to string', async () => {
      paypalHelper.client.doReferenceTransaction = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      await paypalHelper.chargeCustomer(validOptions);
      const expectedOptions = {
        amount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            validOptions.amountInCents
          ),
        billingAgreementId: validOptions.billingAgreementId,
        invoiceNumber: validOptions.invoiceNumber,
        idempotencyKey: validOptions.idempotencyKey,
        currencyCode: validOptions.currencyCode,
        countryCode: validOptions.countryCode,
      };
      expect(
        paypalHelper.client.doReferenceTransaction.calledOnceWith(
          expectedOptions
        )
      ).toBeTruthy();
    });

    it('it returns the data from doRequest', async () => {
      const expectedResponse = {
        amount: '1555555.99',
        avsCode: '',
        cvv2Match: '',
        orderTime: '2021-01-25T17:02:15Z',
        parentTransactionId: 'PAYID-MAHPTFI9KG0531222783101E',
        paymentStatus: 'Completed',
        paymentType: 'instant',
        pendingReason: 'None',
        reasonCode: 'None',
        transactionId: '51E835834L664664K',
        transactionType: 'merchtpmt',
      };
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      const response = await paypalHelper.chargeCustomer(validOptions);
      expect(response).toEqual(expectedResponse);
    });

    it('calls doReferenceTransaction with taxAmount option and taxAmount converted to string', async () => {
      const options = deepCopy(validOptions);
      options.taxAmountInCents = '500';
      paypalHelper.client.doReferenceTransaction = sinon.fake.resolves(
        successfulDoReferenceTransactionResponse
      );
      await paypalHelper.chargeCustomer(options);
      const expectedOptions = {
        amount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            options.amountInCents
          ),
        billingAgreementId: options.billingAgreementId,
        invoiceNumber: options.invoiceNumber,
        idempotencyKey: options.idempotencyKey,
        currencyCode: options.currencyCode,
        countryCode: options.countryCode,
        taxAmount:
          paypalHelper.currencyHelper.getPayPalAmountStringFromAmountInCents(
            options.taxAmountInCents
          ),
      };
      expect(
        paypalHelper.client.doReferenceTransaction.calledOnceWith(
          expectedOptions
        )
      ).toBeTruthy();
    });

    it('if doRequest unsuccessful, throws an error', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {} as NVPErrorResponse,
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {} as NVPErrorResponse)
      );
      await expect(
        paypalHelper.chargeCustomer(validOptions)
      ).rejects.toThrow(PayPalClientError);
    });
  });

  describe('refundTransaction', () => {
    const defaultData = {
      MSGSUBID: 'in_asdf',
      TRANSACTIONID: '9EG80664Y1384290G',
      REFUNDTYPE: 'Full',
    };

    it('refunds entire transaction', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulRefundTransactionResponse
      );
      const response = await paypalHelper.refundTransaction({
        idempotencyKey: defaultData.MSGSUBID,
        transactionId: defaultData.TRANSACTIONID,
        refundType: RefundType.Full,
      });
      expect(response).toEqual({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.doRequest,
        'RefundTransaction',
        defaultData
      );
    });

    it('refunds partial transaction', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulRefundTransactionResponse
      );
      const response = await paypalHelper.refundTransaction({
        idempotencyKey: defaultData.MSGSUBID,
        transactionId: defaultData.TRANSACTIONID,
        refundType: RefundType.Partial,
        amount: 123,
      });
      expect(response).toEqual({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.doRequest,
        'RefundTransaction',
        { ...defaultData, REFUNDTYPE: 'Partial', AMT: '1.23' }
      );
    });

    it('throws a RefusedError when a refund is refused', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {
          ACK: PaypalNVPAckOptions.Failure,
          L: [
            {
              ERRORCODE: '10009',
              SHORTMESSAGE: 'Transaction refused',
              LONGMESSAGE: 'This transaction already has a chargeback filed',
              SEVERITYCODE: NVPErrorSeverity.Error,
            },
          ],
        } as NVPErrorResponse,
        {
          message: 'This transaction already has a chargeback filed',
          errorCode: 10009,
        }
      );
      paypalHelper.client.refundTransaction = sinon.fake.rejects(
        new PayPalClientError([nvpError], 'hi', {
          ACK: PaypalNVPAckOptions.Failure,
          L: [
            {
              ERRORCODE: '10009',
              SHORTMESSAGE: 'Transaction refused',
              LONGMESSAGE: 'This transaction already has a chargeback filed',
              SEVERITYCODE: NVPErrorSeverity.Error,
            },
          ],
        } as NVPErrorResponse)
      );
      try {
        await paypalHelper.refundTransaction({
          idempotencyKey: defaultData.MSGSUBID,
          transactionId: defaultData.TRANSACTIONID,
          refundType: RefundType.Full,
        });
        throw new Error('Expected to throw');
      } catch (err: any) {
        expect(err).toBeInstanceOf(RefusedError);
        expect(err.message).toBe('Transaction refused');
        expect(err.errorCode).toBe('10009');
      }
    });
  });

  describe('issueRefund', () => {
    const invoice = { id: 'inv_025-abc-3' };
    const transactionId = '9EG80664Y1384290G';

    it('successfully refunds completed transaction', async () => {
      mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId =
        sinon.fake.resolves({});
      paypalHelper.refundTransaction = sinon.fake.resolves({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: successfulRefundTransactionResponse.REFUNDSTATUS,
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      const result = await paypalHelper.issueRefund(
        invoice,
        transactionId,
        RefundType.Full
      );

      expect(result).toBeUndefined();
      sinon.assert.calledOnceWithExactly(paypalHelper.refundTransaction, {
        idempotencyKey: invoice.id,
        transactionId: transactionId,
        refundType: RefundType.Full,
        amount: undefined,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId,
        invoice,
        successfulRefundTransactionResponse.REFUNDTRANSACTIONID
      );
    });

    it('unsuccessfully refunds completed transaction', async () => {
      mockStripeHelper.updateInvoiceWithPaypalRefundTransactionId =
        sinon.fake.resolves({});
      paypalHelper.refundTransaction = sinon.fake.resolves({
        pendingReason: successfulRefundTransactionResponse.PENDINGREASON,
        refundStatus: 'None',
        refundTransactionId:
          successfulRefundTransactionResponse.REFUNDTRANSACTIONID,
      });
      paypalHelper.log = { error: sinon.fake.returns({}) };

      await expect(
        paypalHelper.issueRefund(invoice, transactionId, RefundType.Full)
      ).rejects.toEqual(
        error.internalValidationError('issueRefund', {
          message: 'PayPal refund transaction unsuccessful',
        })
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.refundTransaction, {
        idempotencyKey: invoice.id,
        transactionId: transactionId,
        refundType: RefundType.Full,
        amount: undefined,
      });
    });
  });

  describe('refundInvoices', () => {
    const validInvoice = {
      id: 'id1',
      collection_method: 'send_invoice',
      created: Date.now(),
    };
    beforeEach(() => {
      paypalHelper.log = {
        debug: sinon.fake.returns({}),
        info: sinon.fake.returns({}),
        error: sinon.fake.returns({}),
      };
      paypalHelper.refundInvoice = sinon.fake.resolves(undefined);
    });
    it('returns empty array if no payPalInvoices exist', async () => {
      await paypalHelper.refundInvoices([{ collection_method: 'notpaypal' }]);
      sinon.assert.notCalled(paypalHelper.refundInvoice);
    });

    it('returns on empty array input', async () => {
      await paypalHelper.refundInvoices([]);
      sinon.assert.notCalled(paypalHelper.refundInvoice);
    });

    it('calls refundInvoice for each invoice', async () => {
      await paypalHelper.refundInvoices([validInvoice]);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.refundInvoice,
        validInvoice
      );
    });
  });

  describe('refundInvoice', () => {
    const validInvoice = {
      id: 'id1',
      collection_method: 'send_invoice',
      created: Date.now(),
    };
    beforeEach(() => {
      paypalHelper.log = {
        debug: sinon.fake.returns({}),
        info: sinon.fake.returns({}),
        error: sinon.fake.returns({}),
      };
      paypalHelper.issueRefund = sinon.fake.resolves(undefined);
    });

    it('does not refund when created date older than 180 days', async () => {
      const expectedErrorMessage =
        'Invoice created outside of maximum refund period';
      await expect(
        paypalHelper.refundInvoice({
          id: validInvoice.id,
          collection_method: 'send_invoice',
          created: Math.floor(
            new Date().setDate(new Date().getDate() - 200) / 1000
          ),
        })
      ).rejects.toThrow(expectedErrorMessage);
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error if transactionId is missing', async () => {
      const expectedErrorMessage = 'Missing transactionId';
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns(undefined);
      await expect(
        paypalHelper.refundInvoice(validInvoice)
      ).rejects.toThrow(expectedErrorMessage);
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error if refundTransactionId exists', async () => {
      const expectedErrorMessage = 'Invoice already refunded with PayPal';
      mockStripeHelper.getInvoicePaypalTransactionId = sinon.fake.returns(123);
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(123);
      await expect(
        paypalHelper.refundInvoice(validInvoice)
      ).rejects.toThrow(expectedErrorMessage);
      sinon.assert.calledOnce(mockStripeHelper.getInvoicePaypalTransactionId);
      sinon.assert.calledOnce(
        mockStripeHelper.getInvoicePaypalRefundTransactionId
      );
      sinon.assert.notCalled(paypalHelper.issueRefund);
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefundError)
            .and(sinon.match.has('message', expectedErrorMessage)),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('throws error from issueRefund', async () => {
      const expectedError = new RefusedError('Helper error', 'Helper error details', '10009');
      mockStripeHelper.getInvoicePaypalTransactionId = sinon.fake.returns(123);
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);
      paypalHelper.issueRefund = sinon.fake.rejects(expectedError);
      await expect(
        paypalHelper.refundInvoice(validInvoice)
      ).rejects.toThrow('Helper error');
      sinon.assert.calledWithExactly(
        paypalHelper.log.error,
        'PayPalHelper.refundInvoice',
        {
          error: sinon.match
            .instanceOf(RefusedError)
            .and(sinon.match.has('message', 'Helper error')),
          invoiceId: validInvoice.id,
        }
      );
    });

    it('refunds successfully', async () => {
      const expectedInvoiceResults = {
        invoiceId: validInvoice.id,
        priceId: 'priceId1',
        total: 400,
        currency: 'usd',
      };
      const invoice = {
        ...validInvoice,
        ...expectedInvoiceResults,
      };
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns('123');
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);
      mockStripeHelper.getPriceIdFromInvoice = sinon.fake.returns(
        expectedInvoiceResults.priceId
      );
      await paypalHelper.refundInvoice(invoice);
      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        '123',
        RefundType.Full,
        undefined
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.log.info,
        'refundInvoice',
        expectedInvoiceResults
      );
      sinon.assert.notCalled(paypalHelper.log.error);
    });

    it('issues partial refund successfully', async () => {
      const invoice = {
        ...validInvoice,
        id: 'inv_partial',
        amount_paid: 1000,
      };
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns('123');
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);
      mockStripeHelper.getPriceIdFromInvoice = sinon.fake.returns('priceId1');

      await paypalHelper.refundInvoice(invoice, {
        refundType: RefundType.Partial,
        amount: 500,
      });

      sinon.assert.calledOnceWithExactly(
        paypalHelper.issueRefund,
        invoice,
        '123',
        RefundType.Partial,
        500
      );
      sinon.assert.notCalled(paypalHelper.log.error);
    });

    it('throws error if partial refund amount is not less than amount paid', async () => {
      const invoice = {
        ...validInvoice,
        amount_paid: 1000,
        amount_due: 1000,
      };
      const expectedErrorMessage =
        'Partial refunds must be less than the amount due on the invoice';
      mockStripeHelper.getInvoicePaypalTransactionId =
        sinon.fake.returns('123');
      mockStripeHelper.getInvoicePaypalRefundTransactionId =
        sinon.fake.returns(undefined);

      await expect(
        paypalHelper.refundInvoice(invoice, {
          refundType: RefundType.Partial,
          amount: 1000,
        })
      ).rejects.toThrow(expectedErrorMessage);
      sinon.assert.notCalled(paypalHelper.issueRefund);
    });
  });

  describe('cancelBillingAgreement', () => {
    it('cancels an agreement', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        successfulBAUpdateResponse
      );
      const response = await paypalHelper.cancelBillingAgreement('test');
      expect(response).toBeNull();
    });

    it('ignores paypal client errors', async () => {
      const nvpError = new PayPalNVPError(
        'Fake',
        {} as NVPErrorResponse,
        { message: 'oh no', errorCode: 123 }
      );
      paypalHelper.client.doRequest = sinon.fake.throws(
        new PayPalClientError([nvpError], 'hi', {} as NVPErrorResponse)
      );
      const response = await paypalHelper.cancelBillingAgreement('test');
      expect(response).toBeNull();
    });
  });

  describe('searchTransactions', () => {
    it('returns the data from doRequest', async () => {
      paypalHelper.client.doRequest = sinon.fake.resolves(
        searchTransactionResponse
      );
      const expectedResponse = [
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:38:28Z',
          transactionId: '2TA09271XC591854A',
          type: 'Payment',
        },
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:38:23Z',
          transactionId: '7WW53923D67853628',
          type: 'Payment',
        },
        {
          amount: '5.99',
          currencyCode: 'USD',
          email: 'sb-ufoot5037790@personal.example.com',
          feeAmount: '-0.47',
          name: 'John Doe',
          netAmount: '5.52',
          status: 'Under Review',
          timestamp: '2021-02-11T17:31:05Z',
          transactionId: '22N88933SF2815829',
          type: 'Payment',
        },
      ];
      const response = await paypalHelper.searchTransactions({
        startDate: new Date(),
        invoice: 'inv-001',
      });
      expect(response).toEqual(expectedResponse);
    });
  });

  describe('verifyIpnMessage', () => {
    it('validates IPN message', async () => {
      paypalHelper.client.ipnVerify = sinon.fake.resolves('VERIFIED');
      const response = await paypalHelper.verifyIpnMessage(
        sampleIpnMessage.message
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.ipnVerify,
        sampleIpnMessage.message
      );
      expect(response).toBe(true);
    });

    it('invalidates IPN message', async () => {
      paypalHelper.client.ipnVerify = sinon.fake.resolves('INVALID');
      const response = await paypalHelper.verifyIpnMessage('invalid=True');
      sinon.assert.calledOnceWithExactly(
        paypalHelper.client.ipnVerify,
        'invalid=True'
      );
      expect(response).toBe(false);
    });
  });

  describe('extractIpnMessage', () => {
    it('extracts IPN message from payload', () => {
      const msg = paypalHelper.extractIpnMessage(sampleIpnMessage.message);
      expect(msg).toEqual({
        address_city: 'San Jose',
        address_country: 'United States',
        address_country_code: 'US',
        address_name: 'Test User',
        address_state: 'CA',
        address_status: 'confirmed',
        address_street: '1 Main St',
        address_zip: '95131',
        charset: 'windows-1252',
        custom: '',
        first_name: 'Test',
        handling_amount: '0.00',
        item_name: '',
        item_number: '',
        last_name: 'User',
        mc_currency: 'USD',
        mc_fee: '0.88',
        mc_gross: '19.95',
        notify_version: '2.6',
        payer_email: 'gpmac_1231902590_per@paypal.com',
        payer_id: 'LPLWNMTBWMFAY',
        payer_status: 'verified',
        payment_date: '20:12:59 Jan 13, 2009 PST',
        payment_fee: '0.88',
        payment_gross: '19.95',
        payment_status: 'Completed',
        payment_type: 'instant',
        protection_eligibility: 'Eligible',
        quantity: '1',
        receiver_email: 'gpmac_1231902686_biz@paypal.com',
        receiver_id: 'S8XGHLYDW9T3S',
        residence_country: 'US',
        shipping: '0.00',
        tax: '0.00',
        test_ipn: '1',
        transaction_subject: '',
        txn_id: '61E67681CH3238416',
        txn_type: 'express_checkout',
        verify_sign: 'AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf',
      });
    });
  });

  describe('conditionallyRemoveBillingAgreement', () => {
    it('returns false with no billing agreement found', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(undefined);
      const result =
        await paypalHelper.conditionallyRemoveBillingAgreement(mockCustomer);
      expect(result).toBe(false);
    });

    it('returns false with no paypal subscriptions', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns('ba-test');
      mockCustomer.subscriptions = {
        data: [{ status: 'active', collection_method: 'send_invoice' }],
      };
      const result =
        await paypalHelper.conditionallyRemoveBillingAgreement(mockCustomer);
      expect(result).toBe(false);
    });

    it('returns true if it cancelled and removed the billing agreement', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns('ba-test');
      mockCustomer.subscriptions = { data: [] };
      paypalHelper.cancelBillingAgreement = sinon.fake.resolves({});
      mockStripeHelper.removeCustomerPaypalAgreement = sinon.fake.resolves({});
      const result =
        await paypalHelper.conditionallyRemoveBillingAgreement(mockCustomer);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        paypalHelper.cancelBillingAgreement,
        'ba-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeCustomerPaypalAgreement,
        mockCustomer.metadata.userid,
        mockCustomer.id,
        'ba-test'
      );
    });
  });

  describe('updateStripeNameFromBA', () => {
    it('updates the name on the stripe customer', async () => {
      mockStripeHelper.updateCustomerBillingAddress = sinon.fake.resolves({});
      paypalHelper.agreementDetails = sinon.fake.resolves({
        firstName: 'Test',
        lastName: 'User',
      });
      const result = await paypalHelper.updateStripeNameFromBA(
        mockCustomer,
        'mock-agreement-id'
      );
      expect(result).toEqual({});
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateCustomerBillingAddress,
        { customerId: mockCustomer.id, name: 'Test User' }
      );
      sinon.assert.calledOnce(paypalHelper.metrics.increment);
    });

    it('throws error if billing agreement status is cancelled', async () => {
      mockStripeHelper.updateCustomerBillingAddress = sinon.fake.resolves({});
      paypalHelper.agreementDetails = sinon.fake.resolves({
        firstName: 'Test',
        lastName: 'User',
        status: 'cancelled',
      });

      await expect(
        paypalHelper.updateStripeNameFromBA(mockCustomer, 'mock-agreement-id')
      ).rejects.toEqual(
        error.internalValidationError('updateStripeNameFromBA', {
          message: 'Billing agreement was cancelled.',
        })
      );
    });
  });

  describe('processZeroInvoice', () => {
    it('finalize invoice that with no amount set to zero', async () => {
      mockStripeHelper.finalizeInvoice = sinon.fake.resolves({});
      mockStripeHelper.payInvoiceOutOfBand = sinon.fake.resolves({});
      const response = await paypalHelper.processZeroInvoice(mockInvoice);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.finalizeInvoice,
        mockInvoice
      );
      expect(response).toEqual({});
    });
  });

  describe('processInvoice', () => {
    const agreementId = 'agreement-id';
    const paymentAttempts = 0;
    const transactionId = 'transaction-id';

    beforeEach(() => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(agreementId);
      mockStripeHelper.getPaymentAttempts = sinon.fake.returns(paymentAttempts);
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Completed',
        transactionId,
      });
      mockStripeHelper.updateInvoiceWithPaypalTransactionId =
        sinon.fake.resolves({ transactionId });
      mockStripeHelper.payInvoiceOutOfBand = sinon.fake.resolves({});
      mockStripeHelper.updatePaymentAttempts = sinon.fake.resolves({});
    });

    it('runs a open invoice successfully', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
        currency: 'eur',
      };

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        validInvoice,
        transactionId
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.payInvoiceOutOfBand,
        validInvoice
      );
      expect(response).toEqual([{ transactionId }, {}]);
    });

    it('runs a open invoice successfully with tax added', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
        currency: 'eur',
        tax: 500,
      };

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
        ipaddress: '127.0.0.1',
      });
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
        ipaddress: '127.0.0.1',
        taxAmountInCents: validInvoice.tax,
      });
      expect(response).toEqual([{ transactionId }, {}]);
    });

    it('runs a draft invoice successfully', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'draft',
        amount_due: 499,
      };

      mockStripeHelper.finalizeInvoice = sinon.fake.resolves({});

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.finalizeInvoice,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        validInvoice,
        transactionId
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.payInvoiceOutOfBand,
        validInvoice
      );
      expect(response).toEqual([{ transactionId }, {}]);
    });

    it('runs invoice payment was Pending or In-Progress', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Pending',
        transactionId,
      });

      const response = await paypalHelper.processInvoice({
        customer: mockCustomer,
        invoice: validInvoice,
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      expect(response).toBeUndefined();
    });

    it('throws error on invoice payment responded with Denied, Failed, Voided, or Expired', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus: 'Denied',
        transactionId,
      });

      await expect(
        paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        })
      ).rejects.toEqual(error.paymentFailed());
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updatePaymentAttempts,
        validInvoice
      );
    });

    it('logs and throws error on invoice payment responded with unexpected PayPal payment status', async () => {
      const paymentStatus = 'Unexpected';
      const validInvoice = {
        ...mockInvoice,
        status: 'open',
        amount_due: 499,
      };
      paypalHelper.log = { error: sinon.fake.returns({}) };
      paypalHelper.chargeCustomer = sinon.fake.resolves({
        paymentStatus,
        transactionId,
      });

      await expect(
        paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        })
      ).rejects.toEqual(
        error.internalValidationError('processInvoice', {
          message: 'Unexpected PayPal transaction response.',
          transactionResponse: paymentStatus,
        })
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getPaymentAttempts,
        validInvoice
      );
      sinon.assert.calledOnceWithExactly(paypalHelper.chargeCustomer, {
        amountInCents: validInvoice.amount_due,
        billingAgreementId: agreementId,
        currencyCode: validInvoice.currency,
        countryCode: validInvoice.customer_shipping.address.country,
        invoiceNumber: validInvoice.id,
        idempotencyKey: paypalHelper.generateIdempotencyKey(
          validInvoice.id,
          paymentAttempts
        ),
      });
    });

    it('throws error for invoice without PayPal Billing Agreement ID', async () => {
      mockStripeHelper.getCustomerPaypalAgreement =
        sinon.fake.returns(undefined);

      await expect(
        paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: mockInvoice,
        })
      ).rejects.toEqual(
        error.internalValidationError('processInvoice', {
          message: 'Agreement ID not found.',
        })
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
    });

    it('throws error for invoice not on draft or open status', async () => {
      const validInvoice = {
        ...mockInvoice,
        status: 'paid',
      };

      await expect(
        paypalHelper.processInvoice({
          customer: mockCustomer,
          invoice: validInvoice,
        })
      ).rejects.toEqual(
        error.internalValidationError('processInvoice', {
          message: 'Invoice in invalid state.',
        })
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        mockCustomer
      );
    });

    describe('throw auth-server error', () => {
      let validInvoice: any;

      function makeFailedErr(errCode?: any) {
        const failedResponse = deepCopy(failedDoReferenceTransactionResponse);
        failedResponse.L_ERRORCODE0 = errCode;
        const rawString = objectToNVP(failedResponse);
        const parsedNvpObject = nvpToObject(rawString) as NVPErrorResponse;
        const nvpError = new PayPalNVPError(rawString, parsedNvpObject, {
          message: (parsedNvpObject.L as any[])[0].LONGMESSAGE,
          errorCode: parseInt((parsedNvpObject.L as any[])[0].ERRORCODE),
        });
        const throwErr = new PayPalClientError(
          [nvpError],
          rawString,
          parsedNvpObject
        );
        paypalHelper.chargeCustomer = sinon.fake.rejects(throwErr);
        return throwErr;
      }

      beforeEach(() => {
        validInvoice = {
          ...mockInvoice,
          status: 'open',
          amount_due: 499,
        };
        mockStripeHelper.getCustomerPaypalAgreement =
          sinon.fake.returns(agreementId);
        mockStripeHelper.getPaymentAttempts =
          sinon.fake.returns(paymentAttempts);
        mockStripeHelper.updatePaymentAttempts = sinon.fake.returns({});
        paypalHelper.log = { error: sinon.fake.returns({}) };
      });

      it('payment failed error on invalid billing agreement', async () => {
        const throwErr = makeFailedErr(PAYPAL_BILLING_AGREEMENT_INVALID);
        const failErr = error.paymentFailed();
        failErr.jse_cause = throwErr;
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          })
        ).rejects.toEqual(failErr);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('backend service failure on paypal app error', async () => {
        const throwErr = makeFailedErr(PAYPAL_APP_ERRORS[1]);
        const failErr = error.backendServiceFailure(
          'paypal',
          'transaction',
          {
            errData: throwErr.data,
            code: throwErr.getPrimaryError().errorCode,
          },
          throwErr
        );
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          })
        ).rejects.toEqual(failErr);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('retry error on paypal retryable error', async () => {
        makeFailedErr(PAYPAL_RETRY_ERRORS[1]);
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          })
        ).rejects.toEqual(error.serviceUnavailable());
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('backend error on no paypal error code', async () => {
        const throwErr = makeFailedErr();
        const failErr = error.backendServiceFailure(
          'paypal',
          'transaction',
          {
            errData: throwErr.data,
            message: 'Error with no errorCode is not expected',
          },
          throwErr
        );
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          })
        ).rejects.toEqual(failErr);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('internal validation error on unexpected paypal error code', async () => {
        const throwErr = makeFailedErr(992929291992392);
        const failErr = error.internalValidationError(
          'paypalCodeHandler',
          {
            code: 992929291992392,
            errData: throwErr.data,
          },
          throwErr
        );
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
          })
        ).rejects.toEqual(failErr);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });

      it('skips auth-server error on batchProcessing service failure on paypal app error', async () => {
        const throwErr = makeFailedErr(PAYPAL_APP_ERRORS[1]);
        await expect(
          paypalHelper.processInvoice({
            customer: mockCustomer,
            invoice: validInvoice,
            batchProcessing: true,
          })
        ).rejects.toEqual(throwErr);
        sinon.assert.calledOnceWithExactly(
          mockStripeHelper.getCustomerPaypalAgreement,
          mockCustomer
        );
      });
    });
  });
});

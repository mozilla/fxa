/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { PayPalHelper } from './helper';
import { PaypalProcessor } from './processor';
import { StripeHelper } from '../stripe';
import { AppError as error } from '@fxa/accounts/errors';
import {
  PayPalClientError,
  PayPalNVPError,
  nvpToObject,
  objectToNVP,
} from '@fxa/payments/paypal';
import type { NVPErrorResponse } from '@fxa/payments/paypal';
import {
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_SOURCE_ERRORS,
} from './error-codes';
import { CurrencyHelper } from '../currencies';
import { CapabilityService } from '../capability';

const { mockLog } = require('../../../test/mocks');

const paidInvoice = require('../../../test/local/payments/fixtures/stripe/invoice_paid.json');
const unpaidInvoice = require('../../../test/local/payments/fixtures/stripe/invoice_open.json');
const customer1 = require('../../../test/local/payments/fixtures/stripe/customer1.json');
const failedDoReferenceTransactionResponse = require('../../../test/local/payments/fixtures/paypal/do_reference_transaction_failure.json');

function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('PaypalProcessor', () => {
  let mockPaypalHelper: any;
  let mockStripeHelper: any;
  let processor: any;
  let mockConfig: any;
  let mockHandler: any;

  beforeEach(() => {
    mockConfig = {
      currenciesToCountries: { ZAR: ['AS', 'CA'] },
      subscriptions: {
        paypalNvpSigCredentials: { enabled: false },
        unsupportedLocations: [],
      },
    };
    mockStripeHelper = {};
    mockPaypalHelper = {};
    mockHandler = {};
    // Make currencyHelper
    const currencyHelper = new CurrencyHelper(mockConfig);
    Container.set(CurrencyHelper, currencyHelper);
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PayPalHelper, mockPaypalHelper);
    Container.set(CapabilityService, {});
    processor = new PaypalProcessor(
      mockLog,
      mockConfig,
      1,
      1,
      undefined as any,
      {} as any,
      {} as any
    );
    processor.webhookHandler = mockHandler;
  });

  afterEach(() => {
    Container.reset();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets log, graceDays, retryAttemps, stripe and paypalHelpers', () => {
      const paypalProcessor = new PaypalProcessor(
        mockLog,
        mockConfig,
        1,
        1,
        undefined as any,
        {} as any,
        {} as any
      );
      expect((paypalProcessor as any).log).toBe(mockLog);
      expect((paypalProcessor as any).graceDays).toEqual(1);
      expect((paypalProcessor as any).maxRetryAttempts).toEqual(1);
      expect((paypalProcessor as any).stripeHelper).toBe(mockStripeHelper);
      expect((paypalProcessor as any).paypalHelper).toBe(mockPaypalHelper);
    });
  });

  describe('inGracePeriod', () => {
    it('returns true within grace period', () => {
      const invoice = deepCopy(unpaidInvoice);
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - 20);
      invoice.created = hoursAgo.getTime() / 1000;
      const result = processor.inGracePeriod(invoice);
      expect(result).toBe(true);
    });

    it('returns false when outside of grace period', () => {
      const invoice = deepCopy(unpaidInvoice);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      invoice.created = twoDaysAgo.getTime() / 1000;
      const result = processor.inGracePeriod(invoice);
      expect(result).toBe(false);
    });
  });

  describe('cancelInvoiceSubscription', () => {
    it('marks invoice and cancels subscription', async () => {
      mockStripeHelper.markUncollectible = jest.fn().mockResolvedValue({});
      mockStripeHelper.cancelSubscription = jest.fn().mockResolvedValue({});
      const result = await processor.cancelInvoiceSubscription(paidInvoice);
      expect(result).toEqual([{}, {}]);
      expect(mockStripeHelper.markUncollectible).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.markUncollectible).toHaveBeenCalledWith(
        paidInvoice
      );
      expect(mockStripeHelper.cancelSubscription).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.cancelSubscription).toHaveBeenCalledWith(
        paidInvoice.subscription.id
      );
    });
  });

  describe('ensureAccurateAttemptCount', () => {
    it('does nothing if the attempts match', async () => {
      mockStripeHelper.getPaymentAttempts = jest.fn().mockReturnValue(1);
      mockStripeHelper.updatePaymentAttempts = jest.fn().mockResolvedValue({});
      await processor.ensureAccurateAttemptCount(unpaidInvoice, [{}]);
      expect(mockStripeHelper.updatePaymentAttempts).not.toHaveBeenCalled();
    });

    it('updates the attempts if they do not match', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockStripeHelper.getPaymentAttempts = jest.fn().mockReturnValue(2);
      mockStripeHelper.updatePaymentAttempts = jest.fn().mockResolvedValue({});
      await processor.ensureAccurateAttemptCount(invoice, [{}]);
      expect(mockStripeHelper.updatePaymentAttempts).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.updatePaymentAttempts).toHaveBeenCalledWith(
        invoice,
        1
      );
      jest.clearAllMocks();
      await processor.ensureAccurateAttemptCount(invoice, [{}, {}, {}]);
      expect(mockStripeHelper.updatePaymentAttempts).toHaveBeenCalledTimes(1);
      expect(mockStripeHelper.updatePaymentAttempts).toHaveBeenCalledWith(
        invoice,
        3
      );
    });
  });

  describe('handlePaidTransaction', () => {
    it('returns false if no success', async () => {
      let result = await processor.handlePaidTransaction(unpaidInvoice, []);
      expect(result).toBe(false);
      result = await processor.handlePaidTransaction(unpaidInvoice, [
        { status: 'Pending' },
      ]);
      expect(result).toBe(false);
    });

    it('returns true if success', async () => {
      mockStripeHelper.updateInvoiceWithPaypalTransactionId = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.payInvoiceOutOfBand = jest.fn().mockResolvedValue({});
      const result = await processor.handlePaidTransaction(unpaidInvoice, [
        { status: 'Completed', transactionId: 'test1234' },
      ]);
      expect(result).toBe(true);
      expect(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledWith(unpaidInvoice, 'test1234');
    });

    it('returns true and logs if > 1 success', async () => {
      mockStripeHelper.updateInvoiceWithPaypalTransactionId = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.payInvoiceOutOfBand = jest.fn().mockResolvedValue({});
      mockLog.error = jest.fn().mockReturnValue({});
      const result = await processor.handlePaidTransaction(unpaidInvoice, [
        { status: 'Completed', transactionId: 'test1234' },
        { status: 'Completed', transactionId: 'test12345' },
      ]);
      expect(result).toBe(true);
      expect(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId
      ).toHaveBeenCalledWith(unpaidInvoice, 'test1234');
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith(
        'multipleCompletedTransactions',
        {
          customer: unpaidInvoice.customer,
          invoiceId: unpaidInvoice.id,
          transactionCount: 2,
          excessTransactions: ['test12345'],
        }
      );
    });
  });

  describe('handlePendingTransaction', () => {
    it('returns true if a pending within grace period exists', async () => {
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
      ]);
      expect(result).toBe(true);
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(unpaidInvoice);
    });

    it('returns true and logs if multiple pending within grace exist', async () => {
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      mockLog.error = jest.fn().mockReturnValue({});
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
        { status: 'Pending' },
      ]);
      expect(result).toBe(true);
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(unpaidInvoice);
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith(
        'multiplePendingTransactions',
        { customer: unpaidInvoice.customer, invoiceId: unpaidInvoice.id }
      );
    });

    it('returns false if no pending exist', async () => {
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Completed' },
      ]);
      expect(result).toBe(false);
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(unpaidInvoice);
    });

    it('returns false if no pending within grace period exist', async () => {
      processor.inGracePeriod = jest.fn().mockReturnValue(false);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
      ]);
      expect(result).toBe(false);
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(unpaidInvoice);
    });
  });

  describe('makePaymentAttempt', () => {
    it('processes zero invoice if its 0', async () => {
      const invoice = deepCopy(unpaidInvoice);
      invoice.amount_due = 0;
      mockPaypalHelper.processZeroInvoice = jest.fn().mockResolvedValue({});
      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(true);
      expect(mockPaypalHelper.processZeroInvoice).toHaveBeenCalledTimes(1);
      expect(mockPaypalHelper.processZeroInvoice).toHaveBeenCalledWith(invoice);
    });

    it('processes an invoice successfully', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockPaypalHelper.processInvoice = jest.fn().mockResolvedValue({});
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue({});
      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(true);
      expect(
        mockStripeHelper.getCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
    });

    it('handles a paypal source error', async () => {
      const invoice = deepCopy(unpaidInvoice);
      const testCustomer = { metadata: { userid: 'testuser' } };
      invoice.customer = testCustomer;

      const failedResponse = deepCopy(failedDoReferenceTransactionResponse);
      failedResponse.L_ERRORCODE0 = PAYPAL_SOURCE_ERRORS[0];
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
      mockPaypalHelper.processInvoice = jest.fn().mockRejectedValue(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('testba');
      mockStripeHelper.getEmailTypes = jest.fn().mockReturnValue([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = jest
        .fn()
        .mockResolvedValue({});

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledWith(invoice);
      expect(
        mockStripeHelper.getCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
      expect(
        mockStripeHelper.removeCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
    });

    it('handles an invalid billing agreement', async () => {
      const invoice = deepCopy(unpaidInvoice);
      const testCustomer = { metadata: { userid: 'testuser' } } as any;
      invoice.customer = testCustomer;

      const failedResponse = deepCopy(failedDoReferenceTransactionResponse);
      failedResponse.L_ERRORCODE0 = PAYPAL_BILLING_AGREEMENT_INVALID;
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
      mockPaypalHelper.processInvoice = jest.fn().mockRejectedValue(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('testba');
      mockStripeHelper.getEmailTypes = jest.fn().mockReturnValue([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = jest
        .fn()
        .mockResolvedValue({});

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledWith(
        testCustomer
      );
      expect(
        mockStripeHelper.removeCustomerPaypalAgreement
      ).toHaveBeenCalledTimes(1);
      expect(
        mockStripeHelper.removeCustomerPaypalAgreement
      ).toHaveBeenCalledWith('testuser', testCustomer.id, 'testba');
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledTimes(1);
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledWith(invoice);
    });

    it('handles an unexpected error', async () => {
      const invoice = deepCopy(unpaidInvoice);
      const testCustomer = { metadata: { userid: 'testuser' } };
      invoice.customer = testCustomer;

      const throwErr = new Error('test');
      mockLog.error = jest.fn().mockReturnValue({});
      mockPaypalHelper.processInvoice = jest.fn().mockRejectedValue(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = jest
        .fn()
        .mockResolvedValue({});
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('testba');

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith('processInvoice', {
        err: throwErr,
        invoiceId: invoice.id,
      });
      expect(
        mockStripeHelper.getCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
      expect(
        mockStripeHelper.removeCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
    });
  });

  describe('attemptsToday', () => {
    it('locates the transactions for today', () => {
      let yesterdayTransaction: any = new Date();
      yesterdayTransaction.setDate(yesterdayTransaction.getDate() - 1);
      yesterdayTransaction = yesterdayTransaction.toUTCString();
      const todayTransaction = new Date().toUTCString();
      const result = processor.attemptsToday([
        { timestamp: yesterdayTransaction },
        { timestamp: todayTransaction },
      ]);
      expect(result).toEqual(1);
    });
  });

  describe('attemptInvoiceProcessing', () => {
    let invoice: any;
    let customer: any;

    beforeEach(() => {
      invoice = deepCopy(unpaidInvoice);
      invoice.customer = customer = deepCopy(customer1);
    });

    it('makes an attempt', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(false);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(false);
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('b-1234');
      processor.attemptsToday = jest.fn().mockReturnValue(0);
      processor.makePaymentAttempt = jest.fn().mockResolvedValue({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(invoice);
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledWith(
        invoice.customer
      );
      expect(processor.attemptsToday).toHaveBeenCalledTimes(1);
      expect(processor.attemptsToday).toHaveBeenCalledWith([]);
      expect(processor.makePaymentAttempt).toHaveBeenCalledTimes(1);
      expect(processor.makePaymentAttempt).toHaveBeenCalledWith(invoice);
    });

    it('errors with no customer loaded', async () => {
      invoice.customer = 'cust_1232142';
      mockLog.error = jest.fn().mockReturnValue({});
      await expect(processor.attemptInvoiceProcessing(invoice)).rejects.toEqual(
        error.internalValidationError('customerNotLoad', {
          customer: 'cust_1232142',
          invoiceId: invoice.id,
        })
      );
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith('customerNotLoaded', {
        customer: 'cust_1232142',
      });
    });

    it('stops with a pending transaction', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(false);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(true);
      processor.inGracePeriod = jest.fn().mockReturnValue(true);

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.inGracePeriod).not.toHaveBeenCalled();
    });

    it('stops with a completed transaction', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(true);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(false);

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.handlePendingTransaction).not.toHaveBeenCalled();
    });

    it('stops if no billing agreement', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(false);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(false);
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue(undefined);
      processor.attemptsToday = jest.fn().mockReturnValue(0);
      mockStripeHelper.getEmailTypes = jest
        .fn()
        .mockReturnValue(['paymentFailed']);
      mockHandler.sendSubscriptionPaymentFailedEmail = jest
        .fn()
        .mockResolvedValue({});
      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(invoice);
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledWith(
        invoice.customer
      );
      // We do not send an email since `getEmailTypes` is returning a list with
      // 'paymentFailed'.
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).not.toHaveBeenCalled();
      expect(processor.attemptsToday).not.toHaveBeenCalled();
    });

    it('voids invoices for deleted customers', async () => {
      mockStripeHelper.markUncollectible = jest.fn().mockResolvedValue({});
      mockLog.info = jest.fn().mockReturnValue({});
      customer.deleted = true;
      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockLog.info).toHaveBeenCalledTimes(1);
      expect(mockLog.info).toHaveBeenCalledWith('customerDeletedVoid', {
        customerId: customer.id,
      });
    });

    it('cancels if outside the grace period', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(false);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(false);
      processor.inGracePeriod = jest.fn().mockReturnValue(false);
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('b-1234');
      processor.cancelInvoiceSubscription = jest.fn().mockResolvedValue({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toEqual({});
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(invoice);
      expect(
        mockStripeHelper.getCustomerPaypalAgreement
      ).not.toHaveBeenCalled();
      expect(processor.cancelInvoiceSubscription).toHaveBeenCalledTimes(1);
      expect(processor.cancelInvoiceSubscription).toHaveBeenCalledWith(invoice);
    });

    it('does not attempt payment after too many attempts', async () => {
      mockPaypalHelper.searchTransactions = jest.fn().mockResolvedValue([]);
      processor.ensureAccurateAttemptCount = jest.fn().mockResolvedValue({});
      processor.handlePaidTransaction = jest.fn().mockResolvedValue(false);
      processor.handlePendingTransaction = jest.fn().mockResolvedValue(false);
      processor.inGracePeriod = jest.fn().mockReturnValue(true);
      mockStripeHelper.getCustomerPaypalAgreement = jest
        .fn()
        .mockReturnValue('b-1234');
      processor.attemptsToday = jest.fn().mockReturnValue(20);
      processor.makePaymentAttempt = jest.fn().mockResolvedValue({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      expect(mockPaypalHelper.searchTransactions).toHaveBeenCalledTimes(1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(invoice, []);
      }
      expect(processor.inGracePeriod).toHaveBeenCalledTimes(1);
      expect(processor.inGracePeriod).toHaveBeenCalledWith(invoice);
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.getCustomerPaypalAgreement).toHaveBeenCalledWith(
        invoice.customer
      );
      expect(processor.attemptsToday).toHaveBeenCalledTimes(1);
      expect(processor.attemptsToday).toHaveBeenCalledWith([]);
      expect(processor.makePaymentAttempt).not.toHaveBeenCalled();
    });
  });

  describe('processInvoices', () => {
    it('processes an invoice', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockLog.error = jest.fn().mockReturnValue({});
      mockLog.info = jest.fn().mockReturnValue({});
      processor.attemptInvoiceProcessing = jest.fn().mockResolvedValue({});
      mockStripeHelper.fetchOpenInvoices = jest.fn().mockReturnValue({
        *[Symbol.asyncIterator]() {
          yield invoice;
        },
      });
      // eslint-disable-next-line
      for await (const _ of processor.processInvoices()) {
        // No value yield'd; yielding control for potential distributed lock
        // extension in actual use case
      }
      expect(mockLog.info).toHaveBeenCalledTimes(1);
      expect(mockLog.info).toHaveBeenCalledWith('processInvoice.processing', {
        invoiceId: invoice.id,
      });
      expect(mockLog.error).not.toHaveBeenCalled();
    });

    it('logs an error on invoice exception', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockLog.error = jest.fn().mockReturnValue({});
      mockLog.info = jest.fn().mockReturnValue({});
      const throwErr = new Error('Test');
      processor.attemptInvoiceProcessing = jest
        .fn()
        .mockRejectedValue(throwErr);
      mockStripeHelper.fetchOpenInvoices = jest.fn().mockReturnValue({
        *[Symbol.asyncIterator]() {
          yield invoice;
        },
      });
      // The generator catches errors internally and logs them; it does not
      // re-throw, so the loop completes normally.
      // eslint-disable-next-line
      for await (const _ of processor.processInvoices()) {
        // No value yield'd
      }
      expect(mockLog.info).toHaveBeenCalledTimes(1);
      expect(mockLog.info).toHaveBeenCalledWith('processInvoice.processing', {
        invoiceId: invoice.id,
      });
      expect(mockLog.error).toHaveBeenCalledTimes(1);
      expect(mockLog.error).toHaveBeenCalledWith('processInvoice', {
        err: throwErr,
        nvpData: undefined,
        invoiceId: invoice.id,
      });
    });
  });

  describe('sendFailedPaymentEmail', () => {
    it('sends an email when paymentFailed is not in the list of sent emails', async () => {
      mockStripeHelper.getEmailTypes = jest.fn().mockReturnValue([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = jest
        .fn()
        .mockResolvedValue({});
      await processor.sendFailedPaymentEmail(unpaidInvoice);
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).toHaveBeenCalledTimes(1);
    });

    it('does not send an email when paymentFailed is in the list of sent emails', async () => {
      mockStripeHelper.getEmailTypes = jest
        .fn()
        .mockReturnValue(['a', 'b', 'paymentFailed']);
      mockHandler.sendSubscriptionPaymentFailedEmail = jest
        .fn()
        .mockResolvedValue({});
      await processor.sendFailedPaymentEmail(unpaidInvoice);
      expect(
        mockHandler.sendSubscriptionPaymentFailedEmail
      ).not.toHaveBeenCalled();
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/paypal-processor.js (Mocha → Jest). */

import sinon from 'sinon';
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

const sandbox = sinon.createSandbox();

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
    processor = new PaypalProcessor(mockLog, mockConfig, 1, 1, undefined as any, {} as any, {} as any);
    processor.webhookHandler = mockHandler;
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  describe('constructor', () => {
    it('sets log, graceDays, retryAttemps, stripe and paypalHelpers', () => {
      const paypalProcessor = new PaypalProcessor(mockLog, mockConfig, 1, 1, undefined as any, {} as any, {} as any);
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
      mockStripeHelper.markUncollectible = sandbox.fake.resolves({});
      mockStripeHelper.cancelSubscription = sandbox.fake.resolves({});
      const result = await processor.cancelInvoiceSubscription(paidInvoice);
      expect(result).toEqual([{}, {}]);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.markUncollectible,
        paidInvoice
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.cancelSubscription,
        paidInvoice.subscription.id
      );
    });
  });

  describe('ensureAccurateAttemptCount', () => {
    it('does nothing if the attempts match', async () => {
      mockStripeHelper.getPaymentAttempts = sandbox.fake.returns(1);
      mockStripeHelper.updatePaymentAttempts = sandbox.fake.resolves({});
      await processor.ensureAccurateAttemptCount(unpaidInvoice, [{}]);
      sinon.assert.notCalled(mockStripeHelper.updatePaymentAttempts);
    });

    it('updates the attempts if they do not match', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockStripeHelper.getPaymentAttempts = sandbox.fake.returns(2);
      mockStripeHelper.updatePaymentAttempts = sandbox.fake.resolves({});
      await processor.ensureAccurateAttemptCount(invoice, [{}]);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updatePaymentAttempts,
        invoice,
        1
      );
      sandbox.reset();
      await processor.ensureAccurateAttemptCount(invoice, [{}, {}, {}]);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updatePaymentAttempts,
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
      mockStripeHelper.updateInvoiceWithPaypalTransactionId =
        sandbox.fake.resolves({});
      mockStripeHelper.payInvoiceOutOfBand = sandbox.fake.resolves({});
      const result = await processor.handlePaidTransaction(unpaidInvoice, [
        { status: 'Completed', transactionId: 'test1234' },
      ]);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        unpaidInvoice,
        'test1234'
      );
    });

    it('returns true and logs if > 1 success', async () => {
      mockStripeHelper.updateInvoiceWithPaypalTransactionId =
        sandbox.fake.resolves({});
      mockStripeHelper.payInvoiceOutOfBand = sandbox.fake.resolves({});
      mockLog.error = sandbox.fake.returns({});
      const result = await processor.handlePaidTransaction(unpaidInvoice, [
        { status: 'Completed', transactionId: 'test1234' },
        { status: 'Completed', transactionId: 'test12345' },
      ]);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.updateInvoiceWithPaypalTransactionId,
        unpaidInvoice,
        'test1234'
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
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
      processor.inGracePeriod = sandbox.fake.returns(true);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
      ]);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        processor.inGracePeriod,
        unpaidInvoice
      );
    });

    it('returns true and logs if multiple pending within grace exist', async () => {
      processor.inGracePeriod = sandbox.fake.returns(true);
      mockLog.error = sandbox.fake.returns({});
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
        { status: 'Pending' },
      ]);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        processor.inGracePeriod,
        unpaidInvoice
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'multiplePendingTransactions',
        { customer: unpaidInvoice.customer, invoiceId: unpaidInvoice.id }
      );
    });

    it('returns false if no pending exist', async () => {
      processor.inGracePeriod = sandbox.fake.returns(true);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Completed' },
      ]);
      expect(result).toBe(false);
      sinon.assert.calledOnceWithExactly(
        processor.inGracePeriod,
        unpaidInvoice
      );
    });

    it('returns false if no pending within grace period exist', async () => {
      processor.inGracePeriod = sandbox.fake.returns(false);
      const result = await processor.handlePendingTransaction(unpaidInvoice, [
        { status: 'Pending' },
      ]);
      expect(result).toBe(false);
      sinon.assert.calledOnceWithExactly(
        processor.inGracePeriod,
        unpaidInvoice
      );
    });
  });

  describe('makePaymentAttempt', () => {
    it('processes zero invoice if its 0', async () => {
      const invoice = deepCopy(unpaidInvoice);
      invoice.amount_due = 0;
      mockPaypalHelper.processZeroInvoice = sandbox.fake.resolves({});
      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(true);
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.processZeroInvoice,
        invoice
      );
    });

    it('processes an invoice successfully', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockPaypalHelper.processInvoice = sandbox.fake.resolves({});
      mockStripeHelper.getCustomerPaypalAgreement = sandbox.fake.resolves({});
      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(true);
      sinon.assert.notCalled(mockStripeHelper.getCustomerPaypalAgreement);
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
      mockPaypalHelper.processInvoice = sandbox.fake.rejects(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = sandbox.fake.resolves(
        {}
      );
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('testba');
      mockStripeHelper.getEmailTypes = sandbox.fake.returns([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = sandbox.fake.resolves(
        {}
      );

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      sinon.assert.calledOnceWithExactly(
        mockHandler.sendSubscriptionPaymentFailedEmail,
        invoice
      );
      sinon.assert.notCalled(mockStripeHelper.getCustomerPaypalAgreement);
      sinon.assert.notCalled(mockStripeHelper.removeCustomerPaypalAgreement);
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
      mockPaypalHelper.processInvoice = sandbox.fake.rejects(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = sandbox.fake.resolves(
        {}
      );
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('testba');
      mockStripeHelper.getEmailTypes = sandbox.fake.returns([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = sandbox.fake.resolves(
        {}
      );

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        testCustomer
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.removeCustomerPaypalAgreement,
        'testuser',
        testCustomer.id,
        'testba'
      );
      sinon.assert.calledOnceWithExactly(
        mockHandler.sendSubscriptionPaymentFailedEmail,
        invoice
      );
    });

    it('handles an unexpected error', async () => {
      const invoice = deepCopy(unpaidInvoice);
      const testCustomer = { metadata: { userid: 'testuser' } };
      invoice.customer = testCustomer;

      const throwErr = new Error('test');
      mockLog.error = sandbox.fake.returns({});
      mockPaypalHelper.processInvoice = sandbox.fake.rejects(throwErr);
      mockStripeHelper.removeCustomerPaypalAgreement = sandbox.fake.resolves(
        {}
      );
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('testba');

      const result = await processor.makePaymentAttempt(invoice);
      expect(result).toBe(false);
      sinon.assert.calledOnceWithExactly(mockLog.error, 'processInvoice', {
        err: throwErr,
        invoiceId: invoice.id,
      });
      sinon.assert.notCalled(mockStripeHelper.getCustomerPaypalAgreement);
      sinon.assert.notCalled(mockStripeHelper.removeCustomerPaypalAgreement);
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
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(false);
      processor.handlePendingTransaction = sandbox.fake.resolves(false);
      processor.inGracePeriod = sandbox.fake.returns(true);
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('b-1234');
      processor.attemptsToday = sandbox.fake.returns(0);
      processor.makePaymentAttempt = sandbox.fake.resolves({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.calledOnceWithExactly(processor.inGracePeriod, invoice);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        invoice.customer
      );
      sinon.assert.calledOnceWithExactly(processor.attemptsToday, []);
      sinon.assert.calledOnceWithExactly(processor.makePaymentAttempt, invoice);
    });

    it('errors with no customer loaded', async () => {
      invoice.customer = 'cust_1232142';
      mockLog.error = sandbox.fake.returns({});
      await expect(
        processor.attemptInvoiceProcessing(invoice)
      ).rejects.toEqual(
        error.internalValidationError('customerNotLoad', {
          customer: 'cust_1232142',
          invoiceId: invoice.id,
        })
      );
      sinon.assert.calledOnceWithExactly(mockLog.error, 'customerNotLoaded', {
        customer: 'cust_1232142',
      });
    });

    it('stops with a pending transaction', async () => {
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(false);
      processor.handlePendingTransaction = sandbox.fake.resolves(true);
      processor.inGracePeriod = sandbox.fake.returns(true);

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.notCalled(processor.inGracePeriod);
    });

    it('stops with a completed transaction', async () => {
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(true);
      processor.handlePendingTransaction = sandbox.fake.resolves(false);

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.notCalled(processor.handlePendingTransaction);
    });

    it('stops if no billing agreement', async () => {
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(false);
      processor.handlePendingTransaction = sandbox.fake.resolves(false);
      processor.inGracePeriod = sandbox.fake.returns(true);
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns(undefined);
      processor.attemptsToday = sandbox.fake.returns(0);
      mockStripeHelper.getEmailTypes = sandbox.fake.returns(['paymentFailed']);
      mockHandler.sendSubscriptionPaymentFailedEmail = sandbox.fake.resolves(
        {}
      );
      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.calledOnceWithExactly(processor.inGracePeriod, invoice);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        invoice.customer
      );
      // We do not send an email since `getEmailTypes` is returning a list with
      // 'paymentFailed'.
      sinon.assert.notCalled(mockHandler.sendSubscriptionPaymentFailedEmail);
      sinon.assert.notCalled(processor.attemptsToday);
    });

    it('voids invoices for deleted customers', async () => {
      mockStripeHelper.markUncollectible = sandbox.fake.resolves({});
      mockLog.info = sandbox.fake.returns({});
      customer.deleted = true;
      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.calledOnceWithExactly(mockLog.info, 'customerDeletedVoid', {
        customerId: customer.id,
      });
    });

    it('cancels if outside the grace period', async () => {
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(false);
      processor.handlePendingTransaction = sandbox.fake.resolves(false);
      processor.inGracePeriod = sandbox.fake.returns(false);
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('b-1234');
      processor.cancelInvoiceSubscription = sandbox.fake.resolves({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toEqual({});
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.calledOnceWithExactly(processor.inGracePeriod, invoice);
      sinon.assert.notCalled(mockStripeHelper.getCustomerPaypalAgreement);
      sinon.assert.calledOnceWithExactly(
        processor.cancelInvoiceSubscription,
        invoice
      );
    });

    it('does not attempt payment after too many attempts', async () => {
      mockPaypalHelper.searchTransactions = sandbox.fake.resolves([]);
      processor.ensureAccurateAttemptCount = sandbox.fake.resolves({});
      processor.handlePaidTransaction = sandbox.fake.resolves(false);
      processor.handlePendingTransaction = sandbox.fake.resolves(false);
      processor.inGracePeriod = sandbox.fake.returns(true);
      mockStripeHelper.getCustomerPaypalAgreement =
        sandbox.fake.returns('b-1234');
      processor.attemptsToday = sandbox.fake.returns(20);
      processor.makePaymentAttempt = sandbox.fake.resolves({});

      const result = await processor.attemptInvoiceProcessing(invoice);
      expect(result).toBeUndefined();
      sinon.assert.callCount(mockPaypalHelper.searchTransactions, 1);

      for (const spy of [
        processor.ensureAccurateAttemptCount,
        processor.handlePaidTransaction,
        processor.handlePendingTransaction,
      ]) {
        sinon.assert.calledOnceWithExactly(spy, invoice, []);
      }
      sinon.assert.calledOnceWithExactly(processor.inGracePeriod, invoice);
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.getCustomerPaypalAgreement,
        invoice.customer
      );
      sinon.assert.calledOnceWithExactly(processor.attemptsToday, []);
      sinon.assert.notCalled(processor.makePaymentAttempt);
    });
  });

  describe('processInvoices', () => {
    it('processes an invoice', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockLog.error = sandbox.fake.returns({});
      mockLog.info = sandbox.fake.returns({});
      processor.attemptInvoiceProcessing = sandbox.fake.resolves({});
      mockStripeHelper.fetchOpenInvoices = sandbox.fake.returns({
        *[Symbol.asyncIterator]() {
          yield invoice;
        },
      });
      // eslint-disable-next-line
      for await (const _ of processor.processInvoices()) {
        // No value yield'd; yielding control for potential distributed lock
        // extension in actual use case
      }
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'processInvoice.processing',
        {
          invoiceId: invoice.id,
        }
      );
      sinon.assert.notCalled(mockLog.error);
    });

    it('logs an error on invoice exception', async () => {
      const invoice = deepCopy(unpaidInvoice);
      mockLog.error = sandbox.fake.returns({});
      mockLog.info = sandbox.fake.returns({});
      const throwErr = new Error('Test');
      processor.attemptInvoiceProcessing = sandbox.fake.rejects(throwErr);
      mockStripeHelper.fetchOpenInvoices = sandbox.fake.returns({
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
      sinon.assert.calledOnceWithExactly(
        mockLog.info,
        'processInvoice.processing',
        {
          invoiceId: invoice.id,
        }
      );
      sinon.assert.calledOnceWithExactly(mockLog.error, 'processInvoice', {
        err: throwErr,
        nvpData: undefined,
        invoiceId: invoice.id,
      });
    });
  });

  describe('sendFailedPaymentEmail', () => {
    it('sends an email when paymentFailed is not in the list of sent emails', async () => {
      mockStripeHelper.getEmailTypes = sandbox.fake.returns([]);
      mockHandler.sendSubscriptionPaymentFailedEmail = sandbox.fake.resolves(
        {}
      );
      await processor.sendFailedPaymentEmail(unpaidInvoice);
      sinon.assert.calledOnce(mockHandler.sendSubscriptionPaymentFailedEmail);
    });

    it('does not send an email when paymentFailed is in the list of sent emails', async () => {
      mockStripeHelper.getEmailTypes = sandbox.fake.returns([
        'a',
        'b',
        'paymentFailed',
      ]);
      mockHandler.sendSubscriptionPaymentFailedEmail = sandbox.fake.resolves(
        {}
      );
      await processor.sendFailedPaymentEmail(unpaidInvoice);
      sinon.assert.notCalled(mockHandler.sendSubscriptionPaymentFailedEmail);
    });
  });
});

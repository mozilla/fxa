/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import error from '../../lib/error';
import { StripeWebhookHandler } from '../routes/subscriptions/stripe-webhook';
import { reportSentryError } from '../sentry';
import { AuthLogger } from '../types';
import { PayPalHelper, TransactionSearchResult } from './paypal';
import { PayPalClientError } from './paypal-client';
import {
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_SOURCE_ERRORS,
} from './paypal-error-codes';
import { StripeHelper, STRIPE_MINIMUM_CHARGE_AMOUNTS } from './stripe';

/**
 * Generest a timestamp in seconds that is `hours` before the current
 * time.
 *
 * @param hours
 */
function hoursBeforeInSeconds(hours: number): number {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return Math.round(date.getTime() / 1000);
}

/**
 * Returns whether two dates are the same month/day/year.
 *
 * @param d1
 * @param d2
 */
function sameDay(d1: Date, d2: Date) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

export class PaypalProcessor {
  private stripeHelper: StripeHelper;
  private paypalHelper: PayPalHelper;
  private webhookHandler: StripeWebhookHandler;

  constructor(
    private log: Logger,
    config: ConfigType,
    private graceDays: number,
    private maxRetryAttempts: number,
    private invoiceAge = 6,
    db: any,
    mailer: any
  ) {
    this.stripeHelper = Container.get(StripeHelper);
    this.paypalHelper = Container.get(PayPalHelper);

    // Instantiate a webhook handler so we can use its subscription sending methods
    this.webhookHandler = new StripeWebhookHandler(
      log as AuthLogger,
      db,
      config,
      undefined,
      undefined,
      mailer,
      undefined,
      this.stripeHelper
    );
  }

  /**
   * Determine if the given invoice is within its grace period for
   * additional payment retries or waiting on a pending transaction.
   *
   * Calculated by adding the `graceDays` in seconds to the invoice
   * creation time. A `graceDays` value of 1 allows an invoice to be
   * open for 24 hours hours (1 day) before not in grace period, etc.
   *
   * @param invoice
   */
  private inGracePeriod(invoice: Stripe.Invoice): boolean {
    const graceDaysInSeconds = this.graceDays * 24 * 60 * 60;
    return Date.now() / 1000 < invoice.created + graceDaysInSeconds;
  }

  private async cancelInvoiceSubscription(invoice: Stripe.Invoice) {
    return Promise.all([
      this.stripeHelper.markUncollectible(invoice),
      this.stripeHelper.cancelSubscription(
        (invoice.subscription as Stripe.Subscription).id
      ),
    ]);
  }

  /**
   * Ensures that an invoice matches the payment attempts returned from a PayPal
   * Transaction Search.
   *
   * In general this should be the case, but in the event that an IPN notification
   * is missed a mismatch could occur.
   *
   * @param invoice
   * @param transactions
   */
  private async ensureAccurateAttemptCount(
    invoice: Stripe.Invoice,
    transactions: TransactionSearchResult[]
  ) {
    const paymentAttempts = this.stripeHelper.getPaymentAttempts(invoice);
    if (paymentAttempts !== transactions.length) {
      await this.stripeHelper.updatePaymentAttempts(
        invoice,
        transactions.length
      );
    }
  }

  /**
   * Handles the condition where a transaction for an invoice has been paid.
   *
   * This occurrs when a previously pending transaction becomes paid, and the
   * invoice should now be marked as paid.
   *
   * Returns whether the invoice has been paid.
   *
   * @param invoice
   * @param transactions
   */
  private async handlePaidTransaction(
    invoice: Stripe.Invoice,
    transactions: TransactionSearchResult[]
  ): Promise<boolean> {
    const customer = invoice.customer;
    const successTransactions = transactions.filter((t) =>
      ['Completed', 'Processed'].includes(t.status)
    );
    if (successTransactions.length) {
      if (successTransactions.length > 1) {
        this.log.error('multipleCompletedTransactions', {
          customer,
          invoiceId: invoice.id,
          transactionCount: successTransactions.length,
          excessTransactions: successTransactions
            .slice(1)
            .map((t) => t.transactionId),
        });
        reportSentryError(
          new Error('Multiple completed payments for invoice: ' + invoice.id)
        );
      }
      const transaction = successTransactions[0];
      await this.stripeHelper.updateInvoiceWithPaypalTransactionId(
        invoice,
        transaction.transactionId
      );
      await this.stripeHelper.payInvoiceOutOfBand(invoice);
      return true;
    }
    return false;
  }

  /**
   * Handles the condition where a transaction for an invoice is pending.
   *
   * This occurs when a previous payment attempt has not completed. This
   * method checks to see if there's a pending transaction for the invoice.
   * Returns `true` if this invoice has valid pending transactions to wait
   * for, `false` otherwise.
   *
   * @param invoice
   * @param transactions
   */
  private async handlePendingTransaction(
    invoice: Stripe.Invoice,
    transactions: TransactionSearchResult[]
  ): Promise<boolean> {
    const customer = invoice.customer;
    const inGracePeriod = this.inGracePeriod(invoice);
    const outstandingTransactions = transactions.filter((t) =>
      ['Pending', 'In-Progress', 'Under Review'].includes(t.status)
    );
    if (outstandingTransactions.length) {
      if (outstandingTransactions.length > 1) {
        this.log.error('multiplePendingTransactions', {
          customer,
          invoiceId: invoice.id,
        });
        reportSentryError(
          new Error('Multiple pending payments for invoice: ' + invoice.id)
        );
      }
      if (inGracePeriod) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sent a failed payment email for an invoice if that email has not been sent.
   *
   * @param invoice
   */
  private async sendFailedPaymentEmail(invoice: Stripe.Invoice) {
    const emailTypes = this.stripeHelper.getEmailTypes(invoice);
    if (!emailTypes.includes('paymentFailed')) {
      return this.webhookHandler.sendSubscriptionPaymentFailedEmail(invoice);
    }
    return false;
  }

  /**
   * Make a payment attempt on an invoice.
   *
   * @param invoice
   */
  private async makePaymentAttempt(invoice: Stripe.Invoice) {
    const customer = invoice.customer as Stripe.Customer;
    const minAmount = STRIPE_MINIMUM_CHARGE_AMOUNTS[invoice.currency] || 50;
    if (invoice.amount_due < minAmount) {
      await this.paypalHelper.processZeroInvoice(invoice);
      return true;
    }

    try {
      await this.paypalHelper.processInvoice({
        customer,
        invoice,
        batchProcessing: true,
      });
      return true;
    } catch (err) {
      if (err instanceof PayPalClientError) {
        if (err.errorCode === PAYPAL_BILLING_AGREEMENT_INVALID) {
          const uid = customer.metadata.userid;
          const billingAgreementId =
            this.stripeHelper.getCustomerPaypalAgreement(customer) as string;
          await this.stripeHelper.removeCustomerPaypalAgreement(
            uid,
            customer.id,
            billingAgreementId
          );
          await this.sendFailedPaymentEmail(invoice);
          return false;
        }
        if (PAYPAL_SOURCE_ERRORS.includes(err.errorCode ?? 0)) {
          await this.sendFailedPaymentEmail(invoice);
          return false;
        }
      }
      this.log.error('processInvoice', { err, invoiceId: invoice.id });
      reportSentryError(err);
      return false;
    }
  }

  private attemptsToday(transactions: TransactionSearchResult[]) {
    const today = new Date();
    return transactions.filter((t) => sameDay(today, new Date(t.timestamp)))
      .length;
  }

  /**
   * Attempt to process an invoice that is at least 24 hours after its creation.
   *
   * This attempt consists of:
   *   1. Verifying the customer was expanded on the invoice.
   *   2. Ensuring we don't process invoices for deleted customers, their invoice will
   *      be marked as uncollectible.
   *   3. Search all transactions run for this invoice and:
   *     a. Ensure the transaction count matches the invoice retry attempts.
   *     b. If a transaction completed, mark invoice as paid, return.
   *     c. If a transaction is pending/in-progress:
   *       - If we're in grace period, skip invoice and wait for completion, return.
   *   4. If we're past grace period, cancelInvoiceSubscription, return.
   *   5. If we have no billing agreement, email user to inform them.
   *   6. If retries for today remain:
   *       a. Attempt payment on invoice.
   *   7. Otherwise, return.
   *
   * @param invoice
   */
  private async attemptInvoiceProcessing(invoice: Stripe.Invoice) {
    const customer = invoice.customer;
    // 1
    if (!customer || typeof customer === 'string') {
      this.log.error('customerNotLoaded', { customer });
      throw error.internalValidationError('customerNotLoad', {
        customer,
        invoiceId: invoice.id,
      });
    }

    // 2, Void the invoice for deleted customers
    if (customer.deleted) {
      await this.stripeHelper.markUncollectible(invoice);
      this.log.info('customerDeletedVoid', { customerId: customer.id });
      return;
    }

    // 3, search transactions
    const transactions = await this.paypalHelper.searchTransactions({
      startDate: new Date(invoice.created * 1000),
      invoice: invoice.id,
    });
    // 3a
    await this.ensureAccurateAttemptCount(invoice, transactions);

    // 3b
    if (await this.handlePaidTransaction(invoice, transactions)) {
      return;
    }

    // 3c
    if (await this.handlePendingTransaction(invoice, transactions)) {
      return;
    }

    // 4
    const inGracePeriod = this.inGracePeriod(invoice);
    if (!inGracePeriod) {
      this.log.info('processInvoice', {
        message: 'Cancelling invoice due to grace period.',
        invoiceId: invoice.id,
        created: invoice.created,
        due: invoice.due_date,
      });
      return this.cancelInvoiceSubscription(invoice);
    }

    // 5
    const billingAgreementId =
      this.stripeHelper.getCustomerPaypalAgreement(customer);
    if (!billingAgreementId) {
      await this.sendFailedPaymentEmail(invoice);
      return;
    }

    // 6
    if (this.attemptsToday(transactions) < this.maxRetryAttempts) {
      await this.makePaymentAttempt(invoice);
    }
    return;
  }

  public async processInvoices() {
    // Generate a time `invoiceAge` hours prior.
    const invoiceAgeInSeconds = hoursBeforeInSeconds(this.invoiceAge);

    const invoices = this.stripeHelper.fetchOpenInvoices({
      lte: invoiceAgeInSeconds,
    });
    for await (const invoice of invoices) {
      this.log.info('processInvoice.processing', { invoiceId: invoice.id });
      try {
        await this.attemptInvoiceProcessing(invoice);
      } catch (err) {
        this.log.error('processInvoice', {
          err,
          nvpData: err.data,
          invoiceId: invoice.id,
        });
        reportSentryError(err);
      }
    }
  }
}

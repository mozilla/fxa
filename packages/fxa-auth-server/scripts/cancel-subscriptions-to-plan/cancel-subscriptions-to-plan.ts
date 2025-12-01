/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { writeFile } from 'fs/promises';
import PQueue from 'p-queue';

import { StripeHelper } from '../../lib/payments/stripe';
import { PayPalHelper } from 'packages/fxa-auth-server/lib/payments/paypal';
import { RefundType } from '@fxa/payments/paypal';

export class PlanCanceller {
  private stripeQueue: PQueue;
  private stripe: Stripe;

  /**
   * A tool to cancel all subscriptions under a plan
   * @param priceId A Stripe plan or price ID for which all subscriptions will be cancelled
   * @param remainingValueMode Configuration for how to handle remaining subscription value
   * @param excludePlanIds A list of Stripe plan or price ID which if customers have will not be cancelled
   * @param outputFile A CSV file to output a report of affected subscriptions to
   * @param stripeHelper An instance of StripeHelper
   * @param paypalHelper An instance of PayPalHelper
   * @param dryRun If true, no actual changes will be made
   * @param rateLimit A limit for number of stripe requests within the period of 1 second
   */
  constructor(
    private priceId: string,
    private remainingValueMode: "noaction" | "refund" | "prorate" | "proratedRefund",
    private excludePlanIds: string[],
    private outputFile: string,
    private stripeHelper: StripeHelper,
    private paypalHelper: PayPalHelper,
    public dryRun: boolean,
    rateLimit: number
  ) {
    this.stripe = this.stripeHelper.stripe;

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // Stripe measures its rate limit per second
    });
  }

  async run(): Promise<void> {
    await this.writeReportHeader();

    await this.stripe.subscriptions.list({
      price: this.priceId,
      limit: 100,
    }).autoPagingEach((subscription) => {
      return this.processSubscription(subscription);
    });
  }

  async processSubscription(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const subscriptionId = subscription.id;
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    try {
      const customer = await this.fetchCustomer(customerId);
      if (!customer?.subscriptions?.data) {
        throw new Error(`Customer not found: ${customerId}`);
      }

      const isExcluded = this.isCustomerExcluded(customer.subscriptions.data);

      let amountRefunded: number | null = null;
      let approximateAmountWasOwed: number | null = null;
      let daysSinceLastBill: number | null = null;
      let daysUntilNextBill: number | null = null;
      let previousInvoiceAmountPaid: number | null = null;
      let isOwed = !isExcluded;

      if (!isExcluded) {
        if (this.remainingValueMode === "proratedRefund") {
          try {
            const calculation = await this.calculateRefundAmount(subscription);
            approximateAmountWasOwed = calculation.refundAmount;
            daysSinceLastBill = calculation.daysSinceBill;
            daysUntilNextBill = calculation.daysUntilNextBill;
            previousInvoiceAmountPaid = calculation.invoice.amount_paid;
          } catch(e) {
            console.warn(e);
          }
        }

        if (!this.dryRun) {
          await this.enqueueRequest(() =>
            this.stripe.subscriptions.cancel(subscription.id, {
              prorate: this.remainingValueMode === "prorate",
            })
          );
        }

        if (this.remainingValueMode === "noaction" || this.remainingValueMode === "prorate") {
          isOwed = false;
          amountRefunded = null;
        } else if (this.remainingValueMode === "refund") {
          try {
            amountRefunded = await this.attemptFullRefund(subscription);
            isOwed = false;
          } catch (e) {
            console.log(`Failed to issue a refund for ${customerId} ${e}`);
            isOwed = true;
          }
        } else if (this.remainingValueMode === "proratedRefund") {
          try {
            amountRefunded = await this.attemptProratedRefund(subscription);
            isOwed = false;
          } catch (e) {
            console.log(`Failed to issue a refund for ${customerId} ${e}`);
            isOwed = true;
          }
        }
      } else {
        isOwed = false;
      }

      await this.writeReport({
        subscription,
        customer,
        isExcluded,
        amountRefunded,
        approximateAmountWasOwed,
        daysSinceLastBill,
        daysUntilNextBill,
        previousInvoiceAmountPaid,
        isOwed,
        error: false,
      });

      console.log(`Processed ${subscriptionId}`);
    } catch (e) {
      console.error(subscriptionId, e);
      await this.writeReport({
        subscription,
        customer: null,
        isExcluded: false,
        amountRefunded: null,
        approximateAmountWasOwed: null,
        daysSinceLastBill: null,
        daysUntilNextBill: null,
        previousInvoiceAmountPaid: null,
        isOwed: false,
        error: true,
      });
    }
  }

  /**
   * Retrieves a customer record directly from Stripe
   * @param customerId The Stripe customer ID of the customer to fetch
   * @returns The customer record for the customerId provided, or null if not found or deleted
   */
  async fetchCustomer(customerId: string): Promise<Stripe.Customer | null> {
    const customer = await this.enqueueRequest(() =>
      this.stripe.customers.retrieve(customerId, {
        expand: ['subscriptions'],
      })
    );

    if (customer.deleted) return null;

    return customer;
  }

  async attemptFullRefund(subscription: Stripe.Subscription) {
    if (!subscription.latest_invoice) {
      throw new Error(`No latest invoice for ${subscription.id}`);
    }

    const latestInvoiceId =
      typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice.id;

    const invoice = await this.enqueueRequest(() =>
      this.stripe.invoices.retrieve(latestInvoiceId)
    );

    if (invoice.paid_out_of_band) {
      console.log(`Issuing full Paypal refund for ${invoice.id}`);
      if (this.dryRun) {
        console.log('(dry run mode, no refund issued)');
      } else {
        await this.paypalHelper.refundInvoice(invoice);
      }
    } else {
      const chargeId =
        typeof invoice.charge === 'string'
          ? invoice.charge
          : invoice.charge?.id;
      if (!chargeId) {
        throw new Error(`No charge for ${invoice.id}`);
      }

      console.log(`Issuing full Stripe refund for ${chargeId}`);
      if (this.dryRun) {
        console.log('(dry run mode, no refund issued)');
      } else {
        await this.enqueueRequest(() =>
          this.stripe.refunds.create({
            charge: chargeId,
          })
        );
      }
    }

    return invoice.amount_paid;
  }

  /**
   * Calculate the refund amount and days since last bill for a subscription
   * @param subscription The subscription to calculate for
   * @returns Object containing refundAmount, daysSinceBill, daysUntilNextBill, and invoice
   */
  async calculateRefundAmount(subscription: Stripe.Subscription): Promise<{ refundAmount: number, daysSinceBill: number, daysUntilNextBill: number, invoice: Stripe.Invoice }> {
    if (!subscription.latest_invoice) {
      throw new Error(`No latest invoice for ${subscription.id}`);
    }

    const latestInvoiceId =
      typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice.id;

    const invoice = await this.enqueueRequest(() =>
      this.stripe.invoices.retrieve(latestInvoiceId)
    );

    if (!invoice.paid) {
      throw new Error("Customer is pending renewal right now!");
    }

    const oneDayMs = 1000 * 60 * 60 * 24;

    const periodStart = new Date(subscription.current_period_start * 1000);
    const periodEnd = new Date(subscription.current_period_end * 1000);
    const now = new Date();

    const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
    const timeElapsedMs = now.getTime() - periodStart.getTime();
    const timeRemainingMs = periodEnd.getTime() - now.getTime();

    const daysSinceBill = Math.floor(timeElapsedMs / oneDayMs);
    const totalDaysInPeriod = Math.floor(totalPeriodMs / oneDayMs);
    const daysUntilNextBill = Math.floor(timeRemainingMs / oneDayMs);

    const refundAmount = Math.floor((daysUntilNextBill / totalDaysInPeriod) * invoice.amount_paid);

    return { refundAmount, daysSinceBill, daysUntilNextBill, invoice };
  }

  async attemptProratedRefund(subscription: Stripe.Subscription) {
    const calculation = await this.calculateRefundAmount(subscription);
    const refundAmount = calculation.refundAmount;
    const invoice = calculation.invoice;

    if (refundAmount > invoice.amount_paid) {
      throw new Error(`Will not refund ${invoice.id} for ${refundAmount} as it would eclipse the amount paid on the invoice`);
    }

    if (refundAmount <= 0) {
      throw new Error(`Will not refund ${invoice.id} for ${refundAmount} as it is less than or equal to zero`);
    }

    if (invoice.paid_out_of_band) {
      const behavior = refundAmount === invoice.amount_paid ? {
        refundType: RefundType.Full
      } as const : {
        refundType: RefundType.Partial,
        amount: refundAmount,
      } as const;

      console.log(`Issuing ${refundAmount} (${behavior.refundType}) Paypal refund for ${invoice.id}`);
      if (this.dryRun) {
        console.log('(dry run mode, no refund issued)');
      } else {
        await this.paypalHelper.refundInvoice(invoice, behavior);
      }
    } else {
      const chargeId =
        typeof invoice.charge === 'string' ? invoice.charge : invoice.charge?.id;
      if (!chargeId) {
        throw new Error(`No charge for ${invoice.id}`);
      }

      console.log(`Issuing ${refundAmount} Stripe refund for ${invoice.id}`);
      if (this.dryRun) {
        console.log('(dry run mode, no refund issued)');
      } else {
        await this.enqueueRequest(() =>
          this.stripe.refunds.create({
            charge: chargeId,
            amount: refundAmount
          })
        );
      }
    }

    return refundAmount;
  }

  /**
   * Check if a customer's list of subscriptions contains an excluded price ID
   * @param subscriptions List of subscriptions to check for an excluded price ID in
   */
  isCustomerExcluded(subscriptions: Stripe.Subscription[]): boolean {
    for (const subscription of subscriptions) {
      for (const item of subscription.items.data) {
        if (this.excludePlanIds.includes(item.plan.id)) return true;
      }
    }

    return false;
  }

  async writeReportHeader() {
    const data = [
      "subscriptionId",
      "fxaUid",
      "stripeEmail",
      "postalCode",
      "isExcluded",
      "amountRefunded",
      "approximateAmountWasOwed",
      "daysSinceLastBill",
      "daysUntilNextBill",
      "previousInvoiceAmountPaid",
      "isOwed",
      "error"
    ];

    const reportCSV = data.join(',') + '\n';

    await writeFile(this.outputFile, reportCSV, {
      flag: 'wx',
      encoding: 'utf-8',
    });
  }

  async writeReport(args: {
    subscription: Stripe.Subscription,
    customer: Stripe.Customer | null,
    isExcluded: boolean,
    amountRefunded: number | null,
    approximateAmountWasOwed: number | null,
    daysSinceLastBill: number | null,
    daysUntilNextBill: number | null,
    previousInvoiceAmountPaid: number | null,
    isOwed: boolean,
    error: boolean
  }) {
    const postalCode = args.customer?.shipping?.address?.postal_code ?? args.customer?.address?.postal_code ?? "null";

    const data = [
      args.subscription.id,
      args.customer?.metadata.userid,
      `"${args.customer?.email}"`,
      postalCode,
      String(args.isExcluded),
      args.amountRefunded ?? "null",
      args.approximateAmountWasOwed ?? "null",
      args.daysSinceLastBill ?? "null",
      args.daysUntilNextBill ?? "null",
      args.previousInvoiceAmountPaid ?? "null",
      args.isOwed,
      args.error
    ];

    const reportCSV = data.join(',') + '\n';

    await writeFile(this.outputFile, reportCSV, {
      flag: 'a+',
      encoding: 'utf-8',
    });
  }

  async enqueueRequest<T>(callback: () => T): Promise<T> {
    return this.stripeQueue.add(callback, {
      throwOnTimeout: true,
    });
  }
}

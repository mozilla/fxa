/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { writeFile } from 'fs/promises';
import PQueue from 'p-queue';
import { PayPalHelper } from '../../lib/payments/paypal';

import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { RefundType } from '@fxa/payments/paypal';

/**
  * For RAM-preserving pruposes only
  */
const QUEUE_SIZE_LIMIT = 1000;
/**
  * For RAM-preserving pruposes only
  */
const QUEUE_CONCURRENCY_LIMIT = 100;

export class CustomerPlanMover {
  private stripeQueue: PQueue;

  constructor(
    private sourcePlanId: string,
    private destinationPlanId: string,
    private excludeCustomersHavingPriceIds: string[],
    private outputFile: string,
    private stripe: Stripe,
    public dryRun: boolean,
    rateLimit: number,
    private proratedRefundRate: number | null,
    private coupon: string | null,
    private prorationBehavior: 'none' | 'create_prorations' | 'always_invoice',
    private skipSubscriptionIfSetToCancel: boolean,
    private resetBillingCycleAnchor: boolean,
    private paypalHelper: PayPalHelper
  ) {
    if (proratedRefundRate !== null && proratedRefundRate <= 0) {
      throw new Error("proratedRefundRate must be greater than zero");
    }

    if (prorationBehavior !== 'none' && proratedRefundRate !== null) {
      throw new Error("prorationBehavior can only be specified as non-'none' if proratedRefundRate is null");
    }

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // Stripe measures it's rate limit per second
    });
  }

  async convert() {
    await this.writeReportHeader();

    const destinationPrice = await this.stripe.prices.retrieve(this.destinationPlanId, {
      expand: ['currency_options'],
    });

    const conversionQueue = new PQueue({ concurrency: QUEUE_CONCURRENCY_LIMIT });

    for await (const subscription of this.stripe.subscriptions.list({
      price: this.sourcePlanId,
      limit: 100,
    })) {
      if (conversionQueue.size + conversionQueue.pending >= QUEUE_SIZE_LIMIT) {
        await conversionQueue.onSizeLessThan(QUEUE_SIZE_LIMIT - QUEUE_CONCURRENCY_LIMIT);
      }

      conversionQueue.add(() => {
        return this.convertSubscription(subscription, destinationPrice);;
      });
    }

    await conversionQueue.onIdle();
  }

  async convertSubscription(subscription: Stripe.Subscription, destinationPrice: Stripe.Price) {
    try {
      console.log(`Processing ${subscription.id}`);

      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      if (this.skipSubscriptionIfSetToCancel && subscription.cancel_at_period_end) {
        console.log(`Skipping subscription ${subscription.id} as it is set to cancel at period end`);
        return;
      }

      if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        throw new Error(`Sub is not in active state: ${subscription.status}, ${subscription.id}`);
      }

      const customer = await this.fetchCustomer(customerId);
      if (!customer?.subscriptions?.data) {
        throw new Error(`Customer not found: ${customerId}`);
      }
      const isExcluded = this.isCustomerExcluded(customer.subscriptions.data);

      const destinationPriceCurrencyOptionForCurrency = destinationPrice.currency_options?.[subscription.currency];
      const destinationPriceUnitAmountForCurrency = 
        destinationPriceCurrencyOptionForCurrency?.unit_amount ??
        (typeof destinationPriceCurrencyOptionForCurrency?.unit_amount_decimal === "string"
          ? Math.round(parseFloat(destinationPriceCurrencyOptionForCurrency.unit_amount_decimal))
          : null);

      let amountRefunded: number | null = null;
      let approximateAmountWasOwed: number | null = null;
      let daysUntilNextBill: number | null = null;
      let daysSinceLastBill: number | null = null;
      let previousInvoiceAmountDue: number | null = null;
      let isOwed = !isExcluded;

      if (!isExcluded) {
        if (this.proratedRefundRate !== null) {
          try {
            const calculation = await this.calculateRefundAmount(subscription);
            approximateAmountWasOwed = calculation.refundAmount;
            daysUntilNextBill = calculation.daysUntilBill;
            daysSinceLastBill = calculation.daysSinceBill;
            previousInvoiceAmountDue = calculation.invoice.amount_due;
          } catch(e) {
            console.warn(e);
          }
        }

        if (!this.dryRun) {
          await this.enqueueRequest(() =>
            this.stripe.subscriptions.update(subscription.id, {
              items: [{
                id: subscription.items.data[0].id,
                price: this.destinationPlanId
              }],
              discounts: this.coupon ? [{
                coupon: this.coupon
              }] : undefined,
              proration_behavior: this.prorationBehavior,
              metadata: {
                currency: subscription.currency,
                plan_change_date: Math.floor(new Date().getTime() / 1000),
                previous_plan_id: this.sourcePlanId,
                amount: destinationPriceUnitAmountForCurrency,
              },
              billing_cycle_anchor: this.resetBillingCycleAnchor ? "now" : "unchanged"
            })
          );
        }

        if (this.proratedRefundRate === null) {
          isOwed = false;
          amountRefunded = null;
        } else {
          try {
            amountRefunded = await this.attemptRefund(subscription);
            isOwed = false;
          } catch(e) {
            console.log(`Failed to issue a refund for ${customerId} ${e}`);
            isOwed = true;
          }
        }
      }

      await this.writeReport({
        subscription,
        customer,
        isExcluded,
        amountRefunded,
        approximateAmountWasOwed,
        daysUntilNextBill,
        daysSinceLastBill,
        previousInvoiceAmountDue,
        isOwed,
        error: false,
      });

      console.log(`Processed ${subscription.id}`);
    } catch (e) {
      console.error(subscription.id, e);
      await this.writeReport({
        subscription,
        customer: null,
        isExcluded: false,
        amountRefunded: null,
        approximateAmountWasOwed: null,
        daysUntilNextBill: null,
        daysSinceLastBill: null,
        previousInvoiceAmountDue: null,
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
  async fetchCustomer(customerId: string) {
    const customer = await this.enqueueRequest(() =>
      this.stripe.customers.retrieve(customerId, {
        expand: ['subscriptions'],
      })
    );

    if (customer.deleted) return null;

    return customer;
  }

  /**
   * Calculate the refund amount and days since last bill for a subscription
   * @param subscription The subscription to calculate for
   * @returns Object containing refundAmount, daysSinceBill, and invoice
   */
  async calculateRefundAmount(subscription: Stripe.Subscription): Promise<{ refundAmount: number, daysUntilBill: number, daysSinceBill: number, invoice: Stripe.Invoice }> {
    if (!this.proratedRefundRate) {
      throw new Error("proratedRefundRate must be specified to use calculateRefundAmount");
    }

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

    const lastBilledAt = new Date(subscription.current_period_start * 1000);
    const timeSinceBillMs = new Date().getTime() - lastBilledAt.getTime();
    const daysSinceBill = Math.floor(timeSinceBillMs / oneDayMs);

    const nextBillAt = new Date(subscription.current_period_end * 1000);
    const timeUntilBillMs = nextBillAt.getTime() - new Date().getTime();
    const daysUntilBill = Math.floor(timeUntilBillMs / oneDayMs);

    const refundAmount = daysUntilBill * this.proratedRefundRate;

    return { refundAmount, daysUntilBill, daysSinceBill, invoice };
  }

  /**
   * Attempt to refund customer for latest bill considering the prorated refund amount
   * @param subscription The subscription to cancel
   */
  async attemptRefund(subscription: Stripe.Subscription) {
    const calculation = await this.calculateRefundAmount(subscription);
    const refundAmount = calculation.refundAmount;
    const invoice = calculation.invoice;

    if (refundAmount > invoice.amount_due) {
      throw new Error(`Will not refund ${invoice.id} for ${refundAmount} as it would eclipse the amount due on the invoice`);
    }

    if (refundAmount <= 0) {
      throw new Error(`Will not refund ${invoice.id} for ${refundAmount} as it is less than or equal to zero`);
    }

    if (invoice.paid_out_of_band) {
      const behavior = refundAmount === invoice.amount_due ? {
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
  isCustomerExcluded(subscriptions: Stripe.Subscription[]) {
    for (const subscription of subscriptions) {
      for (const item of subscription.items.data) {
        if (this.excludeCustomersHavingPriceIds.includes(item.plan.id)) return true;
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
      "daysUntilNextBill",
      "daysSinceLastBill",
      "previousInvoiceAmountDue",
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
    daysUntilNextBill: number | null,
    daysSinceLastBill: number | null,
    previousInvoiceAmountDue: number | null,
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
      args.daysUntilNextBill ?? "null",
      args.daysSinceLastBill ?? "null",
      args.previousInvoiceAmountDue ?? "null",
      args.isOwed,
      args.error
    ];

    const reportCSV = data.join(',') + '\n';

    console.log(reportCSV);
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

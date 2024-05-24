/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { Firestore } from '@google-cloud/firestore';
import Container from 'typedi';
import fs from 'fs';
import PQueue from 'p-queue-compat';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import { StripeHelper } from '../../lib/payments/stripe';
import { PayPalHelper } from 'packages/fxa-auth-server/lib/payments/paypal';

/**
 * Firestore subscriptions contain additional expanded information
 * on top of the base Stripe.Subscription type
 */
export interface FirestoreSubscription extends Stripe.Subscription {
  customer: string;
  plan: Stripe.Plan;
  price: Stripe.Price;
}

export class PlanCanceller {
  private config: ConfigType;
  private firestore: Firestore;
  private stripeQueue: PQueue;
  private stripe: Stripe;

  /**
   * A tool to cancel all subscriptions under a plan
   * @param priceId A Stripe plan or price ID for which all subscriptions will be cancelled
   * @param refund If true, all subscriptions will have their last charge reversed to their card, regardless of remaining time
   * @param prorate If true, all subscriptions cancellations will generate a proration invoice item that credits remaining time
   * @param excludePlanIds A list of Stripe plan or price ID which if customers have will not be subscribed to the destination plan
   * @param batchSize Number of subscriptions to fetch from Firestore at a time
   * @param outputFile A CSV file to output a report of affected subscriptions to
   * @param stripeHelper An instance of StripeHelper
   * @param rateLimit A limit for number of stripe requests within the period of 1 second
   * @param database A reference to the FXA database
   */
  constructor(
    private priceId: string,
    private refund: boolean,
    private prorate: boolean,
    private excludePlanIds: string[],
    private batchSize: number,
    private outputFile: string,
    private stripeHelper: StripeHelper,
    private paypalHelper: PayPalHelper,
    private database: any,
    public dryRun: boolean,
    rateLimit: number
  ) {
    this.stripe = this.stripeHelper.stripe;

    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // Stripe measures its rate limit per second
    });
  }

  /**
   * Cancel all customer subscriptions in batches
   */
  async run(): Promise<void> {
    let startAfter: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const subscriptions = await this.fetchSubsBatch(startAfter);

      startAfter = subscriptions.at(-1)?.id as string;
      if (!startAfter) hasMore = false;

      await Promise.all(
        subscriptions.map((sub) => this.processSubscription(sub))
      );
    }
  }

  /**
   * Fetches subscriptions from Firestore paginated by batchSize
   * @param startAfter ID of the last element of the previous batch for pagination
   * @returns A list of subscriptions from firestore
   */
  async fetchSubsBatch(
    startAfter: string | null
  ): Promise<FirestoreSubscription[]> {
    const collectionPrefix = `${this.config.authFirestore.prefix}stripe-`;
    const subscriptionCollection = `${collectionPrefix}subscriptions`;

    const subscriptionSnap = await this.firestore
      .collectionGroup(subscriptionCollection)
      .where('plan.id', '==', this.priceId)
      .orderBy('id')
      .startAfter(startAfter)
      .limit(this.batchSize)
      .get();

    const subscriptions = subscriptionSnap.docs.map(
      (doc) => doc.data() as FirestoreSubscription
    );

    return subscriptions;
  }

  /**
   * Attempts to cancel a firestore subscription
   * @param firestoreSubscription The subscription to cancel
   */
  async processSubscription(
    firestoreSubscription: FirestoreSubscription
  ): Promise<void> {
    const { id: subscriptionId, customer: customerId } = firestoreSubscription;

    try {
      const customer = await this.fetchCustomer(customerId);
      if (!customer?.subscriptions?.data) {
        console.error(`Customer not found: ${customerId}`);
        return;
      }

      const account = await this.database.account(customer.metadata.userid);
      if (!account) {
        console.error(`Account not found: ${customer.metadata.userid}`);
        return;
      }

      const isExcluded = this.isCustomerExcluded(customer.subscriptions.data);

      if (!this.dryRun && !isExcluded) {
        await this.cancelSubscription(firestoreSubscription);
      }

      const report = this.buildReport(customer, account, isExcluded);

      await this.writeReport(report);

      console.log(subscriptionId);
    } catch (e) {
      console.error(subscriptionId, e);
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

  /**
   * Cancel subscription and refund customer for latest bill
   * @param subscription The subscription to cancel
   */
  async cancelSubscription(subscription: Stripe.Subscription): Promise<void> {
    await this.enqueueRequest(() =>
      this.stripe.subscriptions.cancel(subscription.id, {
        prorate: this.prorate,
      })
    );

    if (!this.refund) return;

    if (!subscription.latest_invoice) {
      console.log(`No latest invoice for ${subscription.id}`);
      return;
    }

    const latestInvoiceId =
      typeof subscription.latest_invoice === 'string'
        ? subscription.latest_invoice
        : subscription.latest_invoice.id;

    const invoice = await this.enqueueRequest(() =>
      this.stripe.invoices.retrieve(latestInvoiceId)
    );

    if (invoice.collection_method === 'send_invoice') {
      console.log(`Issuing Paypal refund for ${invoice.id}`);
      await this.paypalHelper.refundInvoice(invoice);
    } else {
      const chargeId =
        typeof invoice.charge === 'string'
          ? invoice.charge
          : invoice.charge?.id;
      if (!chargeId) {
        console.log(`No charge for ${invoice.id}`);
        return;
      }

      console.log(`Issuing Stripe refund for ${chargeId}`);
      await this.enqueueRequest(() =>
        this.stripe.refunds.create({
          charge: chargeId,
        })
      );
    }
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

  /**
   * Creates an ordered array of fields destined for CSV format
   * @returns An array representing the fields to be output to CSV
   */
  buildReport(
    customer: Stripe.Customer,
    account: any,
    isExcluded: boolean
  ): string[] {
    // We build a temporary object first for readability & maintainability purposes
    const report = {
      uid: customer.metadata.userid,
      email: customer.email,
      isExcluded: isExcluded.toString(),

      locale: account.locale,
    };

    return [
      report.uid,
      `"${report.email}"`,
      report.isExcluded,
      `"${report.locale}"`,
    ];
  }

  /**
   * Appends the report to the output file
   * @param report an array representing the report CSV
   */
  async writeReport(report: (string | number | null)[]): Promise<void> {
    const reportCSV = report.join(',') + '\n';

    await fs.promises.writeFile(this.outputFile, reportCSV, {
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

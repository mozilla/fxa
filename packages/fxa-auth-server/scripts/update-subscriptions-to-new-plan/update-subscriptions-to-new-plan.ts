/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { Firestore } from '@google-cloud/firestore';
import Container from 'typedi';
import fs from 'fs';
import PQueue from 'p-queue';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import { StripeHelper } from '../../lib/payments/stripe';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';

/**
 * Firestore subscriptions contain additional expanded information
 * on top of the base Stripe.Subscription type
 */
export interface FirestoreSubscription extends Stripe.Subscription {
  customer: string;
  plan: Stripe.Plan;
  price: Stripe.Price;
}

export class SubscriptionUpdater {
  private config: ConfigType;
  private firestore: Firestore;
  private stripeQueue: PQueue;
  private stripe: Stripe;

  /**
   * A converter to move customers from one plan to another
   * @param planIdMap A mapping where keys are source plan IDs and values are destination plan IDs, subscriptions with a matching source plan IDs will be moved to the destination plan ID
   * @param prorationBehavior Stripe proration behavior for the move
   * @param batchSize Number of subscriptions to fetch from Firestore at a time
   * @param outputFile A CSV file to output a report of affected subscriptions to
   * @param stripeHelper An instance of StripeHelper
   * @param database A reference to the FXA database
   * @param dryRun If true, does not change anything only outputs what would have been done
   * @param rateLimit A limit for number of stripe requests within the period of 1 second
   */
  constructor(
    private planIdMap: Record<string, string>,
    private prorationBehavior: Stripe.SubscriptionUpdateParams['proration_behavior'],
    private batchSize: number,
    private outputFile: string,
    private stripeHelper: StripeHelper,
    private database: any,
    public dryRun: boolean,
    rateLimit: number
  ) {
    this.stripe = stripeHelper.stripe;

    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // Stripe measures it's rate limit per second
    });
  }

  /**
   * Update all subscriptions from any plan listed in the map to the destination plans in batches
   */
  async update() {
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
  async fetchSubsBatch(startAfter: string | null) {
    const collectionPrefix = `${this.config.authFirestore.prefix}stripe-`;
    const subscriptionCollection = `${collectionPrefix}subscriptions`;

    const subscriptionSnap = await this.firestore
      .collectionGroup(subscriptionCollection)
      .where('plan.id', 'in', Object.keys(this.planIdMap))
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
   * Checks and attempts to move a subscription off of a plan listed in the plan map
   * @param firestoreSubscription The subscription to convert
   */
  async processSubscription(firestoreSubscription: FirestoreSubscription) {
    const {
      id: subscriptionId,
      customer: customerId,
      status,
    } = firestoreSubscription;

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

      if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(status)) {
        console.log(`Sub is not in active state: ${status},${subscriptionId}`);
        return;
      }

      if (!this.dryRun) {
        await this.updateSubscription(firestoreSubscription);
      }

      const report = this.buildReport(customer, account);

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
   * Update a subscription from any plan listed in the plan ID map to the corresponding destination plan
   * @param subscription The subscription to convert
   */
  async updateSubscription(_subscription: Stripe.Subscription) {
    const subscription = await this.enqueueRequest(() =>
      this.stripe.subscriptions.retrieve(_subscription.id)
    );

    const updatedItems = subscription.items.data
      .map((item): Stripe.SubscriptionUpdateParams.Item | null => {
        if (this.planIdMap[item.plan.id]) {
          return {
            id: item.id,
            plan: this.planIdMap[item.plan.id],
          };
        }

        return null;
      })
      .filter((item): item is Stripe.SubscriptionUpdateParams.Item => !!item);

    const firstUpdatedItem = updatedItems.at(0);
    if (!firstUpdatedItem) {
      console.log(
        `Warning: Initially, but did not subsequently match subscription item for ${subscription.id}`
      );
      return;
    }

    await this.enqueueRequest(() =>
      this.stripe.subscriptions.update(subscription.id, {
        proration_behavior: this.prorationBehavior,
        items: updatedItems,
        metadata: {
          previous_plan_id: subscription.items.data[0].plan.id,
          plan_change_date: Math.round(new Date().getTime() / 1000), // Expected to be in seconds since epoch
        },
      })
    );
  }

  /**
   * Creates an ordered array of fields destined for CSV format
   * @returns An array representing the fields to be output to CSV
   */
  buildReport(customer: Stripe.Customer, account: any) {
    // We build a temporary object first for readability & maintainability purposes
    const report = {
      uid: customer.metadata.userid,
      email: customer.email,

      locale: account.locale,
    };

    return [report.uid, `"${report.email}"`, `"${report.locale}"`];
  }

  /**
   * Appends the report to the output file
   * @param report an array representing the report CSV
   */
  async writeReport(report: (string | number | null)[]) {
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

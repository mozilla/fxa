/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { Firestore } from '@google-cloud/firestore';
import Container from 'typedi';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import {
  FirestoreSubscription,
  IpAddressMap,
  StripeAutomaticTaxConverterHelpers,
} from './helpers';

export class StripeAutomaticTaxConverter {
  private config: ConfigType;
  private firestore: Firestore;
  private ipAddressMap: IpAddressMap;
  private helpers: StripeAutomaticTaxConverterHelpers;

  /**
   * A converter to update all eligible customers to Stripe automatic tax
   * @param isDryRun Makes no changes to Stripe, only prints information
   * @param batchSize Number of subscriptions to fetch from Firestore at a time
   * @param outputFile A CSV file to output a report of affected subscriptions to
   */
  constructor(
    private isDryRun: boolean,
    private batchSize: number,
    private outputFile: string,
    private stripe: Stripe
  ) {
    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.helpers =
      Container.get(StripeAutomaticTaxConverterHelpers) ||
      new StripeAutomaticTaxConverterHelpers();

    // TODO FXA-6581: Populate this with a JSON file
    this.ipAddressMap = {};
  }

  /**
   * Converts all eligible customers to Stripe tax given the following constraints:
   * 1. Customer must exist in the provided IP address mapping
   * 2. Stripe must be able to place the customer in a taxable location
   * 3. Upcoming subscription renewal must be more than 14 days in the future for
   *   1 month subscriptions, and more than 30 days in the future for 6 month and
   *   yearly subscriptions.
   */
  async convert() {
    let startAfter: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const subscriptions = await this.fetchSubsBatch(startAfter);

      startAfter = subscriptions.at(-1)?.id as string;
      if (!startAfter) hasMore = false;

      const applicableSubs =
        this.helpers.filterEligibleSubscriptions(subscriptions);

      for (const applicableSub of applicableSubs) {
        await this.generateReportForSubscription(applicableSub);
      }
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
      .where('automatic_tax.enabled', '==', false)
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
   * Attemps to enable Stripe automatic tax for a given subscription
   * from Firestore and record the details in the CSV file specified
   * @param firestoreSubscription The subscription to enable automatic tax for
   */
  async generateReportForSubscription(
    firestoreSubscription: FirestoreSubscription
  ) {
    const {
      id: subscriptionId,
      customer: customerId,
      plan,
    } = firestoreSubscription;

    try {
      const product = await this.stripe.products.retrieve(
        plan.product as string
      );

      const customer = await this.fetchCustomer(customerId);
      if (!customer) return; // Do not enable tax for an invalid customer

      // TODO FXA-6580: Update customer
      console.log(subscriptionId, product, customer);

      // TODO FXA-6581: Write report to CSV
    } catch (e) {
      // TODO FXA-6581: Error output formatting
      console.error(e);
    }
  }

  /**
   * Retrieves a customer record directly from Stripe
   * @param customerId The Stripe customer ID of the customer to fetch
   * @returns The customer record for the customerId provided, or null if not found or deleted
   */
  async fetchCustomer(customerId: string) {
    const customer = await this.stripe.customers.retrieve(customerId, {
      expand: ['tax'],
    });

    if (customer.deleted) return null;

    return customer;
  }
}

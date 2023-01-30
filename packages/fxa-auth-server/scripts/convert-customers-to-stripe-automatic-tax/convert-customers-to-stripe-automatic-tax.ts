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

      const taxEnabled = await this.enableTaxForCustomer(customer);
      if (!taxEnabled) return; // Do not enable tax if customer is not taxable

      await this.enableTaxForSubscription(subscriptionId);

      const invoicePreview = await this.fetchInvoicePreview(subscriptionId);

      const report = this.buildReport(
        customer,
        firestoreSubscription,
        product,
        plan,
        invoicePreview
      );

      // TODO FXA-6581: Write report to CSV
      console.log('report:', report);
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

  /**
   * Updates a customer's IP address and enables Stripe automatic tax
   * @param customer A Stripe customer with the `tax` field expanded
   * @returns True if customer is now taxable, or false if customer cannot be taxed
   */
  async enableTaxForCustomer(customer: Stripe.Customer) {
    if (this.helpers.isTaxEligible(customer)) return true;

    // TODO FXA-6581: Handle ip address map unknown customer
    await this.stripe.customers.update(customer.id, {
      tax: {
        ip_address: this.ipAddressMap[customer.id],
      },
    });

    const updatedCustomer = await this.fetchCustomer(customer.id);

    const isTaxEligible =
      !!updatedCustomer && this.helpers.isTaxEligible(updatedCustomer);

    return isTaxEligible;
  }

  /**
   * Updates a Stripe subscription with automatic tax enabled
   * @param subscriptionId Subscription to enable automatic tax for
   * @returns Updated subscription
   */
  enableTaxForSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      automatic_tax: {
        enabled: true,
      },
    });
  }

  /**
   * Get an expanded invoice preview
   * @param subscriptionId The subscription to fetch an invoice preview for
   * @returns A Stripe invoice preview with tax rates expanded
   */
  fetchInvoicePreview(subscriptionId: string) {
    return this.stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
      expand: ['total_tax_amounts.tax_rate'],
    });
  }

  /**
   * Creates an ordered array of fields destined for CSV format
   * in the order described by the Stripe Tax for Existing Customers PRD
   * @returns An array representing the fields to be output to CSV
   */
  buildReport(
    customer: Stripe.Customer,
    subscription: Stripe.Subscription,
    product: Stripe.Product,
    plan: Stripe.Plan,
    invoicePreview: Stripe.Invoice
  ) {
    const { hst, pst, gst, qst, rst } = this.helpers.getSpecialTaxAmounts(
      invoicePreview.total_tax_amounts
    );

    // We build a temporary object first for readability & maintainability purposes
    const report = {
      uid: customer.metadata.userid,
      email: customer.email,

      productId: product.id,
      productName: product.name,
      planId: plan.id,
      planName: plan.nickname, // TODO FXA-6581: Confirm this field
      planInterval: plan.interval_count,
      planIntervalUnit: plan.interval,

      baseAmount: invoicePreview.total_excluding_tax,
      taxAmount: invoicePreview.tax,
      hst,
      gst,
      pst,
      qst,
      rst,

      totalAmount: invoicePreview.total,
      nextInvoice: subscription.current_period_end,
    };

    return [
      report.uid,
      report.email,
      report.productId,
      report.productName,
      report.planId,
      report.planName,
      report.planInterval,
      report.planIntervalUnit,
      report.baseAmount,
      report.taxAmount,
      report.hst,
      report.gst,
      report.pst,
      report.qst,
      report.rst,
      report.totalAmount,
      report.nextInvoice,
    ];
  }
}

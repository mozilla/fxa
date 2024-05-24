/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import { Firestore } from '@google-cloud/firestore';
import Container from 'typedi';
import fs from 'fs';
import GeoDB from 'fxa-geodb';
import PQueue from 'p-queue-compat';

import { AppConfig, AuthFirestore } from '../../lib/types';
import { ConfigType } from '../../config';
import {
  FirestoreSubscription,
  IpAddressMap,
  StripeAutomaticTaxConverterHelpers,
} from './helpers';
import { StripeHelper } from '../../lib/payments/stripe';

export class StripeAutomaticTaxConverter {
  private config: ConfigType;
  private firestore: Firestore;
  private ipAddressMap: IpAddressMap;
  private helpers: StripeAutomaticTaxConverterHelpers;
  private stripeQueue: PQueue;
  private stripe: Stripe;
  private ineligibleProducts: string[];

  /**
   * A converter to update all eligible customers to Stripe automatic tax
   * @param geodb An instantiated instance of fxa-geodb for IP->location purposes
   * @param batchSize Number of subscriptions to fetch from Firestore at a time
   * @param outputFile A CSV file to output a report of affected subscriptions to
   * @param ipAddressMapFile A path to a file to write the report results out to
   * @param stripe An instance of Stripe
   * @param rateLimit A limit for number of stripe requests within the period of 1 second
   */
  constructor(
    private geodb: ReturnType<typeof GeoDB>,
    private batchSize: number,
    private outputFile: string,
    ipAddressMapFile: string,
    private stripeHelper: StripeHelper,
    rateLimit: number,
    private database: any
  ) {
    this.stripe = stripeHelper.stripe;

    const config = Container.get<ConfigType>(AppConfig);
    this.config = config;

    const firestore = Container.get<Firestore>(AuthFirestore);
    this.firestore = firestore;

    this.helpers =
      Container.get(StripeAutomaticTaxConverterHelpers) ||
      new StripeAutomaticTaxConverterHelpers();

    this.stripeQueue = new PQueue({
      intervalCap: rateLimit,
      interval: 1000, // Stripe measures it's rate limit per second
    });

    const ipAddressList = JSON.parse(
      fs.readFileSync(ipAddressMapFile, 'utf-8')
    );
    this.ipAddressMap = this.helpers.processIPAddressList(ipAddressList);

    this.ineligibleProducts = ['prod_HEJ13uxjG4Rj6L', 'prod_HeWOjYtYcEjAzV'];
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

      await Promise.all(
        applicableSubs.map((applicableSub) =>
          this.generateReportForSubscription(applicableSub)
        )
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
      const product = await this.fetchProduct(plan.product as string);

      const priorInvoicePreview = await this.fetchInvoicePreview(
        subscriptionId
      );

      const isExcludedProduct = this.isExcludedSubscriptionProduct(product.id);
      if (isExcludedProduct) return; // Return early if subscription is for excluded product

      const customer = await this.fetchCustomer(customerId);
      // Do not enable tax for an invalid customer
      if (!customer) {
        console.error(`Customer not found: ${customerId}`);
        return;
      }

      const account = await this.database.account(customer.metadata.userid);
      // Do not enable tax for a customer with no associated account
      if (!account) {
        console.error(`Account not found: ${customer.metadata.userid}`);
        return;
      }

      const taxEnabled = await this.enableTaxForCustomer(customer);
      // Do not enable tax if customer is not taxable
      if (!taxEnabled) {
        console.warn(
          `Unable to place customer in taxable location: ${customer.id}`
        );
        return;
      }

      await this.enableTaxForSubscription(subscriptionId);

      const invoicePreview = await this.fetchInvoicePreview(subscriptionId);
      if (priorInvoicePreview.total === invoicePreview.total) {
        console.warn(`Invoice total does not differ: ${subscriptionId}`);
        return;
      }

      const report = this.buildReport(
        customer,
        account,
        firestoreSubscription,
        product,
        plan,
        invoicePreview
      );

      await this.writeReport(report);

      console.log(subscriptionId);
    } catch (e) {
      console.error(subscriptionId, e);
    }
  }

  /**
   * Retrieves a product record directly from Stripe
   */
  async fetchProduct(productId: string) {
    return this.enqueueRequest(() => this.stripe.products.retrieve(productId));
  }

  /**
   * Retrieves a customer record directly from Stripe
   * @param customerId The Stripe customer ID of the customer to fetch
   * @returns The customer record for the customerId provided, or null if not found or deleted
   */
  async fetchCustomer(customerId: string) {
    const customer = await this.enqueueRequest(() =>
      this.stripe.customers.retrieve(customerId, {
        expand: ['tax'],
      })
    );

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

    const ipAddress = this.ipAddressMap[customer.metadata.userid];
    if (!ipAddress) return false;

    const geoLocation = this.geodb(ipAddress);
    if (!geoLocation?.countryCode || !geoLocation?.postalCode) return false;

    const isCompatibleCountry =
      this.stripeHelper.currencyHelper.isCurrencyCompatibleWithCountry(
        customer.currency,
        geoLocation.countryCode
      );
    if (!isCompatibleCountry) return false;

    await this.enqueueRequest(() =>
      this.stripe.customers.update(customer.id, {
        shipping: {
          name: customer.email || '',
          address: {
            country: geoLocation.countryCode,
            postal_code: geoLocation.postalCode,
          },
        },
      })
    );

    const updatedCustomer = await this.fetchCustomer(customer.id);

    const isTaxEligible =
      !!updatedCustomer && this.helpers.isTaxEligible(updatedCustomer);

    return isTaxEligible;
  }

  /**
   * Check if the subscriptions product is eligible to enable Tax
   * @param productId
   * @returns
   */
  isExcludedSubscriptionProduct(productId: string) {
    return this.ineligibleProducts.includes(productId);
  }

  /**
   * Updates a Stripe subscription with automatic tax enabled
   * @param subscriptionId Subscription to enable automatic tax for
   * @returns Updated subscription
   */
  async enableTaxForSubscription(subscriptionId: string) {
    const subscription = await this.enqueueRequest(() =>
      this.stripe.subscriptions.retrieve(subscriptionId)
    );

    // https://stripe.com/docs/tax/subscriptions/update#existing-tax-rates
    return this.enqueueRequest(() =>
      this.stripe.subscriptions.update(subscriptionId, {
        automatic_tax: {
          enabled: true,
        },
        proration_behavior: 'none',
        items: subscription.items.data.map((item) => ({
          id: item.id,
          tax_rates: '',
        })),
        default_tax_rates: '',
      })
    );
  }

  /**
   * Get an expanded invoice preview
   * @param subscriptionId The subscription to fetch an invoice preview for
   * @returns A Stripe invoice preview with tax rates expanded
   */
  async fetchInvoicePreview(subscriptionId: string) {
    return this.enqueueRequest(() =>
      this.stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
        expand: ['total_tax_amounts.tax_rate'],
      })
    );
  }

  /**
   * Creates an ordered array of fields destined for CSV format
   * in the order described by the Stripe Tax for Existing Customers PRD
   * @returns An array representing the fields to be output to CSV
   */
  buildReport(
    customer: Stripe.Customer,
    account: any,
    subscription: Stripe.Subscription,
    product: Stripe.Product,
    plan: Stripe.Plan,
    invoicePreview: Stripe.UpcomingInvoice
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

      locale: account.locale,
    };

    return [
      report.uid,
      `"${report.email}"`,
      report.productId,
      `"${report.productName}"`,
      report.planId,
      `"${report.planName}"`,
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
      `"${report.locale}"`,
    ];
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

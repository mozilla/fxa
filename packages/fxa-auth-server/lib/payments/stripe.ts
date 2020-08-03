/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as Sentry from '@sentry/node';
import cacheManager, { Cacheable, CacheClear } from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import { StatsD } from 'hot-shots';
import ioredis from 'ioredis';
import moment from 'moment';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';

import { ConfigType } from '../../config';
import error from '../error';
import Redis from '../redis';

export type AbbrevProduct = {
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
};

export type AbbrevPlan = {
  amount: Stripe.Plan['amount'];
  currency: Stripe.Plan['currency'];
  interval_count: Stripe.Plan['interval_count'];
  interval: Stripe.Plan['interval'];
  plan_id: string;
  plan_metadata: Stripe.Plan['metadata'];
  plan_name: string;
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
};

const CUSTOMER_RESOURCE = 'customers';
const SUBSCRIPTIONS_RESOURCE = 'subscriptions';
const PRODUCT_RESOURCE = 'products';
const PLAN_RESOURCE = 'plans';
const CHARGES_RESOURCE = 'charges';
const INVOICES_RESOURCE = 'invoices';

const VALID_RESOURCE_TYPES = [
  CUSTOMER_RESOURCE,
  SUBSCRIPTIONS_RESOURCE,
  PRODUCT_RESOURCE,
  PLAN_RESOURCE,
  CHARGES_RESOURCE,
  INVOICES_RESOURCE,
];

export const SUBSCRIPTION_UPDATE_TYPES = {
  UPGRADE: 'upgrade',
  DOWNGRADE: 'downgrade',
  REACTIVATION: 'reactivation',
  CANCELLATION: 'cancellation',
};

/**
 * Determine for two product metadata object's whether the new one
 * is a valid upgrade for the old one.
 *
 * Throws errors if necessary metadata is not present to determine
 * if its an upgrade.
 *
 * @param {AbbrevProduct['product_metadata']} oldMetadata Old product metadata
 * @param {AbbrevProduct['product_metadata']} newMetadata New product metadata
 * @returns {boolean} Whether the new product is an upgrade.
 */
function validateProductUpdate(
  oldMetadata: AbbrevProduct['product_metadata'],
  newMetadata: AbbrevProduct['product_metadata']
): boolean {
  if (!oldMetadata || !newMetadata) {
    throw error.unknownSubscriptionPlan();
  }

  const oldId = oldMetadata.productSet;
  const newId = newMetadata.productSet;
  if (!oldId || oldId !== newId) {
    // Incompatible product sets
    return false;
  }
  const oldOrder = Number.parseInt(oldMetadata.productOrder);
  const newOrder = Number.parseInt(newMetadata.productOrder);
  if (isNaN(oldOrder) || isNaN(newOrder)) {
    throw error.unknownSubscriptionPlan();
  }
  return oldOrder !== newOrder;
}

export class StripeHelper {
  // Note that this isn't quite accurate, as the auth-server logger has some extras
  // attached to it in Hapi.
  private log: Logger;
  private plansAndProductsCacheTtlSeconds: number;
  private webhookSecret: string;
  private stripe: Stripe;
  private redis: ioredis.Redis | undefined;

  /**
   * Create a Stripe Helper with built-in caching.
   */
  constructor(log: Logger, config: ConfigType, statsd?: StatsD) {
    this.log = log;
    this.plansAndProductsCacheTtlSeconds = config.subhub.plansCacheTtlSeconds;
    this.webhookSecret = config.subscriptions.stripeWebhookSecret;
    // TODO (FXA-949 / issue #3922): The TTL setting here is serving double-duty for
    // both TTL and whether caching should be enabled at all. We should
    // introduce a second setting for cache enable / disable.
    const redis = this.plansAndProductsCacheTtlSeconds
      ? Redis(
          {
            ...config.redis,
            ...config.redis.subhub,
          },
          log
        )?.redis
      : undefined;

    this.stripe = new Stripe(config.subscriptions.stripeApiKey, {
      apiVersion: '2020-03-02',
      maxNetworkRetries: 3,
    });
    cacheManager.setOptions({
      // Ensure the StripeHelper instance is passed into TTLBuilder functions
      excludeContext: false,
    });
    this.redis = redis;
    if (this.redis) {
      useAdapter(this.redis);
    }

    if (statsd) {
      this.stripe.on('response', (response) => {
        statsd.timing('stripe_request', response.elapsed);
      });
    }
  }

  /**
   * Fetch all product data and cache it if Redis is enabled.
   *
   * Use `allProducts` below to use the cached-enhanced version.
   *
   * @returns {Promise<AbbrevProduct[]>} All the products.
   */
  async fetchAllProducts() {
    const products = [];
    for await (const product of this.stripe.products.list()) {
      products.push(this.abbrevProductFromStripeProduct(product));
    }
    return products;
  }

  /**
   * Extract an AbbrevProduct from Stripe Product
   */
  abbrevProductFromStripeProduct(product: Stripe.Product): AbbrevProduct {
    return {
      product_id: product.id,
      product_name: product.name,
      product_metadata: product.metadata,
    };
  }

  /**
   * Fetches all products from stripe and returns them.
   *
   * Uses Redis caching if configured.
   *
   * @returns {Promise<AbbrevProduct[]>} All the products.
   */
  @Cacheable({
    cacheKey: 'listProducts',
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allProducts() {
    return this.fetchAllProducts();
  }

  /** BEGIN: NEW FLOW HELPERS FOR PAYMENT METHODS
   *
   * The following methods until the END are for the new payment method
   * oriented flows that utilize client logic to determine appropriate actions.
   *
   **/

  /**
   * Create a stripe customer.
   */
  async createPlainCustomer(
    uid: string,
    email: string,
    displayName: string,
    idempotencyKey: string
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create(
      {
        email,
        name: displayName,
        description: uid,
        metadata: { userid: uid },
      },
      {
        idempotency_key: idempotencyKey,
      }
    );
  }

  /**
   * Update an existing customer to use a new payment method id.
   */
  async retryInvoiceWithPaymentId(
    customerId: string,
    invoiceId: string,
    paymentMethodId: string,
    idempotencyKey: string
  ) {
    try {
      await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        },
        { idempotencyKey }
      );
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
    return this.stripe.invoices.retrieve(invoiceId, {
      expand: ['payment_intent'],
    });
  }

  /**
   * Create a subscription for the provided customer.
   */
  async createSubscriptionWithPMI(opts: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    subIdempotencyKey: string;
  }) {
    const { customerId, priceId, paymentMethodId, subIdempotencyKey } = opts;

    if (paymentMethodId) {
      try {
        await this.stripe.paymentMethods.attach(
          paymentMethodId,
          {
            customer: customerId,
          },
          { idempotencyKey: `pma-${subIdempotencyKey}` }
        );
      } catch (err) {
        if (err.type === 'StripeCardError') {
          throw error.rejectedSubscriptionPaymentToken(err.message, err);
        }
        throw err;
      }
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    return this.stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      },
      { idempotencyKey: `ssc-${subIdempotencyKey}` }
    );
  }

  /**
   * Create a SetupIntent for a customer.
   */
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({ customer: customerId });
  }

  /**
   * Updates the default payment method used for invoices for the customer
   */
  async updateDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  /** END: NEW FLOW HELPERS FOR PAYMENT METHODS **/

  /**
   * Create a stripe customer
   */
  async createCustomer(
    uid: string,
    email: string,
    displayName: string,
    paymentToken: string,
    idempotencyKey: string
  ): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create(
        {
          source: paymentToken,
          email,
          name: displayName,
          description: uid,
          metadata: { userid: uid },
        },
        {
          idempotency_key: idempotencyKey,
        }
      );
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
  }

  /**
   * Fetch a customer record from Stripe by id and return its userid metadata
   * and the email.
   */
  async getCustomerUidEmailFromSubscription(sub: Stripe.Subscription) {
    if (typeof sub.customer !== 'string')
      throw error.internalValidationError(
        'getCustomerUidEmailFromSubscription',
        { sub_id: sub.id }
      );
    const customer = await this.stripe.customers.retrieve(sub.customer);
    if (customer.deleted) {
      // Deleted customers lost their metadata so we can't send events for them
      return { uid: null, email: null };
    }
    const uid = customer.metadata.userid;
    const email = customer.email;
    if (!uid || !email) {
      const message = !uid
        ? 'FxA UID does not exist on customer metadata.'
        : 'Stripe customer is missing email';
      Sentry.withScope((scope) => {
        scope.setContext('stripeEvent', {
          customer: { id: customer.id },
        });
        Sentry.captureMessage(message, Sentry.Severity.Error);
      });
      throw error.internalValidationError(
        'getCustomerUidEmailFromSubscription',
        customer,
        new Error(message)
      );
    }
    return {
      uid,
      email,
    };
  }

  /**
   * Update a customer's default payment method
   */
  async updateCustomerPaymentMethod(
    customerId: string,
    paymentToken: string
  ): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.update(customerId, {
        source: paymentToken,
      });
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
  }

  /**
   * Fetch a customer for the record from Stripe based on email.
   */
  async fetchCustomer(
    uid: string,
    email: string,
    expand?: string[]
  ): Promise<Stripe.Customer | void> {
    const customerResponse = await this.stripe.customers
      .list({ email, expand })
      .autoPagingToArray({ limit: 20 });
    if (customerResponse.length === 0) {
      return;
    }
    const customer = customerResponse[0];

    if (customer.metadata.userid !== uid) {
      // Duplicate email with non-match uid
      const err = new Error(
        `Customer for email: ${email} in Stripe has mismatched uid`
      );
      throw error.backendServiceFailure('stripe', 'fetchCustomer', {}, err);
    }

    // We need to get all the subscriptions for a customer
    if (customer.subscriptions && customer.subscriptions.has_more) {
      const additionalSubscriptions = await this.fetchAllSubscriptionsForCustomer(
        customer.id,
        customer.subscriptions.data[customer.subscriptions.data.length - 1].id
      );
      customer.subscriptions.data.push(...additionalSubscriptions);
      customer.subscriptions.has_more = false;
    }

    return customer;
  }

  static customerCacheKey = (args: any[]) => `customer-${args[0]}|${args[1]}`;

  @Cacheable({
    cacheKey: StripeHelper.customerCacheKey,
    // Note: No TTL specified here, because we don't want customers to expire (yet)
    // TODO (FXA-2383): Should track FxA users who are Customers with a persistent DB table
    // TODO (FXA-949 / issue #3922): Should establish a TTL specifically for Customer data
  })
  async cachedCustomer(
    uid: string,
    email: string
  ): Promise<Stripe.Customer | void> {
    return this.fetchCustomer(uid, email, [
      'data.sources',
      'data.subscriptions',
      'data.invoice_settings.default_payment_method',
    ]);
  }

  /**
   * Fetch a customer for the record from Stripe based on user ID & email.
   *
   * Uses Redis caching if configured.
   */
  async customer({
    uid,
    email,
    forceRefresh = false,
    cacheOnly = false,
  }: {
    uid: string;
    email: string;
    forceRefresh?: boolean;
    cacheOnly?: boolean;
  }): Promise<Stripe.Customer | undefined> {
    if (cacheOnly) {
      return (
        (await cacheManager.client?.get(
          StripeHelper.customerCacheKey([uid, email])
        )) || undefined
      );
    }
    if (forceRefresh) {
      await this.removeCustomerFromCache(uid, email);
    }
    return (await this.cachedCustomer(uid, email)) || undefined;
  }

  /**
   * On FxA deletion, if the user is a Stripe Customer:
   * - flag the stripe customer to delete
   * - remove the cache entry
   */
  async removeCustomer(uid: string, email: string) {
    const customer = await this.fetchCustomer(uid, email);
    if (customer) {
      await this.stripe.customers.update(customer.id, {
        metadata: { delete: 'true' },
      });
      await this.removeCustomerFromCache(uid, email);
    }
  }

  /**
   * Fetch a subscription for a customer from Stripe.
   *
   * Uses Redis caching if configured.
   */
  async subscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<Stripe.Subscription | void> {
    const customer = await this.customer({ uid, email });
    if (!customer) {
      return;
    }

    return customer.subscriptions?.data.find(
      (subscription) => subscription.id === subscriptionId
    );
  }

  /**
   * Fetch a list of subscriptions for a customer from Stripe.
   */
  async fetchAllSubscriptionsForCustomer(
    customerId: string,
    startAfterSubscriptionId: string
  ): Promise<Stripe.Subscription[]> {
    let getMore = true;
    const subscriptions = [];
    let startAfter = startAfterSubscriptionId;

    while (getMore) {
      const moreSubs = await this.stripe.subscriptions.list({
        customer: customerId,
        starting_after: startAfter,
      });

      subscriptions.push(...moreSubs.data);

      getMore = moreSubs.has_more;
      startAfter = moreSubs.data[moreSubs.data.length - 1].id;
    }

    return subscriptions;
  }

  /**
   * Delete a cached customer record based on user ID & email.
   */
  async refreshCachedCustomer(
    uid: string,
    email: string
  ): Promise<Stripe.Customer | undefined> {
    try {
      return await this.customer({ uid, email, forceRefresh: true });
    } catch (err) {
      this.log.error(`subhub.refreshCachedCustomer.failed`, { err });
      return;
    }
  }

  /**
   * Remove the cache entry for a customer account
   * This is to be used on account deletion
   */
  @CacheClear({ cacheKey: StripeHelper.customerCacheKey })
  async removeCustomerFromCache(uid: string, email: string) {}

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Use `allPlans` below to use the cached-enhanced version.
   */
  async fetchAllPlans(): Promise<AbbrevPlan[]> {
    const plans = [];
    for await (const item of this.stripe.plans.list({
      active: true,
      expand: ['data.product'],
    })) {
      if (!item.product) {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" missing Product`,
          item
        );
        continue;
      }

      if (typeof item.product === 'string') {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" failed to load Product`,
          item
        );
        continue;
      }

      if (item.product.deleted === true) {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" associated with Deleted Product`,
          item
        );
        continue;
      }

      plans.push({
        amount: item.amount,
        currency: item.currency,
        interval_count: item.interval_count,
        interval: item.interval,
        plan_id: item.id,
        plan_metadata: item.metadata,
        plan_name: item.nickname || '',
        product_id: item.product.id,
        product_metadata: item.product.metadata,
        product_name: item.product.name,
      });
    }
    return plans;
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Uses Redis caching if configured.
   */
  @Cacheable({
    cacheKey: 'listPlans',
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allPlans(): Promise<AbbrevPlan[]> {
    return this.fetchAllPlans();
  }

  /**
   * Find a plan by id or error if its not a valid planId.
   */
  async findPlanById(planId: string): Promise<AbbrevPlan> {
    const plans = await this.allPlans();
    const selectedPlan = plans.find((p) => p.plan_id === planId);
    if (!selectedPlan) {
      throw error.unknownSubscriptionPlan(planId);
    }
    return selectedPlan;
  }

  /**
   * Verify that the `planId` is a valid upgrade for the `currentPlanId`.
   *
   * Throws an error if its an invalid upgrade.
   */
  async verifyPlanUpdateForSubscription(
    currentPlanId: string,
    newPlanId: string
  ): Promise<void> {
    const allPlans = await this.allPlans();
    const currentPlan = allPlans
      .filter((plan) => plan.plan_id === currentPlanId)
      .shift();

    const newPlan = allPlans
      .filter((plan) => plan.plan_id === newPlanId)
      .shift();
    if (!newPlan || !currentPlan) {
      throw error.unknownSubscriptionPlan();
    }

    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    if (
      !validateProductUpdate(
        currentPlan.product_metadata,
        newPlan.product_metadata
      )
    ) {
      throw error.invalidPlanUpdate();
    }
  }

  /**
   * Change a subscription to the new plan.
   *
   * Note that this call does not verify its a valid upgrade, the
   * `verifyPlanUpgradeForSubscription` should be done first to
   * validate this is an appropraite change for tier use.
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    const currentPlanId = subscription.items.data[0].plan.id;
    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    const updatedMetadata = {
      ...subscription.metadata,
      previous_plan_id: currentPlanId,
      plan_change_date: moment().unix(),
    };

    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          plan: newPlanId,
        },
      ],
      metadata: updatedMetadata,
    });
  }

  /**
   * Cancel a given subscription for a customer
   * If the subscription does not belong to the customer, throw an error
   */
  async cancelSubscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<void> {
    const subscription = await this.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: moment().unix(),
      },
    });
  }

  /**
   * Reactivate a given subscription for a customer
   * If a customer has an active subscription that is set to cancel at the period end:
   *  1. Update the subscription to remain active at the period end
   *  2. Verify that after the update the subscription is still in an active state
   *    True: return the updated Subscription
   *    False: throw an error
   * If the customer does not own the subscription, throw an error
   */
  async reactivateSubscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await this.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      const err = new Error(
        `Reactivated subscription (${subscriptionId}) is not active/trialing`
      );
      throw error.backendServiceFailure(
        'stripe',
        'reactivateSubscription',
        {},
        err
      );
    }

    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: '',
      },
    });
  }

  /**
   * Attempt to pay invoice by invoice id
   * Throws payment failed error on failure
   */
  async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    let invoice;

    try {
      invoice = await this.stripe.invoices.pay(invoiceId, {
        expand: ['payment_intent'],
      });
    } catch (err) {
      if (err.code === 'card_declined') {
        throw error.paymentFailed();
      }
      throw err;
    }

    if (!this.paidInvoice(invoice)) {
      throw error.paymentFailed();
    }

    return invoice;
  }

  /**
   * Wraps all of the necessary checks to ensure successful subscription creation
   *
   * 1. Calls Stripe Helper to Subscribe a Customer to a selected Plan
   * 2. Checks the status of the Invoice returned from the Subscription creation
   *  2a. If Invoice is marked as Paid: return newly created Subscription
   *  2b. If Invoice is NOT marked as Paid: throw error
   *
   * @throws {error.paymentFailed}
   */
  async createSubscription(
    customer: Stripe.Customer,
    selectedPlan: AbbrevPlan,
    idempotencyKey: string
  ): Promise<Stripe.Subscription> {
    let subscription;

    try {
      subscription = await this.stripe.subscriptions.create(
        {
          customer: customer.id,
          items: [{ plan: selectedPlan.plan_id }],
          expand: ['latest_invoice.payment_intent'],
        },
        {
          idempotency_key: idempotencyKey,
        }
      );
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }

    if (!this.paidInvoice(subscription.latest_invoice)) {
      throw error.paymentFailed();
    }
    return subscription;
  }

  /**
   * Verify that the invoice was paid successfully.
   *
   * Note that the invoice *must have the `payment_intent` expanded*
   * or this function will fail.
   */
  paidInvoice(invoice: Stripe.Subscription['latest_invoice']): boolean {
    if (
      !invoice ||
      typeof invoice === 'string' ||
      !invoice.payment_intent ||
      typeof invoice.payment_intent === 'string'
    ) {
      throw error.internalValidationError('paidInvoice', {
        invoice: invoice,
      });
    }
    return (
      invoice.status === 'paid' && invoice.payment_intent.status === 'succeeded'
    );
  }

  /**
   * Retrieve a PaymentIntent from an invoice
   */
  async fetchPaymentIntentFromInvoice(
    invoice: Stripe.Invoice
  ): Promise<Stripe.PaymentIntent> {
    if (!invoice.payment_intent) {
      // We don't have any code working with draft invoices, so
      // this should not be hit... yet. PayPal support *will* likely operate
      // on draft invoices though.
      throw error.internalValidationError(
        'fetchPaymentIntentFromInvoice',
        invoice,
        new Error(`Invoice not finalized: ${invoice.id}`)
      );
    }
    if (typeof invoice.payment_intent !== 'string') {
      return invoice.payment_intent;
    }
    return this.stripe.paymentIntents.retrieve(invoice.payment_intent);
  }

  /**
   * Extract the source country from a subscription payment details.
   *
   * Requires the `latest_invoice.payment_intent` to be expanded during
   * subscription load.
   */
  extractSourceCountryFromSubscription(
    subscription: Stripe.Subscription
  ): null | string {
    // Eliminate all the optional values and ensure they were expanded such
    // that they're not a string.
    if (
      !subscription.latest_invoice ||
      typeof subscription.latest_invoice === 'string' ||
      !subscription.latest_invoice.payment_intent ||
      typeof subscription.latest_invoice.payment_intent === 'string'
    ) {
      return null;
    }

    if (subscription.latest_invoice.payment_intent.charges.data.length !== 0) {
      // Get the country from the payment details.
      // However, historically there were (rare) instances where `charges` was
      // not found in the object graph, hence the defensive code.
      // There's only one charge (the latest), per Stripe's docs.
      const paymentMethodDetails =
        subscription.latest_invoice.payment_intent.charges.data[0]
          .payment_method_details;

      if (paymentMethodDetails?.card?.country) {
        return paymentMethodDetails.card.country;
      }
    } else {
      Sentry.withScope((scope) => {
        scope.setContext('stripeSubscription', {
          subscription: { id: subscription.id },
        });
        Sentry.captureMessage(
          'Payment charges not found in subscription payment intent on subscription creation.',
          Sentry.Severity.Warning
        );
      });
    }
    return null;
  }

  /**
   * Formats Stripe subscriptions for a customer into an appropriate response.
   */
  async subscriptionsToResponse(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ) {
    const subs = [];
    for (const sub of subscriptions.data) {
      let failure_code, failure_message;

      // Don't include incomplete/incomplete_expired subscriptions as we pretend they
      // don't exist. When a user tries to sign-up, if an incomplete is found, it will
      // then be used correctly.
      if (sub.status === 'incomplete' || sub.status === 'incomplete_expired') {
        continue;
      }

      let latestInvoice = sub.latest_invoice;
      if (typeof latestInvoice === 'string') {
        latestInvoice = await this.stripe.invoices.retrieve(latestInvoice, {
          expand: ['charge'],
        });
      }

      // If this is a charge-automatically payment that is past_due, attempt
      // to get details of why it failed. The caller should expand the last_invoice
      // calls by passing ['data.subscriptions.data.latest_invoice'] to `fetchCustomer`
      // as the `expand` argument or this will not fetch the failure code/message.
      if (
        sub.status === 'past_due' &&
        sub.collection_method === 'charge_automatically' &&
        latestInvoice &&
        latestInvoice.charge
      ) {
        let charge = latestInvoice.charge;
        if (typeof latestInvoice.charge === 'string') {
          charge = await this.stripe.charges.retrieve(latestInvoice.charge);
        }

        if (typeof charge !== 'string') {
          failure_code = charge.failure_code;
          failure_message = charge.failure_message;
        }
      }

      const product = await this.expandResource(
        // @ts-ignore
        sub.plan.product,
        PRODUCT_RESOURCE
      );

      // @ts-ignore
      const product_id = product.id;
      // @ts-ignore
      const product_name = product.name;

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        created: sub.created,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        cancel_at_period_end: sub.cancel_at_period_end,
        end_at: sub.ended_at,
        // @ts-ignore
        latest_invoice: latestInvoice.number,
        // @ts-ignore
        plan_id: sub.plan.id,
        product_name,
        product_id,
        status: sub.status,
        subscription_id: sub.id,
        failure_code,
        failure_message,
      });
    }
    return subs;
  }

  /**
   * Formats Stripe subscriptions with information needed to provide support.
   */
  async formatSubscriptionsForSupport(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ) {
    const subs = [];
    for (const sub of subscriptions.data) {
      if (!sub.plan) {
        throw error.internalValidationError(
          'formatSubscriptionsForSupport',
          sub,
          new Error(`Unexpected multiple plans for subscription: ${sub.id}`)
        );
      }
      const product = await this.expandResource(
        sub.plan.product,
        PRODUCT_RESOURCE
      );

      if (!product || product.deleted) {
        throw error.internalValidationError(
          'formatSubscriptionsForSupport',
          sub,
          new Error(`Product invalid for subcription: ${sub.id}`)
        );
      }
      const product_name = product.name;

      let previous_product = null;
      let plan_changed = null;

      if (sub.metadata.previous_plan_id !== undefined) {
        const previousPlan = await this.findPlanById(
          sub.metadata.previous_plan_id
        );
        previous_product = previousPlan.product_name;
        plan_changed = Number(sub.metadata.plan_change_date);
      }

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        created: sub.created,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        plan_changed,
        previous_product,
        product_name,
        status: sub.status,
        subscription_id: sub.id,
      });
    }
    return subs;
  }

  /**
   * Use the Stripe lib to authenticate and get a webhook event.
   */
  constructWebhookEvent(payload: any, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
  }

  /**
   * Extract invoice details for billing emails
   */
  async extractInvoiceDetailsForEmail(latestInvoice: Stripe.Invoice | string) {
    const invoice = await this.expandResource(latestInvoice, INVOICES_RESOURCE);
    const customer = await this.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    if (customer.deleted === true) {
      throw error.unknownCustomer(invoice.customer);
    }

    // Dig up & expand objects in the invoice that usually come as just IDs
    const { plan } = invoice.lines.data[0];
    if (!plan) {
      // No plan is present if this is not a subscription or proration, which
      // should never happen as we only have subscriptions.
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice.lines.data[0],
        new Error(`Unexpected line item: ${invoice.lines.data[0].id}`)
      );
    }
    const [abbrevProduct, charge] = await Promise.all([
      this.expandAbbrevProductForPlan(plan),
      this.expandResource(invoice.charge, CHARGES_RESOURCE),
    ]);

    if (!abbrevProduct) {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice,
        new Error(`No product attached to plan ${plan.id}`)
      );
    }

    if (!customer.email) {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        { customerId: customer.id },
        'Customer missing email.'
      );
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const {
      number: invoiceNumber,
      created: invoiceDate,
      currency: invoiceTotalCurrency,
      total: invoiceTotalInCents,
      lines: {
        data: [
          {
            period: { end: nextInvoiceDate },
          },
        ],
      },
    } = invoice;
    const { id: planId, nickname: planName } = plan;
    const productMetadata = this.mergeMetadata(plan, abbrevProduct);
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = productMetadata;

    const { lastFour, cardType } = await this.extractCardDetails({
      charge,
    });

    return {
      uid,
      email,
      cardType,
      lastFour,
      invoiceNumber,
      invoiceTotalInCents,
      invoiceTotalCurrency,
      invoiceDate: new Date(invoiceDate * 1000),
      nextInvoiceDate: new Date(nextInvoiceDate * 1000),
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
      productMetadata,
    };
  }

  async extractCardDetails({ charge }: { charge: Stripe.Charge | null }) {
    let lastFour: string | null = null;
    let cardType: string | null = null;
    if (charge?.payment_method_details?.card) {
      ({
        brand: cardType,
        last4: lastFour,
      } = charge.payment_method_details.card);
    }
    return { lastFour, cardType };
  }

  /**
   * Extract source details for billing emails
   */
  async extractSourceDetailsForEmail(source: Stripe.Source | Stripe.Card) {
    if (source.object !== 'card') {
      // We shouldn't get here - all sources should currently be cards.
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Payment source was not card: ${source.id}`)
      );
    }
    if (!source.customer) {
      // We shouldn't get here - our sources should be attached to customers.
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Customer was not found on source: ${source.id}`)
      );
    }

    const customer = await this.expandResource(
      source.customer,
      CUSTOMER_RESOURCE
    );
    if (customer.deleted === true) {
      throw error.unknownCustomer(source.customer);
    }

    // Follow subhub's lead and just use the customer's first active
    // subscription as source of plan & product data.
    //
    // May need to refine this to search for the specific subscription paid
    // for with a card if/when we allow multiple payment sources on multiple
    // subscriptions.
    //
    // https://github.com/mozilla/subhub/blob/e224feddcdcbafaf0f3cd7d52691d29d94157de5/src/hub/vendor/customer.py#L204

    /** @type {AbbrevProduct | undefined} */
    let abbrevProduct;
    /** @type {Plan | undefined | null} */
    let plan;
    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        customer,
        new Error(`No subscriptions found for customer: ${customer.id}`)
      );
    }
    for (const subscription of customer.subscriptions.data) {
      if (['active', 'trialing'].includes(subscription.status)) {
        if (!subscription.plan) {
          throw error.internalValidationError(
            'extractSourceDetailsForEmail',
            customer,
            new Error(
              `Multiple plans for a subscription not supported: ${subscription.id}`
            )
          );
        }
        plan = await this.expandResource(subscription.plan, PLAN_RESOURCE);
        abbrevProduct = await this.expandAbbrevProductForPlan(plan);
        break;
      }
    }

    if (!plan || !abbrevProduct) {
      throw error.missingSubscriptionForSourceError(
        'extractSourceDetailsForEmail',
        source
      );
    }
    if (!customer.email) {
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        { customerId: customer.id },
        'Customer missing email.'
      );
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const { id: planId, nickname: planName } = plan;
    const productMetadata = this.mergeMetadata(plan, abbrevProduct);
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = productMetadata;

    return {
      uid,
      email,
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
      productMetadata,
    };
  }

  /**
   * Extract subscription update details for billing emails
   */
  async extractSubscriptionUpdateEventDetailsForEmail(event: Stripe.Event) {
    if (event.type !== 'customer.subscription.updated') {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error('Event was not of type customer.subscription.updated')
      );
    }

    const eventData = event.data;
    const subscription = eventData.object as Stripe.Subscription;
    const customer = await this.expandResource(
      subscription.customer,
      'customers'
    );
    if (customer.deleted === true) {
      throw error.unknownCustomer(subscription.customer);
    }

    let invoice = subscription.latest_invoice;
    if (typeof invoice === 'string') {
      // if we have to do a fetch, go ahead and ensure we also get the additional needed resource
      invoice = await this.stripe.invoices.retrieve(invoice, {
        expand: ['charge'],
      });
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;

    if (!subscription.plan) {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error(
          `Multiple plans for a subscription not supported: ${subscription.id}`
        )
      );
    }

    const previousAttributes = eventData.previous_attributes;
    const planNew = subscription.plan;
    const planIdNew = subscription.plan.id;
    // This may be in error, its not obvious what previous attributes must exist
    // @ts-ignore
    const planOld = previousAttributes.plan;
    const cancelAtPeriodEndNew = subscription.cancel_at_period_end;
    // @ts-ignore
    const cancelAtPeriodEndOld = previousAttributes.cancel_at_period_end;

    const abbrevProductNew = await this.expandAbbrevProductForPlan(planNew);
    const {
      interval: productPaymentCycle,
      amount: paymentAmountNewInCents,
      currency: paymentAmountNewCurrency,
    } = planNew;
    const {
      product_id: productIdNew,
      product_name: productNameNew,
    } = abbrevProductNew;
    const productNewMetadata = this.mergeMetadata(planNew, abbrevProductNew);
    const {
      productOrder: productOrderNew,
      emailIconURL: productIconURLNew = '',
      downloadURL: productDownloadURLNew = '',
    } = productNewMetadata;

    const baseDetails = {
      uid,
      email,
      planId: planIdNew,
      productId: productIdNew,
      productIdNew,
      productNameNew,
      productIconURLNew,
      productDownloadURLNew,
      planIdNew,
      paymentAmountNewInCents,
      paymentAmountNewCurrency,
      productPaymentCycle,
      closeDate: event.created,
      productMetadata: productNewMetadata,
    };

    if (!invoice) {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error(`Invoice expected for subscription: ${subscription.id}`)
      );
    }

    if (!cancelAtPeriodEndOld && cancelAtPeriodEndNew && !planOld) {
      return this.extractSubscriptionUpdateCancellationDetailsForEmail(
        subscription,
        baseDetails,
        invoice
      );
    } else if (cancelAtPeriodEndOld && !cancelAtPeriodEndNew && !planOld) {
      return this.extractSubscriptionUpdateReactivationDetailsForEmail(
        subscription,
        baseDetails,
        invoice
      );
    } else if (!cancelAtPeriodEndNew && planOld) {
      return this.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
        subscription,
        baseDetails,
        invoice,
        customer,
        productOrderNew,
        planOld
      );
    }

    // unknown update scenario, but let's return some details anyway
    return baseDetails;
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in cancellation case
   */
  async extractSubscriptionUpdateCancellationDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice
  ) {
    const { current_period_end: serviceLastActiveDate } = subscription;

    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
    } = baseDetails;

    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      created: invoiceDate,
    } = invoice;

    return {
      updateType: SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceDate: new Date(invoiceDate * 1000),
      invoiceTotalInCents,
      invoiceTotalCurrency,
      serviceLastActiveDate: new Date(serviceLastActiveDate * 1000),
    };
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in reactivation case
   *
   * @param {Subscription} subscription
   * @param {*} baseDetails
   * @param {Invoice} invoice
   */
  async extractSubscriptionUpdateReactivationDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice
  ) {
    const charge = await this.expandResource(invoice.charge, CHARGES_RESOURCE);

    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
    });
    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      next_payment_attempt: nextInvoiceDate,
    } = upcomingInvoice;

    const { lastFour, cardType } = await this.extractCardDetails({
      charge,
    });

    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
    } = baseDetails;

    return {
      updateType: SUBSCRIPTION_UPDATE_TYPES.REACTIVATION,
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceTotalInCents,
      invoiceTotalCurrency,
      cardType,
      lastFour,
      // TODO: According to Stripe, this value will be null for invoices where collection_method=send_invoice
      // Our subscriptions use collection_method=charge_automatically - so this shouldn't happen?
      // Do trial subscriptions run into this?
      nextInvoiceDate: nextInvoiceDate
        ? new Date(nextInvoiceDate * 1000)
        : null,
    };
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in upgrade & downgrade cases.
   */
  async extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    productOrderNew: string,
    planOld: Stripe.Plan
  ) {
    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
    });

    const { id: invoiceId, number: invoiceNumber } = invoice;

    const {
      currency: paymentProratedCurrency,
      amount_due: paymentProratedInCents,
    } = upcomingInvoice;

    // https://github.com/mozilla/subhub/blob/e224feddcdcbafaf0f3cd7d52691d29d94157de5/src/hub/vendor/customer.py#L643
    const abbrevProductOld = await this.expandAbbrevProductForPlan(planOld);
    const {
      amount: paymentAmountOldInCents,
      currency: paymentAmountOldCurrency,
    } = planOld;
    const {
      product_id: productIdOld,
      product_name: productNameOld,
    } = abbrevProductOld;
    const {
      productOrder: productOrderOld,
      emailIconURL: productIconURLOld = '',
      downloadURL: productDownloadURLOld = '',
    } = this.mergeMetadata(planOld, abbrevProductOld);

    const updateType =
      productOrderNew > productOrderOld
        ? SUBSCRIPTION_UPDATE_TYPES.UPGRADE
        : SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE;

    return {
      ...baseDetails,
      updateType,
      productIdOld,
      productNameOld,
      productIconURLOld,
      productDownloadURLOld,
      paymentAmountOldInCents,
      paymentAmountOldCurrency,
      invoiceNumber,
      invoiceId,
      paymentProratedInCents,
      paymentProratedCurrency,
    };
  }

  /**
   * Accept a string ID or resource object, return a resource object after
   * retrieving (if necessary)
   *
   * @template T
   * @param {string | T} resource
   * @param {string} resourceType
   *
   * @returns {Promise<T>}
   */
  async expandResource<T>(
    resource: string | T,
    resourceType: string
  ): Promise<T> {
    if (typeof resource !== 'string') {
      return resource;
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      const errorMsg = `stripeHelper.expandResource was provided an invalid resource type: ${resourceType}`;
      const error = new Error(errorMsg);
      this.log.error(`stripeHelper.expandResource.failed`, { error });
      throw error;
    }

    // @ts-ignore
    return this.stripe[resourceType].retrieve(resource);
  }

  /**
   * Accept a Stripe Plan, attempt to expand an AbbrevProduct from cache
   * or Stripe fetch
   */
  async expandAbbrevProductForPlan(plan: Stripe.Plan): Promise<AbbrevProduct> {
    // @ts-ignore
    const checkDeletedProduct = (product) => {
      if (product.deleted === true) {
        throw error.unknownSubscriptionPlan(plan.id);
      }
      return this.abbrevProductFromStripeProduct(product);
    };

    // If we already have an expanded Product, just extract from that.
    if (typeof plan.product === 'object') {
      return checkDeletedProduct(plan.product);
    }

    // Next, look for product details in cache
    const products = await this.allProducts();
    const productCached = products.find((p) => p.product_id === plan.product);
    if (productCached) {
      return productCached;
    }

    // Finally, do a direct Stripe fetch if none of the above works.
    return checkDeletedProduct(
      await this.stripe.products.retrieve(plan.product)
    );
  }

  /**
   * Metadata consists of product metadata with per-plan overrides.
   *
   * @param {Plan} plan
   * @param {AbbrevProduct} abbrevProduct
   */
  mergeMetadata(plan: Stripe.Plan, abbrevProduct: AbbrevProduct) {
    return {
      ...abbrevProduct.product_metadata,
      ...plan.metadata,
    };
  }
}

/**
 * Create a Stripe Helper with built-in caching.
 */
function createStripeHelper(log: any, config: any, statsd?: StatsD) {
  return new StripeHelper(log, config, statsd);
}
// HACK: Hang some references off the factory function so we can use it as
// a type in bin/key_server.js and routes/subscriptions.js while keeping
// the exports simple.
// NOTE: These must be assigned individually instead of Object.assign as
// dynamic assignments are not seen by type checking.
createStripeHelper.StripeHelper = StripeHelper;
createStripeHelper.SUBSCRIPTION_UPDATE_TYPES = SUBSCRIPTION_UPDATE_TYPES;

module.exports = createStripeHelper;

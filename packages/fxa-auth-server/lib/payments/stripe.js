/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const error = require('../error');

const stripe = require('stripe').Stripe;

/** @typedef {import('stripe').Stripe.ApiList<Subscription>} Subscriptions */
/** @typedef {import('stripe').Stripe.ApiListPromise} ApiListPromise */
/** @typedef {import('stripe').Stripe.Customer} Customer */
/** @typedef {import('stripe').Stripe.Event} StripeEvent */
/** @typedef {import('stripe').Stripe.Plan} Plan */
/** @typedef {import('stripe').Stripe.Product} Product */
/** @typedef {import('stripe').Stripe.DeletedProduct} DeletedProduct */
/** @typedef {import('stripe').Stripe.Subscription} Subscription */
/** @typedef {import('stripe').Stripe.SubscriptionListParams} SubscriptionListParams */
/** @typedef {import('stripe').Stripe.Invoice} Invoice */
/** @typedef {import('stripe').Stripe.Source} Source */
/** @typedef {import('stripe').Stripe.Card} Card */
/** @typedef {import('stripe').Stripe.PaymentIntent} PaymentIntent */
/** @typedef {import('stripe').Stripe.Charge} Charge */

/**
 * @typedef AbbrevProduct
 * @property {string} product_id
 * @property {string} product_name
 * @property {Product['metadata']} product_metadata
 */

/**
 * @typedef AbbrevPlan
 * @property {string} plan_id
 * @property {Product['metadata']} plan_metadata
 * @property {string} product_id
 * @property {string} product_name
 * @property {Product['metadata']} product_metadata
 * @property {Plan['interval']} interval
 * @property {Plan['interval_count']} interval_count
 * @property {Plan['amount']} amount
 * @property {Plan['currency']} currency
 */

const CUSTOMER_RESOURCE = 'customers';
const SUBSCRIPTIONS_RESOURCE = 'subscriptions';
const PRODUCT_RESOURCE = 'products';
const PLAN_RESOURCE = 'plans';
const CHARGES_RESOURCE = 'charges';

const VALID_RESOURCE_TYPES = [
  CUSTOMER_RESOURCE,
  SUBSCRIPTIONS_RESOURCE,
  PRODUCT_RESOURCE,
  PLAN_RESOURCE,
  CHARGES_RESOURCE,
];

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
function validateProductUpgrade(oldMetadata, newMetadata) {
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
  return oldOrder < newOrder;
}

class StripeHelper {
  /**
   * Create a Stripe Helper with built-in caching.
   *
   * @param {object} log
   * @param {object} config
   * @param {import('hot-shots').StatsD | undefined} statsd
   */
  constructor(log, config, statsd) {
    this.log = log;
    this.cacheTtlSeconds =
      config.subhub.plansCacheTtlSeconds ||
      config.subscriptions.cacheTtlSeconds;
    this.webhookSecret = config.subscriptions.stripeWebhookSecret;
    const redis =
      this.cacheTtlSeconds &&
      require('../redis')(
        {
          ...config.redis,
          ...config.redis.subhub,
        },
        log
      );
    this.plansCacheIsEnabled = this.cacheTtlSeconds && redis;

    this.stripe = new stripe(config.subscriptions.stripeApiKey, {
      apiVersion: '2019-12-03',
      maxNetworkRetries: 3,
      typescript: undefined,
    });
    this.redis = redis;

    if (statsd) {
      this.stripe.on('response', response => {
        statsd.timing('stripe_request', response.elapsed);
      });
    }
  }

  /**
   * Get a cached result at a cache key and regenerated it with `refreshFunction`
   * if its expired.
   *
   * @param {string} cacheKey
   * @param {() => Promise<T>} refreshFunction
   * @returns {Promise<T | undefined>} possibly cached result
   */
  async getCachedResult(cacheKey, refreshFunction) {
    try {
      const json = await this.redis.get(cacheKey);
      if (json) {
        return JSON.parse(json);
      }
    } catch (err) {
      this.log.error(`stripeHelper.getCachedResult.redis.get.failed`, { err });
    }

    const result = await refreshFunction();
    try {
      await this.redis.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        this.cacheTtlSeconds
      );
    } catch (err) {
      this.log.error(`stripeHelper.getCachedResult.redis.set.failed`, { err });
    }

    return result;
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
   *
   * @param {Product} product
   * @returns {AbbrevProduct}
   */
  abbrevProductFromStripeProduct(product) {
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
  async allProducts() {
    return this.getCachedResult('listProducts', () => this.fetchAllProducts());
  }

  /**
   * Create a stripe customer
   *
   * @param {string} uid
   * @param {string} email
   * @param {string} displayName
   * @param {string} paymentToken
   * @param {string} idempotencyKey
   *
   * @returns {Promise<Customer>}
   */
  async createCustomer(uid, email, displayName, paymentToken, idempotencyKey) {
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
   *
   * @param {Subscription} sub
   * @returns {Promise<{uid: string, email: string} | {uid: undefined, email: undefined} | {uid: undefined, email: string}>}
   */
  async getCustomerUidEmailFromSubscription(sub) {
    const customer = await this.stripe.customers.retrieve(
      /** @type {string} */ (sub.customer)
    );
    if (customer.deleted) {
      // Deleted customers lost their metadata so we can't send events for them
      return { uid: undefined, email: undefined };
    }
    if (!(/** @type {Customer} */ (customer.metadata.userid))) {
      Sentry.withScope(scope => {
        scope.setContext('stripeEvent', {
          customer: { id: customer.id },
        });
        Sentry.captureMessage(
          'FxA UID does not exist on customer metadata.',
          Sentry.Severity.Error
        );
      });
    }
    return {
      uid: /** @type {Customer} */ (customer).metadata.userid,
      email: /** @type {Customer} */ (customer).email,
    };
  }

  /**
   * Update a customer's default payment method
   *
   * @param {string} customerId
   * @param {string} paymentToken
   *
   * @returns {Promise<Customer>}
   */
  async updateCustomerPaymentMethod(customerId, paymentToken) {
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
   *
   * @param {string} uid Firefox Account Uid
   * @param {string} email Firefox Account Email
   * @param {string[]} [expand] Additional fields to expand in the
   *                           Stripe call.
   * @returns {Promise<Customer|void>} Customer if exists in the system.
   */
  async fetchCustomer(uid, email, expand) {
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

  /**
   * Fetch a customer for the record from Stripe based on user ID & email.
   *
   * Uses Redis caching if configured.
   *
   * @param {string} uid Firefox Account Uid
   * @param {string} email Firefox Account Email
   * @param {boolean} forceRefresh whether to force refresh fetch of customer
   * @param {boolean} cacheOnly Whether a fetch should only hit our cache.
   * @returns {Promise<Customer|void>} Customer if exists in the system.
   */
  async customer(uid, email, forceRefresh = false, cacheOnly = false) {
    const cacheKey = this.customerCacheKey(uid, email);
    let result = undefined;

    if (!forceRefresh) {
      try {
        const json = await this.redis.get(cacheKey);
        if (json) {
          result = JSON.parse(json);
        }
      } catch (err) {
        this.log.error(`stripeHelper.customer.redis.get.failed`, { err });
      }
    }

    if (!result && !cacheOnly) {
      result = await this.fetchCustomer(uid, email, [
        'data.sources',
        'data.subscriptions',
      ]);
      try {
        await this.redis.set(cacheKey, JSON.stringify(result));
      } catch (err) {
        this.log.error(`stripeHelper.customer.redis.set.failed`, { err });
      }
    }

    return result;
  }

  /**
   * On FxA deletion, if the user is a Stripe Customer:
   * - flag the stripe customer to delete
   * - remove the cache entry
   *
   * @param {string} uid
   * @param {string} email
   */
  async removeCustomer(uid, email) {
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
   *
   * @param {string} uid Firefox Account Uid
   * @param {string} email Firefox Account Email
   * @param {string} subscriptionId Subscription ID
   * @returns {Promise<Subscription|void>} Subscription if exists for the customer.
   */
  async subscriptionForCustomer(uid, email, subscriptionId) {
    const customer = await this.customer(uid, email);
    if (!customer) {
      return;
    }

    return customer.subscriptions.data.find(
      subscription => subscription.id === subscriptionId
    );
  }

  /**
   * Fetch a list of subscriptions for a customer from Stripe.
   *
   * @param {string} customerId
   * @param {string} startAfterSubscriptionId
   * @returns {Promise<Subscription[]>}
   */
  async fetchAllSubscriptionsForCustomer(customerId, startAfterSubscriptionId) {
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
   *
   * @param {string} uid Firefox Account Uid
   * @param {string} email Firefox Account Email
   * @returns {Promise<Customer|void>} Customer if exists in the system.
   */
  async refreshCachedCustomer(uid, email) {
    try {
      return await this.customer(uid, email, true);
    } catch (err) {
      this.log.error(`subhub.refreshCachedCustomer.failed`, { err });
    }
  }

  /**
   * Build a key used for Redis cache based on user ID & email.
   *
   * @param {string} uid Firefox Account Uid
   * @param {string} email Firefox Account Email
   * @returns {string} Cache key.
   */
  customerCacheKey(uid, email) {
    return `customer-${uid}|${email}`;
  }

  /**
   * Remove the cache entry for a customer account
   * This is to be used on account deletion
   *
   * @param {string} uid
   * @param {string} email
   */
  async removeCustomerFromCache(uid, email) {
    const customerKey = this.customerCacheKey(uid, email);
    try {
      await this.redis.del(customerKey);
    } catch (err) {
      this.log.error(
        `stripeHelper.removeCustomerFromCache failed to remove cache key: ${customerKey}`,
        { err }
      );
    }
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Use `allPlans` below to use the cached-enhanced version.
   *
   * @returns {Promise<AbbrevPlan[]>} All the plans.
   */
  async fetchAllPlans() {
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
        plan_id: item.id,
        plan_metadata: item.metadata,
        product_id: item.product.id,
        product_name: item.product.name,
        product_metadata: item.product.metadata,
        interval: item.interval,
        interval_count: item.interval_count,
        amount: item.amount,
        currency: item.currency,
      });
    }
    return plans;
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Uses Redis caching if configured.
   *
   * @returns {Promise<AbbrevPlan[]>} All the plans.
   */
  async allPlans() {
    return this.getCachedResult('listPlans', () => this.fetchAllPlans());
  }

  /**
   * Find a plan by id or error if its not a valid planId.
   *
   * @param {string} planId
   * @returns {Promise<AbbrevPlan>}
   */
  async findPlanById(planId) {
    const plans = await this.allPlans();
    const selectedPlan = plans.find(p => p.plan_id === planId);
    if (!selectedPlan) {
      throw error.unknownSubscriptionPlan(planId);
    }
    return selectedPlan;
  }

  /**
   * Verify that the `planId` is a valid upgrade for the `currentPlanId`.
   *
   * Throws an error if its an invalid upgrade.
   *
   * @param {string} currentPlanId
   * @param {string} newPlanId
   * @returns {Promise<void>}
   */
  async verifyPlanUpgradeForSubscription(currentPlanId, newPlanId) {
    const allPlans = await this.allPlans();
    const currentPlan = allPlans
      .filter(plan => plan.plan_id === currentPlanId)
      .shift();

    const newPlan = allPlans.filter(plan => plan.plan_id === newPlanId).shift();
    if (!newPlan || !currentPlan) {
      throw error.unknownSubscriptionPlan();
    }

    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    if (
      !validateProductUpgrade(
        currentPlan.product_metadata,
        newPlan.product_metadata
      )
    ) {
      throw error.invalidPlanUpgrade();
    }
  }

  /**
   * Change a subscription to the new plan.
   *
   * Note that this call does not verify its a valid upgrade, the
   * `verifyPlanUpgradeForSubscription` should be done first to
   * validate this is an appropraite change for tier use.
   *
   * @param {Subscription['id']} subscriptionId
   * @param {Plan['id']} planId
   */
  async changeSubscriptionPlan(subscriptionId, planId) {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    if (subscription.items.data[0].plan.id === planId) {
      throw error.subscriptionAlreadyChanged();
    }
    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          plan: planId,
        },
      ],
    });
  }

  /**
   * Cancel a given subscription for a customer
   * If the subscription does not belong to the customer, throw an error
   *
   * @param {string} uid
   * @param {string} email
   * @param {Subscription[id]} subscriptionId
   */
  async cancelSubscriptionForCustomer(uid, email, subscriptionId) {
    const hasSubscription = await this.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!hasSubscription) {
      throw error.unknownSubscription();
    }

    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
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
   *
   * @param {string} uid
   * @param {string} email
   * @param {Subscription[id]} subscriptionId
   */
  async reactivateSubscriptionForCustomer(uid, email, subscriptionId) {
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
    });
  }

  /**
   * Attempt to pay invoice by invoice id
   * Throws payment failed error on failure
   *
   * @param {string} invoiceId
   *
   * @returns {Promise<Invoice>}
   * @throws {error}
   */
  async payInvoice(invoiceId) {
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
   *
   * @param {Customer} customer
   * @param {AbbrevPlan} selectedPlan
   * @param {string} idempotencyKey
   *
   * @returns {Promise<Subscription>}
   * @throws {error.paymentFailed}
   */
  async createSubscription(customer, selectedPlan, idempotencyKey) {
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

    if (
      !this.paidInvoice(/** @type {Invoice} */ (subscription.latest_invoice))
    ) {
      throw error.paymentFailed();
    }
    return subscription;
  }

  /**
   * Verify that the invoice was paid successfully.
   *
   * Note that the invoice *must have the `payment_intent` expanded*
   * or this function will fail.
   *
   * @param {Invoice} invoice
   * @returns {boolean}
   */
  paidInvoice(invoice) {
    return (
      invoice.status === 'paid' &&
      /** @type {PaymentIntent} */ (invoice.payment_intent).status ===
        'succeeded'
    );
  }

  /**
   * Retrieve a PaymentIntent from an invoice
   *
   * @param {Invoice} invoice
   * @returns {Promise<PaymentIntent>}
   */
  async fetchPaymentIntentFromInvoice(invoice) {
    if (typeof invoice.payment_intent !== 'string') {
      return invoice.payment_intent;
    }
    return this.stripe.paymentIntents.retrieve(invoice.payment_intent);
  }

  /**
   * Formats Stripe subscriptions for a customer into an appropriate response.
   *
   * @param {Subscriptions} subscriptions Subscriptions to finesse
   * @returns {Promise<object[]>} Formatted list of subscriptions.
   */
  async subscriptionsToResponse(subscriptions) {
    const subs = [];
    for (const sub of subscriptions.data) {
      let failure_code, failure_message;

      // Don't include incomplete/incomplete_expired subscriptions as we pretend they
      // don't exist. When a user tries to sign-up, if an incomplete is found, it will
      // then be used correctly.
      if (sub.status === 'incomplete' || sub.status === 'incomplete_expired') {
        continue;
      }

      // If this is a charge-automatically payment that is past_due, attempt
      // to get details of why it failed. The caller should expand the last_invoice
      // calls by passing ['data.subscriptions.data.latest_invoice'] to `fetchCustomer`
      // as the `expand` argument or this will not fetch the failure code/message.
      if (
        sub.latest_invoice &&
        sub.status === 'past_due' &&
        typeof sub.latest_invoice !== 'string' &&
        sub.collection_method === 'charge_automatically'
      ) {
        let charge = sub.latest_invoice.charge;
        if (typeof sub.latest_invoice.charge === 'string') {
          charge = await this.stripe.charges.retrieve(
            sub.latest_invoice.charge
          );
        }

        failure_code = /** @type {Charge} */ (charge).failure_code;
        failure_message = /** @type {Charge} */ (charge).failure_message;
      }

      const product = await this.expandResource(
        sub.plan.product,
        PRODUCT_RESOURCE
      );

      const product_id = product.id;
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
   * Use the Stripe lib to authenticate and get a webhook event.
   *
   * @param {any} payload
   * @param {string | string[]} signature
   * @returns {StripeEvent}
   */
  constructWebhookEvent(payload, signature) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
  }

  /**
   * Extract invoice details for billing emails
   *
   * @param {Invoice} invoice
   */
  async extractInvoiceDetailsForEmail(invoice) {
    if (!invoice || typeof invoice !== 'object') {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice,
        new Error('Invoice undefined or not object')
      );
    }

    const customer = await this.expandResource(invoice.customer, 'customers');
    if (customer.deleted === true) {
      throw error.unknownCustomer(invoice.customer);
    }

    // Dig up & expand objects in the invoice that usually come as just IDs
    const { plan } = invoice.lines.data[0];
    const [abbrevProduct, charge] = await Promise.all([
      this.expandAbbrevProductForPlan(plan),
      this.expandResource(invoice.charge, 'charges'),
    ]);

    const {
      email,
      metadata: { userid: uid },
    } = customer;
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const {
      number: invoiceNumber,
      created: invoiceDate,
      total: invoiceTotal,
      period_end: nextInvoiceDate,
    } = invoice;
    const { id: planId, nickname: planName } = plan;
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = {
      ...abbrevProduct.product_metadata,
      ...plan.metadata,
    };
    const {
      brand: cardType,
      last4: lastFour,
    } = charge.payment_method_details.card;

    return {
      uid,
      email,
      cardType,
      lastFour,
      invoiceNumber,
      invoiceTotal: invoiceTotal / 100.0,
      invoiceDate: new Date(invoiceDate * 1000),
      nextInvoiceDate: new Date(nextInvoiceDate * 1000),
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
    };
  }

  /**
   * Extract source details for billing emails
   *
   * @param {Source | Card} source
   */
  async extractSourceDetailsForEmail(source) {
    if (source.object !== 'card') {
      // We shouldn't get here - all sources should currently be cards.
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Payment source was not card: ${source.id}`)
      );
    }

    const customer = await this.expandResource(source.customer, 'customers');
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
    /** @type {Plan | undefined} */
    let plan;
    for (const subscription of customer.subscriptions.data) {
      if (['active', 'trialing'].includes(subscription.status)) {
        plan = await this.expandResource(subscription.plan, 'plans');
        abbrevProduct = await this.expandAbbrevProductForPlan(plan);
        break;
      }
    }

    if (!plan || !abbrevProduct) {
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Subscription corresponding to source not found`)
      );
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const { id: planId, nickname: planName } = plan;
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = {
      ...abbrevProduct.product_metadata,
      ...plan.metadata,
    };

    return {
      uid,
      email,
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
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
  async expandResource(resource, resourceType) {
    if (typeof resource !== 'string') {
      return resource;
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      const errorMsg = `stripeHelper.expandResource was provided an invalid resource type: ${resourceType}`;
      this.log.error(errorMsg);
      throw new Error(errorMsg);
    }

    return this.stripe[resourceType].retrieve(resource);
  }

  /**
   * Accept a Stripe Plan, attempt to expand an AbbrevProduct from cache
   * or Stripe fetch
   *
   * @param {Plan} plan
   * @returns { Promise<AbbrevProduct> }
   */
  async expandAbbrevProductForPlan(plan) {
    const checkDeletedProduct = product => {
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
    const productCached = products.find(p => p.product_id === plan.product);
    if (productCached) {
      return productCached;
    }

    // Finally, do a direct Stripe fetch if none of the above works.
    return checkDeletedProduct(
      await this.stripe.products.retrieve(plan.product)
    );
  }
}

/**
 * Create a Stripe Helper with built-in caching.
 *
 * @param {object} log
 * @param {object} config
 * @param {import('hot-shots').StatsD | undefined} statsd
 * @returns StripeHelper
 */
function createStripeHelper(log, config, statsd) {
  return new StripeHelper(log, config, statsd);
}
// HACK: Hang a reference for StripeHelper off the factory function so we
// can use it as a type in bin/key_server.js while keeping the exports simple.
createStripeHelper.StripeHelper = StripeHelper;

module.exports = createStripeHelper;

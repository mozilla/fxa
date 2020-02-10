/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const error = require('../error');
const subhub = require('../subhub/client');

const stripe = require('stripe').Stripe;

/** @typedef {import('stripe').Stripe.ApiList<Subscription>} Subscriptions */
/** @typedef {import('stripe').Stripe.ApiListPromise} ApiListPromise */
/** @typedef {import('stripe').Stripe.Customer} Customer */
/** @typedef {import('stripe').Stripe.Event} StripeEvent */
/** @typedef {import('stripe').Stripe.Plan} Plan */
/** @typedef {import('stripe').Stripe.Product} Product */
/** @typedef {import('stripe').Stripe.Subscription} Subscription */
/** @typedef {import('stripe').Stripe.SubscriptionListParams} SubscriptionListParams */

/**
 * @typedef AbbrevProduct
 * @property {string} product_id
 * @property {string} product_name
 * @property {Product['metadata']} product_metadata
 */

/**
 * @typedef AbbrevPlan
 * @property {string} plan_id
 * @property {string} plan_name
 * @property {Product['metadata']} plan_metadata
 * @property {string} product_id
 * @property {string} product_name
 * @property {Product['metadata']} product_metadata
 * @property {Plan['interval']} interval
 * @property {Plan['amount']} amount
 * @property {Plan['currency']} currency
 */

/**
 * Get a cached result at a cache key and regenerated it with `refreshFunction`
 * if its expired.
 *
 * @template T
 * @param {*} redis
 * @param {string} cacheKey
 * @param {number} cacheTtl
 * @param {() => Promise<T> | undefined} refreshFunction
 * @param {boolean} forceRefresh
 * @returns {Promise<T | undefined>} possibly cached result
 */
async function cachedResult(
  log,
  redis,
  cacheKey,
  cacheTtl,
  refreshFunction,
  forceRefresh = false
) {
  if (cacheTtl && !forceRefresh) {
    try {
      const json = await redis.get(cacheKey);
      if (json) {
        return JSON.parse(json);
      }
    } catch (err) {
      log.error(
        `subhub.cachedResult.${refreshFunction.name}.getCachedResponse.failed`,
        { err }
      );
    }
  }

  if (!refreshFunction) {
    return;
  }

  const result = await refreshFunction();
  if (cacheTtl) {
    redis
      .set(cacheKey, JSON.stringify(result), 'EX', cacheTtl)
      .catch(err =>
        log.error(
          `subhub.cachedResult.${refreshFunction.name}.cacheResponse.failed`,
          { err }
        )
      );
  }
  return result;
}

class StripeHelper {
  /**
   * Create a Stripe Helper with built-in caching.
   *
   * @param {object} log
   * @param {object} config
   */
  constructor(log, config) {
    this.log = log;
    // TODO: Should we configure different TTLs for different data? (i.e. plans, products, customers)
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
      products.push({
        product_id: product.id,
        product_name: product.name,
        product_metadata: product.metadata,
      });
    }
    return products;
  }

  /**
   * Fetches all products from stripe and returns them.
   *
   * Uses Redis caching if configured.
   *
   * @returns {Promise<AbbrevProduct[]>} All the products.
   */
  async allProducts() {
    return cachedResult(
      this.log,
      this.redis,
      'listProducts',
      this.cacheTtlSeconds,
      () => this.fetchAllProducts()
    );
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
    return cachedResult(
      this.log,
      this.redis,
      cacheKey,
      this.cacheTtlSeconds,
      cacheOnly
        ? undefined
        : async () =>
            this.fetchCustomer(uid, email, [
              'data.sources',
              'data.subscriptions',
            ]),
      forceRefresh
    );
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
      // FIXME: Should probably error here if we can't set a product id/name.
      let product_id, product_name, product_metadata;

      // We don't list plans for deleted products
      if (item.product && typeof item.product !== 'string') {
        product_id = item.product.id;
        product_name = item.product.name;
        product_metadata = item.product.metadata;
      }

      plans.push({
        plan_id: item.id,
        plan_name: item.nickname,
        plan_metadata: item.metadata,
        product_id,
        product_name,
        product_metadata,
        interval: item.interval,
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
    return cachedResult(
      this.log,
      this.redis,
      'listPlans',
      this.cacheTtlSeconds,
      () => this.fetchAllPlans()
    );
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
   * Verify that the `planId` is a valid upgrade for this `productId`.
   *
   * Throws an error if its an invalid upgrade.
   *
   * @param {string} productId
   * @param {string} planId
   * @returns {Promise<void>}
   */
  async verifyPlanUpgradeForSubscription(productId, planId) {
    const allPlans = await this.allPlans();
    const currentPlan = allPlans
      .filter(plan => plan.product_id === productId)
      .shift();

    const newPlan = allPlans.filter(plan => plan.plan_id === planId).shift();
    if (!newPlan || !currentPlan) {
      throw error.unknownSubscriptionPlan();
    }
    if (
      !subhub.validateProductUpgrade(
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
   *
   * Returns the product name of a given product.
   *
   * @param {String | Product} product
   * @returns {Promise<String>} product name
   */
  async getProductName(product) {
    if (typeof product === 'string') {
      const fetchedProducts = await this.fetchAllProducts();
      const matchingProduct = fetchedProducts.find(
        fetchedProduct => fetchedProduct.product_id === product
      );
      return matchingProduct ? matchingProduct.product_name : '';
    }
    return product.name;
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
        sub.collection_method === 'charge_automatically' &&
        typeof sub.latest_invoice.charge === 'string'
      ) {
        const charge = await this.stripe.charges.retrieve(
          sub.latest_invoice.charge
        );
        failure_code = charge.failure_code;
        failure_message = charge.failure_message;
      }

      // enforce type because it _could_ be a DeletedProduct (but shouldn't be)
      const productName = await this.getProductName(
        /** @type {String | Product} */ (sub.plan.product)
      );
      const intervalDict = {
        day: 'Daily',
        week: 'Weekly',
        month: 'Monthly',
        year: 'Yearly',
      };

      const planName = `${productName} ${intervalDict[sub.plan.interval]}`;

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        cancel_at_period_end: sub.cancel_at_period_end,
        end_at: sub.ended_at,
        plan_name: planName,
        plan_id: sub.plan.id,
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
}

/**
 * Create a Stripe Helper with built-in caching.
 *
 * @param {object} log
 * @param {object} config
 * @returns StripeHelper
 */
function createStripeHelper(log, config) {
  return new StripeHelper(log, config);
}
// HACK: Hang a reference for StripeHelper off the factory function so we
// can use it as a type in bin/key_server.js while keeping the exports simple.
createStripeHelper.StripeHelper = StripeHelper;

module.exports = createStripeHelper;

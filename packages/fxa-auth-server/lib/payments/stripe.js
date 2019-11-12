/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const error = require('../error');
const subhub = require('../subhub/client');

const stripe = require('stripe');

/** @typedef {import('stripe').customers.ICustomer} Customer */
/** @typedef {import('stripe').products.IProduct} Product */
/** @typedef {import('stripe').plans.IPlan} Plan */
/** @typedef {import('stripe').subscriptions.ISubscription} Subscription */
/** @typedef {import('stripe').customers.ICustomerSubscriptions} Subscriptions */

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
 * @param {() => Promise<T>} refreshFunction
 * @returns {Promise<T>} possibly cached result
 */
async function cachedResult(log, redis, cacheKey, cacheTtl, refreshFunction) {
  if (cacheTtl) {
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
    this.cacheTtlSeconds = config.subhub.plansCacheTtlSeconds;
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
      maxNetworkRetries: 3,
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
}

module.exports = StripeHelper;

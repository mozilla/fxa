/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { ERRNO } = require('../../error');

const PRODUCT_SUBSCRIBED = 'defaultSubscribed';
const PRODUCT_REGISTERED = 'defaultRegistered';

module.exports = {
  PRODUCT_SUBSCRIBED,
  PRODUCT_REGISTERED,

  determineClientVisibleSubscriptionCapabilities: async function(
    config,
    auth,
    db,
    uid,
    client_id
  ) {
    const {
      subscriptions: { productCapabilities = {}, clientCapabilities = {} } = {},
    } = config;

    const subscriptions = (await db.fetchAccountSubscriptions(uid)) || [];

    const subscribedProducts = [
      // All accounts get this product
      PRODUCT_REGISTERED,
      // Other products come from actual subscriptions
      ...subscriptions.map(({ productId }) => productId),
    ];
    // Accounts with at least one subscription get this product
    if (subscriptions.length > 0) {
      subscribedProducts.push(PRODUCT_SUBSCRIBED);
    }

    const subscribedCapabilities = subscribedProducts.reduce(
      (capabilities, product) =>
        capabilities.concat(productCapabilities[product] || []),
      []
    );

    const clientVisibleCapabilities = clientCapabilities[client_id] || [];

    const capabilitiesToReveal = new Set(
      subscribedCapabilities.filter(
        capability =>
          auth.strategy === 'sessionToken' ||
          clientVisibleCapabilities.includes(capability)
      )
    );

    return capabilitiesToReveal.size > 0
      ? Array.from(capabilitiesToReveal)
      : undefined;
  },

  updateLocalSubscriptionsFromSubhub: async function({
    db,
    subhub,
    profile,
    uid,
  }) {
    // Attempt to get the user's current subscriptions from subhub's perspective
    let subhubSubscriptions = [];
    try {
      const subhubCustomer = await subhub.getCustomer(uid);
      subhubSubscriptions = subhubCustomer.subscriptions || [];
    } catch (err) {
      if (err.errno === ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER) {
        // No customer, so we have no subscriptions.
        subhubSubscriptions = [];
      } else {
        // Any other error seems like a bigger problem, so bail out.
        throw err;
      }
    }

    // Map subhub subscriptions by ID.
    const subhubSubscriptionsById = {};
    for (const sub of subhubSubscriptions) {
      subhubSubscriptionsById[sub.subscription_id] = sub;
    }

    // Get subhub plans and build a map of planId -> productId - we need
    // productId for local subscriptions, but the subhub customer only
    // lists planId
    const subhubPlans = await subhub.listPlans();
    const productIdsByPlanId = {};
    for (const { plan_id, product_id } of subhubPlans) {
      productIdsByPlanId[plan_id] = product_id;
    }

    // Get the user's current subscriptions from auth-server's perspective
    const localSubscriptions = (await db.fetchAccountSubscriptions(uid)) || [];

    // Map local subscriptions by ID
    const localSubscriptionsById = {};
    for (const sub of localSubscriptions) {
      localSubscriptionsById[sub.subscriptionId] = sub;
    }

    // Flag tracking whether we made any changes by the end.
    let madeChanges = false;

    // Create any subscriptions present in subhub but missing from local
    for (const id of Object.keys(subhubSubscriptionsById)) {
      if (id in localSubscriptionsById) {
        continue;
      }
      const {
        subscription_id: subscriptionId,
        plan_id,
      } = subhubSubscriptionsById[id];
      const productId = productIdsByPlanId[plan_id];

      // Note: In the unlikely event that this DB call fails, we bail out here.
      await db.createAccountSubscription({
        uid,
        subscriptionId,
        productId,
        createdAt: Date.now(),
      });

      madeChanges = true;
    }

    // Delete any subscriptions present in local but missing from subhub
    for (const id of Object.keys(localSubscriptionsById)) {
      if (id in subhubSubscriptionsById) {
        continue;
      }
      const { subscriptionId } = localSubscriptionsById[id];

      // Note: In the unlikely event that this DB call fails, we bail out here.
      await db.deleteAccountSubscription({
        uid,
        subscriptionId,
      });

      madeChanges = true;
    }

    // TODO: Should we update any local subscriptions with
    // cancel_at_period_end info? We don't actually use that column

    // If any changes were made, clear caches and send notifications
    if (madeChanges) {
      await profile.deleteCache(uid);
    }

    return madeChanges;
  },
};

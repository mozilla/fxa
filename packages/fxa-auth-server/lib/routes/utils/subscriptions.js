/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

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
};

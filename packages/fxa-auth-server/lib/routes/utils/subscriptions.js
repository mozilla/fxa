/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const PRODUCT_SUBSCRIBED = 'defaultSubscribed';
const PRODUCT_REGISTERED = 'defaultRegistered';

const SubscriptionUtils = (module.exports = {
  PRODUCT_SUBSCRIBED,
  PRODUCT_REGISTERED,

  // Support some default null values for product / plan metadata and
  // allow plan metadata to override product metadata
  metadataFromPlan: plan => ({
    productSet: null,
    productOrder: null,
    emailIconURL: null,
    webIconURL: null,
    upgradeCTA: null,
    downloadURL: null,
    ...plan.product_metadata,
    ...plan.plan_metadata,
  }),

  determineClientVisibleSubscriptionCapabilities: async function(
    config,
    auth,
    db,
    uid,
    client_id,
    stripeHelper,
    email
  ) {
    const capabilitiesToReveal = new Set();

    let subscribedProducts = [];

    if (stripeHelper) {
      subscribedProducts = await fetchSubscribedProductsFromStripe(
        uid,
        stripeHelper,
        email
      );
      await checkCapabilitiesFromStripe(
        subscribedProducts,
        capabilitiesToReveal,
        client_id,
        stripeHelper
      );
    } else {
      // TODO: issue #3846 - remove this conditional branch
      subscribedProducts = await fetchSubscribedProductsFromLocalDB(db, uid);
    }

    // TODO: issue #3913 - remove support for capabilities from server config
    checkCapabilitiesFromServerConfig(
      capabilitiesToReveal,
      subscribedProducts,
      client_id,
      config,
      auth
    );

    return capabilitiesToReveal.size > 0
      ? Array.from(capabilitiesToReveal)
      : undefined;
  },
});

async function fetchSubscribedProductsFromStripe(uid, stripeHelper, email) {
  const customer = await stripeHelper.customer(uid, email);
  if (!customer || !customer.subscriptions.data) {
    return [];
  }

  const subscribedProducts = [
    // All accounts get this psuedo-product
    PRODUCT_REGISTERED,
    ...customer.subscriptions.data.map(
      ({ plan: { product: productId } }) => productId
    ),
  ];

  // Accounts with at least one subscription get this product
  if (subscribedProducts.length > 1) {
    subscribedProducts.push(PRODUCT_SUBSCRIBED);
  }
  return subscribedProducts;
}

async function checkCapabilitiesFromStripe(
  subscribedProducts,
  capabilitiesToReveal,
  client_id,
  stripeHelper
) {
  // Run through all plans and collect capabilitiies for subscribed products
  const plans = await stripeHelper.allPlans();
  for (const plan of plans) {
    if (!subscribedProducts.includes(plan.product_id)) {
      continue;
    }
    const metadata = SubscriptionUtils.metadataFromPlan(plan);
    const capabilityKeys = [
      'capabilities',
      ...Object.keys(metadata).filter(key =>
        client_id === null
          ? key.startsWith('capabilities:')
          : key === `capabilities:${client_id}`
      ),
    ].filter(key => key in metadata);
    for (const key of capabilityKeys) {
      const capabilities = metadata[key].split(',');
      for (const capability of capabilities) {
        capabilitiesToReveal.add(capability);
      }
    }
  }
}

// TODO: issue #3846 - remove this method
async function fetchSubscribedProductsFromLocalDB(db, uid) {
  const subscriptions = (await db.fetchAccountSubscriptions(uid)) || [];
  const subscribedProducts = [
    // All accounts get this psuedo-product
    PRODUCT_REGISTERED,
    ...subscriptions.map(({ productId }) => productId),
  ];
  // Accounts with at least one subscription get this product
  if (subscribedProducts.length > 1) {
    subscribedProducts.push(PRODUCT_SUBSCRIBED);
  }
  return subscribedProducts;
}

// TODO: issue #3913 - remove support for capabilities from server config
function checkCapabilitiesFromServerConfig(
  capabilitiesToReveal,
  subscribedProducts,
  client_id,
  config,
  auth
) {
  const {
    subscriptions: { productCapabilities = {}, clientCapabilities = {} } = {},
  } = config;

  const subscribedCapabilities = subscribedProducts.reduce(
    (capabilities, product) =>
      capabilities.concat(productCapabilities[product] || []),
    []
  );

  const clientVisibleCapabilities = clientCapabilities[client_id] || [];

  subscribedCapabilities
    .filter(
      capability =>
        auth.strategy === 'sessionToken' ||
        clientVisibleCapabilities.includes(capability)
    )
    .forEach(capability => capabilitiesToReveal.add(capability));
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const hex = require('buf').to.hex;

const { metadataFromPlan } = require('fxa-shared').subscriptions.metadata;

const SubscriptionUtils = (module.exports = {
  // Parse a comma-separated list of capabilities with allowance for varied whitespace
  /** @type {(s: [string]) => string[]} */
  splitCapabilities: (s) =>
    (s || '')
      .trim()
      .split(',')
      .map((c) => c.trim())
      .filter((c) => !!c),

  determineSubscriptionCapabilities: async function (stripeHelper, uid, email) {
    if (!stripeHelper) {
      return undefined;
    }
    const subscribedProducts = await fetchSubscribedProductsFromStripe(
      uid,
      stripeHelper,
      email
    );
    return gatherCapabilitiesFromStripe(subscribedProducts, stripeHelper);
  },

  determineClientVisibleSubscriptionCapabilities: function (
    clientIdRaw,
    allCapabilities
  ) {
    if (!allCapabilities) {
      return undefined;
    }
    const clientId =
      clientIdRaw === null ? null : hex(clientIdRaw).toLowerCase();
    let capabilitiesToReveal;
    if (clientId === null) {
      capabilitiesToReveal = new Set(
        Object.values(allCapabilities).reduce(
          (acc, curr) => [...curr, ...acc],
          []
        )
      );
    } else {
      capabilitiesToReveal = new Set([
        ...(allCapabilities['*'] || []),
        ...(allCapabilities[clientId] || []),
      ]);
    }
    return capabilitiesToReveal.size > 0
      ? Array.from(capabilitiesToReveal).sort()
      : undefined;
  },
});

/**
 * Fetch subscribed products from Stripe and format appropriately
 *
 * @param {string} uid
 * @param {import('../../payments/stripe').StripeHelper} stripeHelper
 * @param {string} email
 */
async function fetchSubscribedProductsFromStripe(uid, stripeHelper, email) {
  const customer = await stripeHelper.customer({
    uid,
    email,
    cacheOnly: true,
  });
  if (!customer || !customer.subscriptions.data) {
    return [];
  }
  const subscribedProducts = customer.subscriptions.data
    // TODO: Centralize subscription filtering logic for active subs
    .filter((sub) => ['active', 'trialing', 'past_due'].includes(sub.status))
    .map(({ plan: { product: productId } }) => productId);
  return subscribedProducts;
}

async function gatherCapabilitiesFromStripe(subscribedProducts, stripeHelper) {
  const allCapabilities = {};

  // Run through all plans and collect capabilitiies for subscribed products
  const plans = await stripeHelper.allPlans();
  for (const plan of plans) {
    if (!subscribedProducts.includes(plan.product_id)) {
      continue;
    }
    const metadata = metadataFromPlan(plan);
    const capabilityKeys = Object.keys(metadata).filter((key) =>
      key.startsWith('capabilities')
    );
    for (const key of capabilityKeys) {
      const capabilities = SubscriptionUtils.splitCapabilities(metadata[key]);
      const clientId = key === 'capabilities' ? '*' : key.split(':')[1];
      if (!allCapabilities[clientId]) {
        allCapabilities[clientId] = new Set();
      }
      for (const capability of capabilities) {
        allCapabilities[clientId].add(capability);
      }
    }
  }

  for (const key of Object.keys(allCapabilities)) {
    allCapabilities[key] = Array.from(allCapabilities[key]);
  }

  return allCapabilities;
}

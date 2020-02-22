/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const SubscriptionUtils = (module.exports = {
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

  // Parse a comma-separated list of capabilities with allowance for varied whitespace
  splitCapabilities: s =>
    (s || '')
      .trim()
      .split(',')
      .map(c => c.trim())
      .filter(c => !!c),

  determineClientVisibleSubscriptionCapabilities: async function(
    stripeHelper,
    uid,
    client_id,
    email
  ) {
    if (!stripeHelper) {
      return undefined;
    }
    const subscribedProducts = await fetchSubscribedProductsFromStripe(
      uid,
      stripeHelper,
      email
    );
    const capabilitiesToReveal = await checkCapabilitiesFromStripe(
      subscribedProducts,
      client_id,
      stripeHelper
    );
    return capabilitiesToReveal.size > 0
      ? Array.from(capabilitiesToReveal)
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
  const customer = await stripeHelper.customer(uid, email, false, true);
  if (!customer || !customer.subscriptions.data) {
    return [];
  }

  const subscribedProducts = customer.subscriptions.data
    // TODO: Centralize subscription filtering logic for active subs
    .filter(sub => ['active', 'trialing', 'past_due'].includes(sub.status))
    .map(({ plan: { product: productId } }) => productId);
  return subscribedProducts;
}

async function checkCapabilitiesFromStripe(
  subscribedProducts,
  client_id,
  stripeHelper
) {
  const capabilitiesToReveal = new Set();

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
      const capabilities = SubscriptionUtils.splitCapabilities(metadata[key]);
      for (const capability of capabilities) {
        capabilitiesToReveal.add(capability);
      }
    }
  }

  return capabilitiesToReveal;
}

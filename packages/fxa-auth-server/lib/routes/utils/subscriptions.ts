/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import { PlayBilling } from '../../payments/google-play/play-billing';

import { StripeHelper } from '../../payments/stripe';

function hex(blob: Buffer | string): string {
  const buf = Buffer.isBuffer(blob) ? blob : Buffer.from(blob, 'hex');
  return buf.toString('hex');
}

// Parse a comma-separated list of capabilities with allowance for varied whitespace
export function splitCapabilities(s: string) {
  return (s || '')
    .trim()
    .split(',')
    .map((c) => c.trim())
    .filter((c) => !!c);
}

export async function determineSubscriptionCapabilities(
  stripeHelper: StripeHelper | undefined,
  playBilling: PlayBilling | undefined,
  uid: string,
  email: string
): Promise<Record<string, string[]>> {
  if (!stripeHelper) {
    return {};
  }
  const subscribedProducts = await fetchSubscribedProductsFromStripe(
    uid,
    stripeHelper,
    email
  );
  if (playBilling) {
    subscribedProducts.concat(
      await fetchSubscribedProductsFromPlay(stripeHelper, playBilling, uid)
    );
  }
  return gatherCapabilitiesFromStripe(subscribedProducts, stripeHelper);
}

async function fetchSubscribedProductsFromPlay(
  stripeHelper: StripeHelper,
  playBilling: PlayBilling,
  uid: string
) {
  const purchases = await playBilling.userManager.queryCurrentSubscriptions(
    uid
  );
  return purchases.length === 0
    ? []
    : stripeHelper.purchasesToSubscribedProductIds(purchases);
}

export function determineClientVisibleSubscriptionCapabilities(
  clientIdRaw: Buffer | string | null,
  allCapabilities: Record<string, string[]>
) {
  if (!allCapabilities) {
    return undefined;
  }
  const clientId = clientIdRaw === null ? null : hex(clientIdRaw).toLowerCase();
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
}

/**
 * Fetch subscribed products from Stripe and format appropriately
 */
async function fetchSubscribedProductsFromStripe(
  uid: string,
  stripeHelper: StripeHelper,
  email: string
) {
  const customer = await stripeHelper.customer({
    uid,
    email,
  });
  if (!customer || !customer.subscriptions!.data) {
    return [];
  }
  const subscribedProducts = customer
    .subscriptions!.data // TODO: Centralize subscription filtering logic for active subs
    .filter((sub) => ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status))
    .flatMap((sub) => sub.items.data)
    .map(({ price: { product: productId } }) => productId);
  return subscribedProducts as string[];
}

async function gatherCapabilitiesFromStripe(
  subscribedProducts: string[],
  stripeHelper: StripeHelper
) {
  const allCapabilities: Record<string, Set<string>> = {};

  // Run through all plans and collect capabilities for subscribed products
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
      const capabilities = splitCapabilities((metadata as any)[key]);
      const clientId = key === 'capabilities' ? '*' : key.split(':')[1];
      for (const capability of capabilities) {
        (allCapabilities[clientId] ??= new Set()).add(capability);
      }
    }
  }

  const resultCapabilities: Record<string, string[]> = {};
  for (const key of Object.keys(allCapabilities)) {
    resultCapabilities[key] = Array.from(allCapabilities[key]);
  }

  return resultCapabilities;
}

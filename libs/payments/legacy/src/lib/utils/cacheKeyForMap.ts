import { createHash } from 'crypto';
import Stripe from 'stripe';

const CACHE_KEY = 'stripeMapperCache';

export const cacheKeyForMap = function (
  plans: Stripe.Plan[],
  acceptLanguage: string
): string {
  // Sort variables prior to stringifying to not be caller order dependent
  const planIds = JSON.stringify(plans.map((plan) => plan.id).sort());
  const planIdsHash = createHash('sha256')
    .update(JSON.stringify(planIds))
    .digest('hex');
  return `${CACHE_KEY}:${planIdsHash}:${acceptLanguage}`;
};

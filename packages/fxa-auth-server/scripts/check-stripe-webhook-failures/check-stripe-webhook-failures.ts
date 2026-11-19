/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Stripe from 'stripe';
import { StatsD } from 'hot-shots';

type StripeEvents = {
  events: {
    list(
      params: Stripe.EventListParams
    ): AsyncIterable<Pick<Stripe.Event, 'id'>>;
  };
};

export async function checkStripeWebhookFailures(
  stripe: StripeEvents,
  statsd: Pick<StatsD, 'gauge' | 'increment'>
): Promise<number> {
  statsd.increment('stripe-webhook-failures.startup');

  let failedEventsCount = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of stripe.events.list({
      delivery_success: false,
      limit: 100,
    })) {
      failedEventsCount++;
    }
  } catch (err) {
    statsd.increment('stripe-webhook-failures.shutdown', {
      result: 'failure',
    });
    throw err;
  }

  statsd.gauge('stripe-webhook-failures.failed-events', failedEventsCount);
  statsd.increment('stripe-webhook-failures.shutdown', {
    result: 'success',
  });

  return failedEventsCount;
}

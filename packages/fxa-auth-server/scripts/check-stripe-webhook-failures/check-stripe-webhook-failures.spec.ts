/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';

import { checkStripeWebhookFailures } from './check-stripe-webhook-failures';

type StripeEvents = Parameters<typeof checkStripeWebhookFailures>[0];

async function* failedEvents(count: number) {
  for (let index = 0; index < count; index++) {
    yield { id: `evt_${index}` };
  }
}

async function* failingListing() {
  yield { id: 'evt_0' };
  throw new Error('stripe unavailable');
}

describe('checkStripeWebhookFailures', () => {
  let stripeStub: { events: jest.Mocked<StripeEvents['events']> };
  let statsdStub: jest.Mocked<Pick<StatsD, 'gauge' | 'increment'>>;

  beforeEach(() => {
    stripeStub = {
      events: {
        list: jest.fn().mockReturnValue(failedEvents(3)),
      },
    };
    statsdStub = {
      gauge: jest.fn(),
      increment: jest.fn(),
    };
  });

  it('emits startup', async () => {
    await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(statsdStub.increment).toHaveBeenCalledWith(
      'stripe-webhook-failures.startup'
    );
  });

  it('emits successful shutdown', async () => {
    await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(statsdStub.increment).toHaveBeenCalledWith(
      'stripe-webhook-failures.shutdown',
      { result: 'success' }
    );
  });

  it('lists events whose delivery did not succeed', async () => {
    await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(stripeStub.events.list).toHaveBeenCalledWith({
      delivery_success: false,
      limit: 100,
    });
  });

  it('emits the failed events count as a gauge', async () => {
    await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(statsdStub.gauge).toHaveBeenCalledWith(
      'stripe-webhook-failures.failed-events',
      3
    );
  });

  it('emits zero when no events failed', async () => {
    stripeStub.events.list.mockReturnValue(failedEvents(0));
    await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(statsdStub.gauge).toHaveBeenCalledWith(
      'stripe-webhook-failures.failed-events',
      0
    );
  });

  it('returns the failed events count', async () => {
    const result = await checkStripeWebhookFailures(stripeStub, statsdStub);
    expect(result).toBe(3);
  });

  it('does not emit the gauge when listing fails', async () => {
    stripeStub.events.list.mockReturnValue(failingListing());
    await expect(
      checkStripeWebhookFailures(stripeStub, statsdStub)
    ).rejects.toThrow('stripe unavailable');
    expect(statsdStub.gauge).not.toHaveBeenCalled();
  });

  it('emits failed shutdown when listing fails', async () => {
    stripeStub.events.list.mockReturnValue(failingListing());
    await expect(
      checkStripeWebhookFailures(stripeStub, statsdStub)
    ).rejects.toThrow('stripe unavailable');
    expect(statsdStub.increment).toHaveBeenCalledWith(
      'stripe-webhook-failures.shutdown',
      { result: 'failure' }
    );
  });
});

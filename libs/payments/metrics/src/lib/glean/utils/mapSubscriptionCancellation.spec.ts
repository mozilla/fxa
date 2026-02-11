/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { mapSubscriptionCancellation } from './mapSubscriptionCancellation';
import { CancellationReason } from '../glean.types';

describe('mapSubscriptionCancellation', () => {
  it('should map all values', () => {
    const result = mapSubscriptionCancellation({
      offeringId: 'offeringId',
      interval: 'interval',
      cancellationReason: CancellationReason.CustomerInitiated,
      providerEventId: 'providerEventId',
    });
    expect(result).toEqual({
      subscription_offering_id: 'offeringId',
      subscription_interval: 'interval',
      subscription_provider_event_id: 'providerEventId',
      subscription_cancellation_reason: CancellationReason.CustomerInitiated,
    });
  });

  it('should return empty strings if values are not present', () => {
    const result = mapSubscriptionCancellation({
      offeringId: undefined,
      interval: undefined,
      cancellationReason: CancellationReason.Involuntary,
      providerEventId: 'providerEventId',
    });
    expect(result).toEqual({
      subscription_offering_id: '',
      subscription_interval: '',
      subscription_provider_event_id: 'providerEventId',
      subscription_cancellation_reason: CancellationReason.Involuntary,
    });
  });
});

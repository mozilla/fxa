/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SubscriptionCancellationData } from '../glean.types';
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

export function mapSubscriptionCancellation({
  voluntary,
  providerEventId,
  subscriptionId,
}: SubscriptionCancellationData) {
  return {
    voluntary: voluntary,
    subscription_cancellation_provider_event_id:
      normalizeGleanFalsyValues(providerEventId),
    subscription_cancellation_subscription_id:
      normalizeGleanFalsyValues(subscriptionId),
  };
}

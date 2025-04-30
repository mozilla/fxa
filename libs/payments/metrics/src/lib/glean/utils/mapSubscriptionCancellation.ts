/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { SubscriptionCancellationData } from '../glean.types';
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

export function mapSubscriptionCancellation({
  offeringId,
  interval,
  cancellationReason,
  providerEventId,
}: SubscriptionCancellationData) {
  return {
    subscription_offering_id: normalizeGleanFalsyValues(offeringId),
    subscription_interval: normalizeGleanFalsyValues(interval),
    subscription_provider_event_id: normalizeGleanFalsyValues(providerEventId),
    subscription_cancellation_reason: cancellationReason,
  };
}

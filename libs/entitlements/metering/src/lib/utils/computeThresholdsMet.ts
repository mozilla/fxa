/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure helper: returns the thresholds (as percentages of `limit`) that
 * `currentUsage` meets or exceeds. A threshold is "met" when
 * `currentUsage >= t% * limit`. Returned thresholds preserve the configured
 * order.
 *
 * The cloud-tasks threshold-detection model does not track a "previous"
 * usage value — receivers dedupe deliveries on the dispatcher's stable
 * idempotency key (which includes the threshold + windowStart) so re-firing
 * a met threshold within a window is benign.
 */
export function computeThresholdsMet(
  thresholds: number[],
  currentUsage: number,
  limit: number
): number[] {
  if (limit <= 0) {
    return [];
  }
  return thresholds.filter(
    (threshold) => currentUsage >= (threshold / 100) * limit
  );
}

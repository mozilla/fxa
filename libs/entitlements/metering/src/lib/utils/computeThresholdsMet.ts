/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

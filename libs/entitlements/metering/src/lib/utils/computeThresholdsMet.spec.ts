/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { computeThresholdsMet } from './computeThresholdsMet';

describe('computeThresholdsMet', () => {
  it('returns only the thresholds whose cutoff currentUsage has met', () => {
    expect(computeThresholdsMet([80, 100], 85, 100)).toEqual([80]);
  });

  it('returns all thresholds when currentUsage is at or above the limit', () => {
    expect(computeThresholdsMet([80, 100], 100, 100)).toEqual([80, 100]);
  });

  it('treats exactly-at-threshold as met', () => {
    expect(computeThresholdsMet([80], 80, 100)).toEqual([80]);
  });

  it('returns [] when currentUsage is zero', () => {
    expect(computeThresholdsMet([80, 100], 0, 100)).toEqual([]);
  });

  it('returns [] when limit is zero or negative', () => {
    expect(computeThresholdsMet([80], 50, 0)).toEqual([]);
    expect(computeThresholdsMet([80], 50, -10)).toEqual([]);
  });

  it('preserves the configured threshold order', () => {
    expect(computeThresholdsMet([100, 50, 80], 100, 100)).toEqual([
      100, 50, 80,
    ]);
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '@playwright/test';

import { median, usedBytes } from './metrics';

test.describe('median', () => {
  test('returns the middle value of unsorted input', () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  test('averages the two middle values of an even-length list', () => {
    expect(median([3, 1])).toBe(2);
  });

  test('rounds a single value', () => {
    expect(median([2.4])).toBe(2);
  });
});

test.describe('usedBytes', () => {
  test('marks only the bytes of a nested unused range as unused', () => {
    const ranges = [
      { startOffset: 0, endOffset: 10, count: 1 },
      { startOffset: 2, endOffset: 5, count: 0 },
    ];
    expect(usedBytes('abcdefghij', [{ ranges }])).toBe(7);
  });

  test('counts bytes outside any range as used', () => {
    expect(usedBytes('abcd', [])).toBe(4);
  });
});

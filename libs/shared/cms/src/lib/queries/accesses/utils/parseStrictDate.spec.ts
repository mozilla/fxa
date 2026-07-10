/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { parseStrictDate } from './parseStrictDate';

describe('parseStrictDate', () => {
  it('returns the start of the day after the named date in UTC', () => {
    expect(parseStrictDate('2026-12-31')?.toISOString()).toBe(
      '2027-01-01T00:00:00.000Z'
    );
  });

  it.each([
    { dateStr: '12/31/2026' }, // wrong format
    { dateStr: '2026-1-1' }, // single-digit components
    { dateStr: '2026/12/31' }, // wrong separator
    { dateStr: '' }, // empty
    { dateStr: '2026-13-01' }, // month out of range
    { dateStr: '2026-02-30' }, // invalid calendar date
    { dateStr: '2026-04-31' }, // invalid calendar date (April has 30)
  ])('returns undefined for invalid input "$dateStr"', ({ dateStr }) => {
    expect(parseStrictDate(dateStr)).toBeUndefined();
  });

  it('rolls Feb-29 in a leap year to March 1 UTC', () => {
    // 2028 is a leap year.
    expect(parseStrictDate('2028-02-29')?.toISOString()).toBe(
      '2028-03-01T00:00:00.000Z'
    );
  });

  it('rejects Feb-29 in a non-leap year', () => {
    expect(parseStrictDate('2026-02-29')).toBeUndefined();
  });
});

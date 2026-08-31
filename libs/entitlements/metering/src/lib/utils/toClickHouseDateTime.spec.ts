/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { toClickHouseDateTime } from './toClickHouseDateTime';

describe('toClickHouseDateTime', () => {
  it('formats a date as a space-separated UTC datetime with milliseconds', () => {
    expect(toClickHouseDateTime(new Date('2026-05-07T15:23:45.123Z'))).toBe(
      '2026-05-07 15:23:45.123'
    );
  });

  it('keeps a zero millisecond component', () => {
    expect(toClickHouseDateTime(new Date('2026-05-07T00:00:00.000Z'))).toBe(
      '2026-05-07 00:00:00.000'
    );
  });

  it('formats in UTC regardless of the local zone', () => {
    expect(
      toClickHouseDateTime(new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0)))
    ).toBe('2026-01-01 00:00:00.000');
  });
});

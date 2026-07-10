/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { parseMatcherValue } from './parseMatcherValue';

describe('parseMatcherValue', () => {
  it('parses a [date, description] tuple', () => {
    expect(parseMatcherValue(['2026-12-31', 'VIP'])).toEqual({
      dateStr: '2026-12-31',
      description: 'VIP',
    });
  });

  it('accepts a date-only single-element tuple', () => {
    expect(parseMatcherValue(['2026-12-31'])).toEqual({
      dateStr: '2026-12-31',
      description: undefined,
    });
  });

  it('drops a non-string description', () => {
    expect(parseMatcherValue(['2026-12-31', 42])).toEqual({
      dateStr: '2026-12-31',
      description: undefined,
    });
  });

  it.each([
    { value: null, label: 'null' },
    { value: undefined, label: 'undefined' },
    { value: 'plain-string', label: 'string' },
    { value: 42, label: 'number' },
    { value: { foo: 'bar' }, label: 'object' },
    { value: [], label: 'empty array' },
    { value: ['', 'desc'], label: 'empty date string' },
    { value: [42, 'desc'], label: 'non-string date' },
  ])('returns undefined for $label input', ({ value }) => {
    expect(parseMatcherValue(value)).toBeUndefined();
  });
});

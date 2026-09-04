/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { flattenRouteParams } from './flatParam';

describe('flattenRouteParams', () => {
  it('passes through string values unchanged', () => {
    const result = flattenRouteParams({ locale: 'en', page: 'checkout' });

    expect(result).toEqual({ locale: 'en', page: 'checkout' });
  });

  it('joins array values with commas', () => {
    const result = flattenRouteParams({ tags: ['a', 'b', 'c'] });

    expect(result).toEqual({ tags: 'a,b,c' });
  });

  it('omits keys with undefined values', () => {
    const result = flattenRouteParams({
      locale: 'en',
      missing: undefined,
    });

    expect(result).toEqual({ locale: 'en' });
  });

  it('omits keys with null values', () => {
    const params: Record<string, string | string[] | undefined> = {
      locale: 'en',
      empty: null as any,
    };

    const result = flattenRouteParams(params);

    expect(result).toEqual({ locale: 'en' });
  });

  it('handles a single-element array', () => {
    const result = flattenRouteParams({ id: ['only-one'] });

    expect(result).toEqual({ id: 'only-one' });
  });

  it('returns an empty object for empty input', () => {
    const result = flattenRouteParams({});

    expect(result).toEqual({});
  });

  it('handles mixed string, array, and undefined values', () => {
    const result = flattenRouteParams({
      locale: 'en',
      tags: ['x', 'y'],
      missing: undefined,
      id: 'abc',
    });

    expect(result).toEqual({
      locale: 'en',
      tags: 'x,y',
      id: 'abc',
    });
  });
});

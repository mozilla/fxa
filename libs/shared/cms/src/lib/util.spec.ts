/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { meterBySlugQuery } from './queries/meter/query';
import { pageContentByPriceIdsQuery } from './queries/page-content-by-price-ids/query';
import { cacheKeyForQuery, CMS_QUERY_CACHE_KEY } from './util';

describe('cacheKeyForQuery', () => {
  it('returns the prefix, a query hash and a variables hash', () => {
    const key = cacheKeyForQuery(meterBySlugQuery, { slug: 'meter-slug' });

    expect(key).toMatch(
      new RegExp(`^${CMS_QUERY_CACHE_KEY}:[0-9a-f]{64}:[0-9a-f]{64}$`)
    );
  });

  it('returns the same key when the variables are in a different order', () => {
    const key = cacheKeyForQuery(pageContentByPriceIdsQuery, {
      locale: 'en',
      stripePlanIds: ['plan_1', 'plan_2'],
    });
    const reorderedKey = cacheKeyForQuery(pageContentByPriceIdsQuery, {
      stripePlanIds: ['plan_1', 'plan_2'],
      locale: 'en',
    });

    expect(reorderedKey).toBe(key);
  });

  it.each([
    { field: 'locale', changed: { locale: 'fr', stripePlanIds: ['plan_1'] } },
    {
      field: 'stripePlanIds',
      changed: { locale: 'en', stripePlanIds: ['plan_2'] },
    },
  ])('returns a different key when $field changes', ({ changed }) => {
    const key = cacheKeyForQuery(pageContentByPriceIdsQuery, {
      locale: 'en',
      stripePlanIds: ['plan_1'],
    });

    expect(cacheKeyForQuery(pageContentByPriceIdsQuery, changed)).not.toBe(key);
  });

  it('returns a different key for a different query with the same variables', () => {
    const variables = { locale: 'en', slug: 'x', stripePlanIds: ['plan_1'] };

    expect(cacheKeyForQuery(meterBySlugQuery, variables)).not.toBe(
      cacheKeyForQuery(pageContentByPriceIdsQuery, variables)
    );
  });
});

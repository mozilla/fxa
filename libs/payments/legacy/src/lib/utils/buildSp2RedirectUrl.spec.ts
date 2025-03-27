/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildSp2RedirectUrl } from './buildSp2RedirectUrl';

describe('buildSp2RedirectUrl', () => {
  const defaultProductId = 'prod_123';
  const defaultPriceId = 'price_123';
  const defaultContentServerUrl = 'http://content-server.com';
  const defaultSearchParams = new URLSearchParams(
    'flow_id=one&flow_begin_time=123'
  );

  it('should return the correct URL', () => {
    const result = buildSp2RedirectUrl(
      defaultProductId,
      defaultPriceId,
      defaultContentServerUrl,
      defaultSearchParams
    );
    expect(result).toBe(
      'http://content-server.com/subscriptions/products/prod_123?plan=price_123&flow_id=one&flow_begin_time=123'
    );
  });

  it('should remove SP2 redirect logic specific query params', () => {
    defaultSearchParams.append('currency', 'USD');
    defaultSearchParams.append('spVersion', '2');
    const result = buildSp2RedirectUrl(
      defaultProductId,
      defaultPriceId,
      defaultContentServerUrl,
      defaultSearchParams
    );
    expect(result).toBe(
      'http://content-server.com/subscriptions/products/prod_123?plan=price_123&flow_id=one&flow_begin_time=123'
    );
  });

  it('should send no query params', () => {
    const defaultSearchParams = new URLSearchParams();
    const result = buildSp2RedirectUrl(
      defaultProductId,
      defaultPriceId,
      defaultContentServerUrl,
      defaultSearchParams
    );
    expect(result).toBe(
      'http://content-server.com/subscriptions/products/prod_123?plan=price_123'
    );
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { buildRedirectUrl } from './buildRedirectUrl';
import type { Page } from './types';

describe('buildRedirectUrl', () => {
  const OFFERING_ID = 'vpn';
  const INTERVAL = 'monthly';

  it('builds a basic URL with offeringId, interval, page, and pageType', () => {
    expect(buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout')).toBe(
      '/vpn/monthly/checkout/start'
    );
  });

  it.each(['landing', 'new', 'location', 'page-not-found'] as Page[])(
    'omits the pageType prefix for the %s page',
    (page) => {
      expect(buildRedirectUrl(OFFERING_ID, INTERVAL, page, 'checkout')).toBe(
        `/vpn/monthly/${page}`
      );
    }
  );

  it('omits the pageType prefix for the error page when no cartId is provided', () => {
    expect(buildRedirectUrl(OFFERING_ID, INTERVAL, 'error', 'checkout')).toBe(
      '/vpn/monthly/error'
    );
  });

  it('includes the pageType prefix for the error page when a cartId is provided', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'error', 'checkout', {
        cartId: 'cart_123',
      })
    ).toBe('/vpn/monthly/checkout/cart_123/error');
  });

  it('includes the cartId segment when provided', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout', {
        cartId: 'cart_123',
      })
    ).toBe('/vpn/monthly/checkout/cart_123/start');
  });

  it('includes the locale prefix when provided', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout', {
        locale: 'en',
      })
    ).toBe('/en/vpn/monthly/checkout/start');
  });

  it('uses the baseUrl when provided', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout', {
        baseUrl: 'https://payments.example.com',
      })
    ).toBe('https://payments.example.com/vpn/monthly/checkout/start');
  });

  it('does not double the slash when baseUrl is "/"', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout', {
        baseUrl: '/',
      })
    ).toBe('/vpn/monthly/checkout/start');
  });

  it('appends search params as a query string', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'start', 'checkout', {
        searchParams: { utm_source: 'email', ref: 'banner' },
      })
    ).toBe('/vpn/monthly/checkout/start?utm_source=email&ref=banner');
  });

  it('builds a URL with all optional parameters combined', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'success', 'upgrade', {
        baseUrl: 'https://payments.example.com',
        locale: 'de',
        cartId: 'cart_456',
        searchParams: { coupon: 'SAVE20' },
      })
    ).toBe(
      'https://payments.example.com/de/vpn/monthly/upgrade/cart_456/success?coupon=SAVE20'
    );
  });

  it('works with the upgrade pageType', () => {
    expect(
      buildRedirectUrl(OFFERING_ID, INTERVAL, 'processing', 'upgrade')
    ).toBe('/vpn/monthly/upgrade/processing');
  });
});

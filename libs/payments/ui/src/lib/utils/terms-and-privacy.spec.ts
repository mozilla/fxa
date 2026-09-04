/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  buildFirefoxAccountsTerms,
  buildPaymentTerms,
  buildProductTerms,
  PaymentProviders,
} from './terms-and-privacy';

describe('buildPaymentTerms', () => {
  it('returns Stripe privacy link for Stripe provider with active subscription', () => {
    const result = buildPaymentTerms(
      { type: PaymentProviders.stripe },
      true
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Stripe');
    expect(result[0].items).toEqual([
      expect.objectContaining({
        href: 'https://stripe.com/privacy',
        text: 'Stripe privacy policy',
      }),
    ]);
  });

  it('returns PayPal privacy link for PayPal provider with active subscription', () => {
    const result = buildPaymentTerms({ type: PaymentProviders.paypal }, true);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('PayPal');
    expect(result[0].items).toEqual([
      expect.objectContaining({
        href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
        text: 'PayPal privacy policy',
      }),
    ]);
  });

  it('returns both Stripe and PayPal links when no active subscription', () => {
    const result = buildPaymentTerms(undefined, false);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Stripe and PayPal');
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[0]).toEqual(
      expect.objectContaining({
        href: 'https://stripe.com/privacy',
      })
    );
    expect(result[0].items[1]).toEqual(
      expect.objectContaining({
        href: 'https://www.paypal.com/webapps/mpp/ua/privacy-full',
      })
    );
  });

  it('returns Stripe privacy link for Link provider with active subscription', () => {
    const result = buildPaymentTerms(
      { type: PaymentProviders.link },
      true
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Stripe');
    expect(result[0].items).toEqual([
      expect.objectContaining({
        href: 'https://stripe.com/privacy',
      }),
    ]);
  });
});

describe('buildFirefoxAccountsTerms', () => {
  it('returns no items when showFxaLinks is false', () => {
    expect(buildFirefoxAccountsTerms(false)).toEqual([]);
  });

  it('returns Mozilla Accounts ToS and Privacy links pointing to mozilla.org', () => {
    const result = buildFirefoxAccountsTerms(true);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Mozilla Accounts');
    expect(result[0].items).toEqual([
      expect.objectContaining({
        href: 'https://www.mozilla.org/about/legal/terms/services/',
        text: 'Terms of Service',
      }),
      expect.objectContaining({
        href: 'https://www.mozilla.org/privacy/mozilla-accounts/',
        text: 'Privacy Notice',
      }),
    ]);
  });
});

describe('buildProductTerms', () => {
  const PRODUCT_NAME = 'Mozilla VPN';
  const TOS_URL =
    'https://www.mozilla.org/about/legal/terms/subscription-services/';
  const PRIVACY_URL = 'https://www.mozilla.org/privacy/subscription-services/';

  it('returns no items when neither url is provided', () => {
    expect(buildProductTerms(PRODUCT_NAME)).toEqual([]);
  });

  it('titles the group with the product name', () => {
    const result = buildProductTerms(PRODUCT_NAME, TOS_URL, PRIVACY_URL);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe(PRODUCT_NAME);
  });

  it('returns only the Terms of Service and Privacy Notice links', () => {
    const result = buildProductTerms(PRODUCT_NAME, TOS_URL, PRIVACY_URL);

    expect(result[0].items).toEqual([
      expect.objectContaining({ href: TOS_URL, text: 'Terms of Service' }),
      expect.objectContaining({ href: PRIVACY_URL, text: 'Privacy Notice' }),
    ]);
  });

  it('omits the Terms of Service link when its url is absent', () => {
    const result = buildProductTerms(PRODUCT_NAME, undefined, PRIVACY_URL);

    expect(result[0].items).toEqual([
      expect.objectContaining({ href: PRIVACY_URL, text: 'Privacy Notice' }),
    ]);
  });

  it('omits the Privacy Notice link when its url is absent', () => {
    const result = buildProductTerms(PRODUCT_NAME, TOS_URL, undefined);

    expect(result[0].items).toEqual([
      expect.objectContaining({ href: TOS_URL, text: 'Terms of Service' }),
    ]);
  });
});

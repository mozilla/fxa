/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  buildPaymentTerms,
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
    const result = buildPaymentTerms(
      { type: PaymentProviders.paypal },
      true
    );

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

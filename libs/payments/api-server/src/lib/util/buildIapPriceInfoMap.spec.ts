/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePriceFactory,
  StripePriceRecurringFactory,
  StripeProductFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';

import {
  AppleIapPurchaseFactory,
  GoogleIapPurchaseFactory,
  IapOfferingFactory,
} from '../billing-and-subscriptions.factories';
import { buildIapPriceInfoMap } from './buildIapPriceInfoMap';

const buildIapOfferings = (
  byStoreId: Record<string, ReturnType<typeof IapOfferingFactory> | undefined>
) =>
  ({
    getIapPageContentByStoreId: (storeId: string) => byStoreId[storeId],
  } as never);

describe('buildIapPriceInfoMap', () => {
  it('returns an empty map when there are no purchases', () => {
    const result = buildIapPriceInfoMap({
      iapOfferings: buildIapOfferings({}),
      pricesByStoreId: new Map(),
      productsByPriceId: new Map(),
      googlePurchases: [],
      applePurchases: [],
    });

    expect(result.size).toBe(0);
  });

  it('populates entries for google and apple purchases', () => {
    const googlePurchase = GoogleIapPurchaseFactory({ sku: 'google_sku' });
    const applePurchase = AppleIapPurchaseFactory({ productId: 'apple_sku' });
    const googlePrice = StripePriceFactory({
      id: 'price_g',
      product: 'prod_g',
      recurring: StripePriceRecurringFactory({ interval: 'month' }),
    });
    const applePrice = StripePriceFactory({
      id: 'price_a',
      product: 'prod_a',
      recurring: StripePriceRecurringFactory({ interval: 'month' }),
    });
    const googleProduct = StripeResponseFactory(
      StripeProductFactory({ id: 'prod_g', name: 'Google IAP' })
    );
    const appleProduct = StripeResponseFactory(
      StripeProductFactory({ id: 'prod_a', name: 'Apple IAP' })
    );

    const result = buildIapPriceInfoMap({
      iapOfferings: buildIapOfferings({
        google_sku: IapOfferingFactory({
          storeId: 'google_sku',
          stripePlanChoice: googlePrice.id,
        }),
        apple_sku: IapOfferingFactory({
          storeId: 'apple_sku',
          stripePlanChoice: applePrice.id,
        }),
      }),
      pricesByStoreId: new Map([
        ['google_sku', googlePrice],
        ['apple_sku', applePrice],
      ]),
      productsByPriceId: new Map([
        [googlePrice.id, googleProduct],
        [applePrice.id, appleProduct],
      ]),
      googlePurchases: [googlePurchase] as never,
      applePurchases: [applePurchase] as never,
    });

    expect(result.get('google_sku')).toMatchObject({
      priceId: googlePrice.id,
      productId: 'prod_g',
      productName: 'Google IAP',
    });
    expect(result.get('apple_sku')).toMatchObject({
      priceId: applePrice.id,
      productId: 'prod_a',
      productName: 'Apple IAP',
    });
  });

  it('throws when the CMS has no offering for a storeId', () => {
    const googlePurchase = GoogleIapPurchaseFactory({ sku: 'unknown_sku' });

    expect(() =>
      buildIapPriceInfoMap({
        iapOfferings: buildIapOfferings({}),
        pricesByStoreId: new Map(),
        productsByPriceId: new Map(),
        googlePurchases: [googlePurchase] as never,
        applePurchases: [],
      })
    ).toThrow(/storeId=unknown_sku/);
  });

  it('throws when no Stripe price is found for the offering', () => {
    const googlePurchase = GoogleIapPurchaseFactory({ sku: 'google_sku' });

    expect(() =>
      buildIapPriceInfoMap({
        iapOfferings: buildIapOfferings({
          google_sku: IapOfferingFactory({ storeId: 'google_sku' }),
        }),
        pricesByStoreId: new Map(),
        productsByPriceId: new Map(),
        googlePurchases: [googlePurchase] as never,
        applePurchases: [],
      })
    ).toThrow(/Stripe price not found/);
  });

  it('throws when no Stripe product is found for the price', () => {
    const googlePurchase = GoogleIapPurchaseFactory({ sku: 'google_sku' });
    const googlePrice = StripePriceFactory({
      id: 'price_g',
      product: 'prod_g',
      recurring: StripePriceRecurringFactory({ interval: 'month' }),
    });

    expect(() =>
      buildIapPriceInfoMap({
        iapOfferings: buildIapOfferings({
          google_sku: IapOfferingFactory({
            storeId: 'google_sku',
            stripePlanChoice: googlePrice.id,
          }),
        }),
        pricesByStoreId: new Map([['google_sku', googlePrice]]),
        productsByPriceId: new Map(),
        googlePurchases: [googlePurchase] as never,
        applePurchases: [],
      })
    ).toThrow(/Stripe product not found/);
  });
});

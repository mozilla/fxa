/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  AppStoreSubscriptionPurchase,
  PlayStoreSubscriptionPurchase,
} from '@fxa/payments/iap';
import type { StripePrice, StripeProduct } from '@fxa/payments/stripe';
import type { IapOfferingsByStoreIDsResultUtil } from '@fxa/shared/cms';

import type { PriceInfo } from '../billing-and-subscriptions.schema';
import { mapPriceInfo } from './mapPriceInfo';

export type IapPriceInfoEntry = {
  priceId: string;
  productId: string;
  productName: string;
  priceInfo: PriceInfo;
};

export type IapStoreEntry = {
  storeId: string;
  currency?: string | null;
};

/**
 * Build the per-storeId IAP price-info entries used when shaping the
 * billing-and-subscriptions response. Pure: callers pre-fetch the CMS
 * offerings, Stripe prices keyed by storeId, and Stripe products keyed
 * by price.id.
 */
export const buildIapPriceInfoMap = (input: {
  iapOfferings: IapOfferingsByStoreIDsResultUtil;
  pricesByStoreId: Map<string, StripePrice>;
  productsByPriceId: Map<string, StripeProduct>;
  googlePurchases: PlayStoreSubscriptionPurchase[];
  applePurchases: AppStoreSubscriptionPurchase[];
}): Map<string, IapPriceInfoEntry> => {
  const {
    iapOfferings,
    pricesByStoreId,
    productsByPriceId,
    googlePurchases,
    applePurchases,
  } = input;

  const map = new Map<string, IapPriceInfoEntry>();

  const storeEntries: IapStoreEntry[] = [
    ...googlePurchases.map((purchase) => ({
      storeId: purchase.sku,
      currency: purchase.priceCurrencyCode,
    })),
    ...applePurchases.map((purchase) => ({
      storeId: purchase.productId,
      // `currency` is a private field on AppStoreSubscriptionPurchase but
      // is needed to look up the correct Stripe price for the offering
      currency: (purchase as unknown as { currency?: string }).currency,
    })),
  ];

  for (const { storeId, currency } of storeEntries) {
    const offering = iapOfferings.getIapPageContentByStoreId(storeId);
    if (!offering) {
      throw new Error(
        `IAP offering CMS config not found for storeId=${storeId}`
      );
    }
    const price = pricesByStoreId.get(storeId);
    if (!price) {
      throw new Error(
        `Stripe price not found for IAP offering storeId=${storeId}`
      );
    }
    const product = productsByPriceId.get(price.id);
    if (!product) {
      throw new Error(
        `Stripe product not found for IAP offering storeId=${storeId} priceId=${price.id}`
      );
    }
    map.set(storeId, {
      priceId: price.id,
      productId: price.product,
      productName: product.name,
      priceInfo: mapPriceInfo(price, currency),
    });
  }

  return map;
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  SubscriptionCancellationData,
} from './glean.types';
import { ResultCartFactory } from '@fxa/payments/cart';
import { SubplatInterval } from '@fxa/payments/customer';

export const CheckoutParamsFactory = (
  override?: Record<string, string>
): Record<string, string> => ({
  locale: faker.helpers.arrayElement(['en-US', 'de', 'es', 'fr-FR']),
  offeringId: faker.helpers.arrayElement([
    'vpn',
    'relay-phone',
    'relay-email',
    'hubs',
    'mdnplus',
  ]),
  interval: faker.helpers.enumValue(SubplatInterval),
  cartId: faker.string.uuid(),
  ...override,
});

export const CommonMetricsFactory = (
  override?: Partial<CommonMetrics>
): CommonMetrics => ({
  ipAddress: faker.internet.ip(),
  deviceType: faker.string.alphanumeric(),
  userAgent: faker.internet.userAgent(),
  params: {},
  searchParams: {},
  ...override,
});

export const CartMetricsFactory = (
  override?: Partial<CartMetrics>
): CartMetrics => {
  const resultCart = ResultCartFactory({
    ...override,
  });

  return {
    uid: resultCart.uid,
    errorReasonId: resultCart.errorReasonId,
    couponCode: resultCart.couponCode,
    currency: faker.finance.currencyCode(),
    ...override,
  };
};

export const CmsMetricsDataFactory = (
  override?: Partial<CmsMetricsData>
): CmsMetricsData => ({
  productId: `product_${faker.string.alphanumeric({ length: 14 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

export const SubscriptionCancellationDataFactory = (
  override?: Partial<SubscriptionCancellationData>
): SubscriptionCancellationData => ({
  voluntary: true,
  providerEventId: `evt_${faker.string.alphanumeric({ length: 14 })}`,
  subscriptionId: `sub_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

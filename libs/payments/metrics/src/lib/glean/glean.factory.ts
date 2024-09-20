/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  FxaPaySetupMetrics,
  FxaPaySetupViewMetrics,
} from './glean.types';
import { ResultCartFactory } from '@fxa/payments/cart';

export const ParamsFactory = (
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
  interval: faker.helpers.arrayElement([
    'daily',
    'weekly',
    'monthly',
    '6monthly',
    'yearly',
  ]),
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
  const resultCart = ResultCartFactory();

  return {
    uid: resultCart.uid,
    errorReasonId: resultCart.errorReasonId,
    couponCode: resultCart.couponCode,
    currency: faker.finance.currencyCode(),
    ...override,
  };
};

export const FxaPaySetupMetricsFactory = (
  override?: Partial<FxaPaySetupMetrics>
): FxaPaySetupMetrics => ({
  ...CommonMetricsFactory(),
  ...CartMetricsFactory(),
  ...override,
});

export const FxaPaySetupViewMetricsFactory = (
  override?: Partial<FxaPaySetupViewMetrics>
): FxaPaySetupViewMetrics => ({
  ...FxaPaySetupMetricsFactory(),
  checkoutType: faker.helpers.arrayElement([
    'with-accounts',
    'without-accounts',
  ]),
  ...override,
});

export const CmsMetricsDataFactory = (
  override?: Partial<CmsMetricsData>
): CmsMetricsData => ({
  productId: `product_${faker.string.alphanumeric({ length: 14 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 14 })}`,
  ...override,
});

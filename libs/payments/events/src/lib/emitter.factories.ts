/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { AdditionalMetricsData, SubscriptionEnded } from './emitter.types';
import {
  CartMetricsFactory,
  CmsMetricsDataFactory,
} from '@fxa/payments/metrics';

export const AdditionalMetricsDataFactory = (
  override?: AdditionalMetricsData
): AdditionalMetricsData => ({
  cmsMetricsData: CmsMetricsDataFactory(),
  cartMetricsData: CartMetricsFactory(),
  ...override,
});

export const SubscriptionEndedFactory = (
  override?: Partial<SubscriptionEnded>
): SubscriptionEnded => ({
  productId: `prod_${faker.string.alphanumeric({ length: 24 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 24 })}`,
  providerEventId: faker.string.uuid(),
  subscriptionId: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  voluntaryCancellation: true,
  ...override,
});

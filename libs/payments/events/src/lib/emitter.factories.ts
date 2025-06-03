/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import {
  AdditionalMetricsData,
  SP3RolloutEvent,
  SubscriptionEndedEvents,
  type AuthEvents,
} from './emitter.types';
import {
  CancellationReason,
  CartMetricsFactory,
  CmsMetricsDataFactory,
} from '@fxa/payments/metrics';
import { SubplatInterval } from '@fxa/payments/customer';

export const AuthEventsFactory = (
  override?: Partial<AuthEvents>
): AuthEvents => ({
  type: faker.helpers.arrayElement(['signin', 'signout', 'prompt_none_fail', 'error']),
  ...override
})

export const AdditionalMetricsDataFactory = (
  override?: AdditionalMetricsData
): AdditionalMetricsData => ({
  cmsMetricsData: CmsMetricsDataFactory(),
  cartMetricsData: CartMetricsFactory(),
  ...override,
});

export const SubscriptionEndedFactory = (
  override?: Partial<SubscriptionEndedEvents>
): SubscriptionEndedEvents => ({
  productId: `prod_${faker.string.alphanumeric({ length: 24 })}`,
  priceId: `price_${faker.string.alphanumeric({ length: 24 })}`,
  priceInterval: faker.helpers.arrayElement(['month', 'year']),
  priceIntervalCount: faker.number.int({ min: 1, max: 12 }),
  providerEventId: faker.string.uuid(),
  cancellationReason: faker.helpers.enumValue(CancellationReason),
  uid: faker.string.uuid(),
  ...override,
});

export const SP3RolloutEventFactory = (
  override?: Partial<SP3RolloutEvent>
): SP3RolloutEvent => ({
  version: faker.helpers.arrayElement(['2', '3']),
  offeringId: faker.helpers.arrayElement([
    'vpn',
    'relay-phone',
    'relay-email',
    'hubs',
    'mdnplus',
  ]),
  interval: faker.helpers.enumValue(SubplatInterval),
  shadowMode: faker.datatype.boolean(),
  ...override,
});

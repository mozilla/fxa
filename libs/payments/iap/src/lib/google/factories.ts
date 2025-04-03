/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  DeveloperNotification,
  NotificationType,
  SubscriptionNotification,
} from './types';

export const SubscriptionNotificationFactory = (
  override?: Partial<SubscriptionNotification>
): SubscriptionNotification => ({
  version: `${faker.number.float({ min: 1.0, max: 5.0 })}`,
  notificationType: faker.helpers.enumValue(NotificationType),
  purchaseToken: faker.string.uuid(),
  subscriptionId: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  ...override,
});

export const DeveloperNotificationFactory = (
  override?: Partial<DeveloperNotification>
): DeveloperNotification => ({
  version: `${faker.number.float({ min: 1.0, max: 5.0 })}`,
  packageName: faker.internet.domainName(),
  eventTimeMillis: faker.date.recent().getTime(),
  ...override,
});

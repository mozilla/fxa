/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  METERING_WINDOWS,
  MeterBySlugResult,
  StrapiMeter,
  StrapiMeterWebhook,
} from './types';

export const StrapiMeterWebhookFactory = (
  override?: Partial<StrapiMeterWebhook>
): StrapiMeterWebhook => ({
  url: faker.internet.url(),
  signingClientId: faker.string.uuid(),
  ...override,
});

export const StrapiMeterFactory = (
  override?: Partial<StrapiMeter>
): StrapiMeter => ({
  slug: faker.lorem.slug(),
  unit: faker.string.sample(),
  limit: faker.number.int({ min: 1, max: 1000 }),
  window: faker.helpers.arrayElement(METERING_WINDOWS),
  notificationThresholds: Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => faker.number.int({ min: 1, max: 100 })
  ).join(','),
  webhooks: [StrapiMeterWebhookFactory()],
  ...override,
});

export const MeterBySlugResultFactory = (
  override?: Partial<MeterBySlugResult>
): MeterBySlugResult => ({
  meters: [StrapiMeterFactory()],
  ...override,
});

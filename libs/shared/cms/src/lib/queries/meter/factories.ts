/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  METERING_CALENDAR_PERIODS,
  MeterBySlugResult,
  StrapiMeter,
  StrapiMeterRaw,
  StrapiMeterWebhook,
} from './types';

export const StrapiMeterWebhookFactory = (
  override?: Partial<StrapiMeterWebhook>
): StrapiMeterWebhook => ({
  url: faker.internet.url(),
  signingClientId: faker.string.uuid(),
  ...override,
});

const strapiMeterFields = () => ({
  slug: faker.lorem.slug(),
  unit: faker.string.sample(),
  limit: faker.number.int({ min: 1, max: 1000 }),
  notificationThresholds: Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => faker.number.int({ min: 1, max: 100 })
  ).join(','),
  webhooks: [StrapiMeterWebhookFactory()],
});

export const StrapiMeterRawFactory = (
  override?: Partial<StrapiMeterRaw>
): StrapiMeterRaw => ({
  ...strapiMeterFields(),
  window: faker.helpers.arrayElement(METERING_CALENDAR_PERIODS),
  ...override,
});

export const StrapiMeterFactory = (
  override?: Partial<StrapiMeter>
): StrapiMeter => ({
  ...strapiMeterFields(),
  window: {
    kind: 'calendar',
    period: faker.helpers.arrayElement(METERING_CALENDAR_PERIODS),
  },
  ...override,
});

export const MeterBySlugResultFactory = (
  override?: Partial<MeterBySlugResult>
): MeterBySlugResult => ({
  meters: [StrapiMeterRawFactory()],
  ...override,
});

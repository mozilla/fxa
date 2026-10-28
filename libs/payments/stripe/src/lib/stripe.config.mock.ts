/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { StripeConfig } from './stripe.config';

export const MockStripeConfig = {
  apiKey: faker.string.uuid(),
  webhookSecret: faker.string.uuid(),
  taxIds: { EUR: 'EU1234' },
} satisfies StripeConfig;

export const MockStripeConfigProvider = {
  provide: StripeConfig,
  useValue: MockStripeConfig,
} satisfies Provider<StripeConfig>;

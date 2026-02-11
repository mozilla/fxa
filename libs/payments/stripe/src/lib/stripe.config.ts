/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Transform } from 'class-transformer';
import { IsObject, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';

export class StripeConfig {
  @IsString()
  public readonly apiKey!: string;

  @IsString()
  public readonly webhookSecret!: string;

  @Transform(
    ({ value }) => (value instanceof Object ? value : JSON.parse(value)),
    { toClassOnly: true }
  )
  @IsObject()
  public readonly taxIds!: { [key: string]: string };
}

export const MockStripeConfig = {
  apiKey: faker.string.uuid(),
  webhookSecret: faker.string.uuid(),
  taxIds: { EUR: 'EU1234' },
} satisfies StripeConfig;

export const MockStripeConfigProvider = {
  provide: StripeConfig,
  useValue: MockStripeConfig,
} satisfies Provider<StripeConfig>;

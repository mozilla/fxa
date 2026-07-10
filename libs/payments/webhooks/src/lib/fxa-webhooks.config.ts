/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class FxaWebhookConfig {
  @IsString()
  public readonly fxaWebhookIssuer!: string;

  @IsString()
  public readonly fxaWebhookAudience!: string;

  @IsString()
  public readonly fxaWebhookJwksUri!: string;
}

export const MockFxaWebhookConfig = {
  fxaWebhookIssuer: faker.internet.url(),
  fxaWebhookAudience: faker.string.hexadecimal({ length: 16 }),
  fxaWebhookJwksUri: faker.internet.url(),
} satisfies FxaWebhookConfig;

export const MockFxaWebhookConfigProvider = {
  provide: FxaWebhookConfig,
  useValue: MockFxaWebhookConfig,
} satisfies Provider<FxaWebhookConfig>;

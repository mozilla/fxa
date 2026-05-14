/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

/**
 * Config for the temporary payments-api → auth-server HTTP call that
 * forwards Strapi email-capability list changes. The auth-server route
 * (`POST /oauth/subscriptions/email-capability-changed`) is authed via
 * the existing `subscriptionsSecret`.
 *
 * TODO(FXA-XXXXX): Remove once payments-api emits a capability-list
 * event that auth-server consumes directly.
 */
export class AuthServerEmailCapabilityConfig {
  @IsString()
  public readonly baseUrl!: string;

  @IsString()
  public readonly subscriptionsSecret!: string;
}

export const MockAuthServerEmailCapabilityConfig = {
  baseUrl: faker.internet.url(),
  subscriptionsSecret: faker.string.hexadecimal({ length: 32 }),
} satisfies AuthServerEmailCapabilityConfig;

export const MockAuthServerEmailCapabilityConfigProvider = {
  provide: AuthServerEmailCapabilityConfig,
  useValue: MockAuthServerEmailCapabilityConfig,
} satisfies Provider<AuthServerEmailCapabilityConfig>;

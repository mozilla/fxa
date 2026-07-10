/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class FxaOAuthConfig {
  @IsString()
  public readonly fxaOAuthJwksUri!: string;

  @IsString()
  public readonly fxaOAuthIssuer!: string;

  @IsString()
  public readonly fxaOAuthRequiredScope!: string;

  @IsString()
  public readonly fxaOAuthServerUrl!: string;
}

export const MockFxaOAuthConfig = {
  fxaOAuthJwksUri: faker.internet.url(),
  fxaOAuthIssuer: faker.internet.url(),
  fxaOAuthRequiredScope:
    'https://identity.mozilla.com/account/subscriptions',
  fxaOAuthServerUrl: faker.internet.url(),
} satisfies FxaOAuthConfig;

export const MockFxaOAuthConfigProvider = {
  provide: FxaOAuthConfig,
  useValue: MockFxaOAuthConfig,
} satisfies Provider<FxaOAuthConfig>;

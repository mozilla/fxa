/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsString } from 'class-validator';
import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';

export class ContentServerClientConfig {
  @IsString()
  public readonly url!: string;
}

export const MockAuthConfig = {
  url: faker.internet.url(),
} satisfies ContentServerClientConfig;

export const MockAuthConfigProvider = {
  provide: ContentServerClientConfig,
  useValue: MockAuthConfig,
} satisfies Provider<ContentServerClientConfig>;

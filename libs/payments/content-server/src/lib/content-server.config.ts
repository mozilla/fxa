/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { IsUrl } from 'class-validator';
import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';

export class ContentServerClientConfig {
  @IsUrl({ require_tld: false })
  public readonly url!: string;
}

export const MockContentServerClientConfig = {
  url: faker.internet.url(),
} satisfies ContentServerClientConfig;

export const MockContentServerClientConfigProvider = {
  provide: ContentServerClientConfig,
  useValue: MockContentServerClientConfig,
} satisfies Provider<ContentServerClientConfig>;

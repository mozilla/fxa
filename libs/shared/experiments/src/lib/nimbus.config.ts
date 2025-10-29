/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsBoolean, IsUrl } from 'class-validator';

export class NimbusClientConfig {
  @IsUrl()
  public readonly apiUrl!: string;

  @IsBoolean()
  public readonly previewEnabled!: boolean;
}

export const MockStrapiClientConfig = {
  apiUrl: faker.internet.url(),
  previewEnabled: faker.datatype.boolean(),
} satisfies NimbusClientConfig;

export const MockStrapiClientConfigProvider = {
  provide: NimbusClientConfig,
  useValue: MockStrapiClientConfig,
} satisfies Provider<NimbusClientConfig>;

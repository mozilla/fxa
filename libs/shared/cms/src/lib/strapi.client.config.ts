/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsNumber, IsString, IsUrl } from 'class-validator';

export class StrapiClientConfig {
  @IsUrl()
  public readonly graphqlApiUri!: string;

  @IsString()
  public readonly apiKey!: string;

  @IsNumber()
  public readonly memCacheTTL?: number;

  @IsString()
  public readonly firestoreCacheCollectionName!: string;

  @IsNumber()
  public readonly firestoreCacheTTL?: number;
}

export const MockStrapiClientConfig = {
  graphqlApiUri: faker.string.uuid(),
  apiKey: faker.string.uuid(),
  firestoreCacheCollectionName: faker.string.uuid(),
} satisfies StrapiClientConfig;

export const MockStrapiClientConfigProvider = {
  provide: StrapiClientConfig,
  useValue: MockStrapiClientConfig,
} satisfies Provider<StrapiClientConfig>;

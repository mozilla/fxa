/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// StrapiClientConfig's @Type() decorators call Reflect.getMetadata at load,
// and specs may import this file before anything else has set it up.
import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { StrapiClientConfig } from './strapi.client.config';

export const MockStrapiClientConfig = {
  graphqlApiUri: faker.string.uuid(),
  apiKey: faker.string.uuid(),
  firestoreCacheCollectionName: faker.string.uuid(),
} satisfies StrapiClientConfig;

export const MockStrapiClientConfigProvider = {
  provide: StrapiClientConfig,
  useValue: MockStrapiClientConfig,
} satisfies Provider<StrapiClientConfig>;

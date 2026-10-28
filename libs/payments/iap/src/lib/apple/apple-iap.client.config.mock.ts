/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Environment } from 'app-store-server-api';
import { AppleIapClientConfig } from './apple-iap.client.config';

export const MockAppleIapClientConfig = {
  // This must be left empty, else we initialize the client with invalid keys and it throws errors
  credentials: [],
  environment: Environment.Sandbox,
  collectionName: faker.string.uuid(),
} satisfies AppleIapClientConfig;

export const MockAppleIapClientConfigProvider = {
  provide: AppleIapClientConfig,
  useValue: MockAppleIapClientConfig,
} satisfies Provider<AppleIapClientConfig>;

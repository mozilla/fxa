/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsString } from 'class-validator';

export class GoogleClientConfig {
  @IsString()
  public readonly googleMapsApiKey!: string;
}

const MockGoogleClientConfig = {
  googleMapsApiKey: faker.string.uuid(),
} satisfies GoogleClientConfig;

export const MockGoogleClientConfigProvider = {
  provide: GoogleClientConfig,
  useValue: MockGoogleClientConfig,
} satisfies Provider<GoogleClientConfig>;

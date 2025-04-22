/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleIapClientConfig {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @IsOptional()
  public readonly keyFilename?: string;

  @IsString()
  @IsOptional()
  public readonly privateKey?: string;

  @IsString()
  public readonly collectionName!: string;
}

export const MockGoogleIapClientConfig = {
  email: faker.internet.email(),
  privateKey: faker.string.uuid(),
  collectionName: faker.string.uuid(),
} satisfies GoogleIapClientConfig;

export const MockGoogleIapClientConfigProvider = {
  provide: GoogleIapClientConfig,
  useValue: MockGoogleIapClientConfig,
} satisfies Provider<GoogleIapClientConfig>;

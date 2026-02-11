/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Environment } from 'app-store-server-api';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsString } from 'class-validator';

export interface AppleIapClientConfigCredential {
  key: string;
  keyId: string;
  issuerId: string;
  bundleId: string;
}

export class AppleIapClientConfig {
  @Transform(
    ({ value }) => {
      return value instanceof Object ? value : JSON.parse(value);
    },
    { toClassOnly: true }
  )
  @IsArray()
  public readonly credentials!: AppleIapClientConfigCredential[];

  @IsEnum(Environment)
  public readonly environment!: Environment;

  @IsString()
  public readonly collectionName!: string;
}

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

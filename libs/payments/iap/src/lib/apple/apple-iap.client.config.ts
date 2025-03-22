/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Environment } from 'app-store-server-api';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

export class AppleIapClientConfigCredential {
  @IsString()
  public readonly key!: string;

  @IsString()
  public readonly keyId!: string;

  @IsString()
  public readonly issuerId!: string;

  @IsString()
  public readonly bundleId!: string;
}

export class AppleIapClientConfig {
  @Type(() => AppleIapClientConfigCredential)
  @ValidateNested({ each: true })
  @IsArray()
  public readonly credentials!: AppleIapClientConfigCredential[];

  @IsEnum(Environment)
  public readonly environment!: Environment;

  @IsString()
  public readonly collectionName!: string;
}

export const MockAppleIapClientConfig = {
  credentials: [
    {
      key: faker.string.uuid(),
      keyId: faker.string.uuid(),
      issuerId: faker.string.uuid(),
      bundleId: faker.string.uuid(),
    },
  ],
  environment: Environment.Sandbox,
  collectionName: faker.string.uuid(),
} satisfies AppleIapClientConfig;

export const MockAppleIapClientConfigProvider = {
  provide: AppleIapClientConfig,
  useValue: MockAppleIapClientConfig,
} satisfies Provider<AppleIapClientConfig>;

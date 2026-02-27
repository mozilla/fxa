/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

enum GleanChannel {
  Development = 'development',
  Stage = 'stage',
  Production = 'production',
}

export class PaymentsGleanConfig {
  @Type(() => Boolean)
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  applicationId!: string;

  @IsString()
  version!: string;

  @IsEnum(GleanChannel)
  channel!: string;

  @IsString()
  loggerAppName!: string;
}

export const MockPaymentsGleanConfig = {
  enabled: true,
  applicationId: faker.string.uuid(),
  version: '0.0.1',
  channel: GleanChannel.Development,
  loggerAppName: 'payments-next-test',
} satisfies PaymentsGleanConfig;

export const MockPaymentsGleanConfigProvider = {
  provide: PaymentsGleanConfig,
  useValue: MockPaymentsGleanConfig,
} satisfies Provider<PaymentsGleanConfig>;

export class PaymentsGleanClientConfig {
  @Type(() => Boolean)
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  applicationId!: string;

  @IsString()
  version!: string;

  @IsEnum(GleanChannel)
  channel!: string;
}

export const MockPaymentsGleanClientConfig = {
  enabled: true,
  applicationId: faker.string.uuid(),
  version: '0.0.1',
  channel: GleanChannel.Development,
} satisfies PaymentsGleanClientConfig;

export const MockPaymentsGleanClientConfigProvider = {
  provide: PaymentsGleanClientConfig,
  useValue: MockPaymentsGleanClientConfig,
} satisfies Provider<PaymentsGleanClientConfig>;

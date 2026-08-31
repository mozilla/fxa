/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { MIN_DEDUPE_TTL_SECONDS } from './metering.constants';
import { stringToBoolean } from './utils/stringToBoolean';

export class MeteringRedisConfig {
  @IsString()
  @IsNotEmpty()
  public readonly host!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly port: number = 6379;

  @IsOptional()
  @IsString()
  public readonly password?: string;

  @Transform(stringToBoolean)
  @IsBoolean()
  public readonly tls: boolean = false;

  @IsString()
  @IsNotEmpty()
  public readonly keyPrefix: string = 'metering:dedupe:';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly claimTtlSeconds: number = 60;

  @Type(() => Number)
  @IsInt()
  @Min(MIN_DEDUPE_TTL_SECONDS)
  public readonly dedupeTtlSeconds: number = 90_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly connectTimeoutMs: number = 5_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly commandTimeoutMs: number = 2_000;
}

export const MockMeteringRedisConfig = {
  host: '127.0.0.1',
  port: 6379,
  tls: false,
  keyPrefix: 'test-metering:dedupe:',
  claimTtlSeconds: 60,
  dedupeTtlSeconds: 90_000,
  connectTimeoutMs: 1_000,
  commandTimeoutMs: 1_000,
} satisfies MeteringRedisConfig;

export const MockMeteringRedisConfigProvider = {
  provide: MeteringRedisConfig,
  useValue: MockMeteringRedisConfig,
} satisfies Provider<MeteringRedisConfig>;

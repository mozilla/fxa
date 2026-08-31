/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ClickHouseConfig {
  @IsString()
  @IsNotEmpty()
  public readonly url!: string;

  @IsString()
  @IsNotEmpty()
  public readonly database!: string;

  @IsString()
  @IsNotEmpty()
  public readonly username!: string;

  @IsOptional()
  @IsString()
  public readonly password?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly requestTimeoutMs: number = 10_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxExecutionTimeSeconds: number = 10;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxThreads: number = 2;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxMemoryUsageBytes: number = 268_435_456;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxBytesBeforeExternalGroupBy: number = 134_217_728;
}

export const MockClickHouseConfig = {
  url: 'http://127.0.0.1:8123',
  database: 'metering_test',
  username: 'metering_test',
  password: faker.string.alphanumeric(32),
  requestTimeoutMs: 10_000,
  maxExecutionTimeSeconds: 10,
  maxThreads: 2,
  maxMemoryUsageBytes: 268_435_456,
  maxBytesBeforeExternalGroupBy: 134_217_728,
} satisfies ClickHouseConfig;

export const MockClickHouseConfigProvider = {
  provide: ClickHouseConfig,
  useValue: MockClickHouseConfig,
} satisfies Provider<ClickHouseConfig>;

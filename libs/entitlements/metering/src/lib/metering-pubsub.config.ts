/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { stringToBoolean } from './utils/stringToBoolean';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class MeteringPubSubConfig {
  @IsString()
  @IsNotEmpty()
  public readonly projectId!: string;

  @IsString()
  @IsNotEmpty()
  public readonly topicName!: string;

  @IsString()
  @IsNotEmpty()
  public readonly subscriptionName!: string;

  @IsOptional()
  @IsString()
  public readonly emulatorHost?: string;

  @Transform(stringToBoolean)
  @IsBoolean()
  public readonly consumerEnabled: boolean = false;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly publishBatchSize: number = 100;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly publishBatchIntervalMs: number = 50;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly consumerBatchSize: number = 1_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly consumerFlushIntervalMs: number = 5_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxOutstandingMessages: number = 5_000;
}

export const MockMeteringPubSubConfig = {
  projectId: 'test',
  topicName: 'metering-events',
  subscriptionName: 'metering-events-clickhouse',
  emulatorHost: '127.0.0.1:8085',
  consumerEnabled: false,
  publishBatchSize: 100,
  publishBatchIntervalMs: 50,
  consumerBatchSize: 1_000,
  consumerFlushIntervalMs: 5_000,
  maxOutstandingMessages: 5_000,
} satisfies MeteringPubSubConfig;

export const MockMeteringPubSubConfigProvider = {
  provide: MeteringPubSubConfig,
  useValue: MockMeteringPubSubConfig,
} satisfies Provider<MeteringPubSubConfig>;

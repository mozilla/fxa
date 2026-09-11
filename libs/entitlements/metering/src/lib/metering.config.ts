/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ClickHouseConfig, MockClickHouseConfig } from './clickhouse.config';
import {
  MeteringPubSubConfig,
  MockMeteringPubSubConfig,
} from './metering-pubsub.config';
import {
  MeteringRedisConfig,
  MockMeteringRedisConfig,
} from './metering-redis.config';
import {
  MeteringSweepConfig,
  MockMeteringSweepConfig,
} from './metering-sweep.config';

export class MeteringUsageGrantsConfig {
  @IsString()
  @IsNotEmpty()
  public readonly firestoreCollectionName!: string;
}

export class MeteringConfig {
  @Transform(
    ({ value }) => (value instanceof Object ? value : JSON.parse(value)),
    { toClassOnly: true }
  )
  @IsObject()
  public readonly clients!: { [clientId: string]: string };

  @Type(() => MeteringUsageGrantsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly usageGrants!: MeteringUsageGrantsConfig;

  @Type(() => ClickHouseConfig)
  @ValidateNested()
  @IsDefined()
  public readonly clickhouse!: ClickHouseConfig;

  @Type(() => MeteringPubSubConfig)
  @ValidateNested()
  @IsDefined()
  public readonly pubsub!: MeteringPubSubConfig;

  @Type(() => MeteringRedisConfig)
  @ValidateNested()
  @IsDefined()
  public readonly redis!: MeteringRedisConfig;

  @Type(() => MeteringSweepConfig)
  @ValidateNested()
  @IsDefined()
  public readonly sweep!: MeteringSweepConfig;
}

export const MockMeteringConfig = {
  clients: { 'test-rp': faker.string.alphanumeric(48) },
  usageGrants: {
    firestoreCollectionName: 'test-metering-usage-grants',
  },
  clickhouse: MockClickHouseConfig,
  sweep: MockMeteringSweepConfig,
  pubsub: MockMeteringPubSubConfig,
  redis: MockMeteringRedisConfig,
} satisfies MeteringConfig;

export const MockMeteringConfigProvider = {
  provide: MeteringConfig,
  useValue: MockMeteringConfig,
} satisfies Provider<MeteringConfig>;

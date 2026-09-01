/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraint,
} from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

import { CloudTasksOidcConfig } from '@fxa/shared/cloud-tasks';

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
import { stringToBoolean } from './utils/stringToBoolean';

@ValidatorConstraint({ name: 'emulatorDisallowedInProduction', async: false })
class EmulatorDisallowedInProduction implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return !(value === true && process.env['NODE_ENV'] === 'production');
  }

  defaultMessage(): string {
    return 'cloudTasks.useLocalEmulator must be false when NODE_ENV is production';
  }
}

@ValidatorConstraint({ name: 'oidcRequiredUnlessEmulator', async: false })
class OidcRequiredUnlessEmulator implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const config = args.object as MeteringCloudTasksConfig;
    if (config.useLocalEmulator) {
      return true;
    }
    return (
      Boolean(config.oidc?.aud) && Boolean(config.oidc?.serviceAccountEmail)
    );
  }

  defaultMessage(): string {
    return 'cloudTasks.oidc.aud and cloudTasks.oidc.serviceAccountEmail are required unless useLocalEmulator is true';
  }
}

export class MeteringCloudTasksConfig {
  @Transform(stringToBoolean)
  @IsBoolean()
  @Validate(OidcRequiredUnlessEmulator)
  @Validate(EmulatorDisallowedInProduction)
  public readonly useLocalEmulator: boolean = false;

  @Type(() => CloudTasksOidcConfig)
  @ValidateNested()
  public readonly oidc: CloudTasksOidcConfig = new CloudTasksOidcConfig();
}

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

  @Type(() => MeteringCloudTasksConfig)
  @ValidateNested()
  @IsDefined()
  public readonly cloudTasks!: MeteringCloudTasksConfig;

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
  cloudTasks: {
    useLocalEmulator: true,
    oidc: {
      aud: 'http://127.0.0.1/v1/metering/internal/sweep',
      serviceAccountEmail:
        'metering-task-runner@example.iam.gserviceaccount.com',
    },
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

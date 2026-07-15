/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
} from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

import { CloudTasksBaseConfig } from '@fxa/shared/cloud-tasks';

@ValidatorConstraint({ name: 'scheduleDelayExceedsBucketSize', async: false })
class ScheduleDelayExceedsBucketSize implements ValidatorConstraintInterface {
  validate(scheduleDelayMs: unknown, args: ValidationArguments): boolean {
    const { bucketSizeMs } = args.object as MeteringCloudTasksThresholdConfig;
    return (
      typeof scheduleDelayMs === 'number' &&
      typeof bucketSizeMs === 'number' &&
      scheduleDelayMs > bucketSizeMs
    );
  }

  defaultMessage(): string {
    return 'scheduleDelayMs must be strictly greater than bucketSizeMs';
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

/**
 * In-process metering ingest buffer config. The defaults
 * (`maxBatchSize: 100`, `maxIntervalMs: 100`) collapse 1k req/sec into ~10
 * HTTP calls/sec to OpenMeter. `maxQueueSize` caps the
 * buffer to bound memory if OpenMeter is unavailable.
 */
export class MeteringBufferConfig {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxBatchSize: number = 100;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxIntervalMs: number = 100;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly maxQueueSize: number = 10_000;
}

/**
 * Cloud Tasks–driven threshold-check pipeline config.
 *
 * `bucketSizeMs` controls how often the per-user dedup name rolls over.
 * Concurrent enqueues for the same `(slug, userIdentifier)` inside the
 * same bucket collapse to a single Cloud Task via name-based dedup - the
 * first enqueue wins.
 *
 * `scheduleDelayMs` must be greater than `bucketSizeMs`.
 * The first enqueue in a bucket is `scheduleTime = enqueueTime +
 * scheduleDelayMs`. A subsequent same-bucket event late in the bucket
 * would otherwise see the task fire before OpenMeter's Kafka → ClickHouse
 * pipeline has propagated it, and the threshold check would miss that
 * event. With `scheduleDelayMs > bucketSizeMs`, even an event ingested
 * at the very end of a bucket has `(scheduleDelayMs - bucketSizeMs)`
 * milliseconds of margin to be visible to the handler's OpenMeter query.
 */
export class MeteringCloudTasksThresholdConfig {
  @IsString()
  @IsNotEmpty()
  public readonly taskUrl: string = '';

  @IsString()
  @IsNotEmpty()
  public readonly queueName: string = '';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly bucketSizeMs: number = 5 * 60 * 1000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Validate(ScheduleDelayExceedsBucketSize)
  public readonly scheduleDelayMs: number = 7 * 60 * 1000;
}

export class MeteringCloudTasksConfig extends CloudTasksBaseConfig {
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : value
  )
  @IsBoolean()
  @Validate(OidcRequiredUnlessEmulator)
  public override readonly useLocalEmulator: boolean = false;

  @IsString()
  @IsNotEmpty()
  public override readonly projectId: string = '';

  @IsString()
  @IsNotEmpty()
  public override readonly locationId: string = '';

  @Type(() => MeteringCloudTasksThresholdConfig)
  @ValidateNested()
  public readonly threshold: MeteringCloudTasksThresholdConfig =
    new MeteringCloudTasksThresholdConfig();
}

export class MeteringUsageGrantsConfig {
  @IsString()
  @IsNotEmpty()
  public readonly firestoreCollectionName!: string;
}

export class MeteringConfig {
  @IsString()
  public readonly openmeterBaseUrl!: string;

  @IsOptional()
  @IsString()
  public readonly openmeterApiKey?: string;

  @IsOptional()
  @IsIn(['v1', 'v3'])
  public readonly openmeterApiVersion?: 'v1' | 'v3';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly openmeterMeterIdCacheTtlSeconds?: number;

  @Transform(
    ({ value }) => (value instanceof Object ? value : JSON.parse(value)),
    { toClassOnly: true }
  )
  @IsObject()
  public readonly clients!: { [clientId: string]: string };

  @Type(() => MeteringBufferConfig)
  @ValidateNested()
  @IsOptional()
  public readonly buffer?: MeteringBufferConfig;

  @Type(() => MeteringCloudTasksConfig)
  @ValidateNested()
  @IsDefined()
  public readonly cloudTasks!: MeteringCloudTasksConfig;

  @Type(() => MeteringUsageGrantsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly usageGrants!: MeteringUsageGrantsConfig;
}

export const MockMeteringConfig = {
  openmeterBaseUrl: 'http://127.0.0.1:48888',
  openmeterApiKey: faker.string.uuid(),
  clients: { 'test-rp': faker.string.alphanumeric(48) },
  buffer: new MeteringBufferConfig(),
  usageGrants: {
    firestoreCollectionName: 'test-metering-usage-grants',
  },
  cloudTasks: {
    useLocalEmulator: true,
    projectId: 'test',
    locationId: 'test',
    credentials: { keyFilename: '' },
    oidc: {
      aud: 'http://127.0.0.1/v1/metering/internal/threshold-check',
      serviceAccountEmail:
        'metering-task-runner@example.iam.gserviceaccount.com',
    },
    threshold: {
      taskUrl: 'http://127.0.0.1/v1/metering/internal/threshold-check',
      queueName: 'metering-threshold-checks',
      bucketSizeMs: 5 * 60 * 1000,
      scheduleDelayMs: 7 * 60 * 1000,
    },
  },
} satisfies MeteringConfig;

export const MockMeteringConfigProvider = {
  provide: MeteringConfig,
  useValue: MockMeteringConfig,
} satisfies Provider<MeteringConfig>;

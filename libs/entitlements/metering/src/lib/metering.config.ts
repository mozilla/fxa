/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Provider } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { CloudTasksBaseConfig } from '@fxa/shared/cloud-tasks';

/**
 * Knobs for the in-process metering ingest buffer. The defaults
 * (`maxBatchSize: 100`, `maxIntervalMs: 100`) collapse 1k req/sec into ~10
 * HTTP calls/sec to OpenMeter under steady state. `maxQueueSize` caps the
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

export class MeteringMeterRegistryConfig {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly refreshIntervalMs: number = 60_000;
}

/**
 * Knobs for the Cloud Tasks–driven threshold-check pipeline.
 *
 * `bucketSizeMs` controls how often the per-user dedup name rolls over.
 * Concurrent enqueues for the same `(slug, userIdentifier)` inside the
 * same bucket collapse to a single Cloud Task via name-based dedup; the
 * FIRST enqueue wins and its `scheduleTime` sticks.
 *
 * `scheduleDelayMs` must be **strictly greater** than `bucketSizeMs`.
 * The first enqueue in a bucket locks in `scheduleTime = enqueueTime +
 * scheduleDelayMs`. A subsequent same-bucket event late in the bucket
 * would otherwise see the task fire before OpenMeter's Kafka → ClickHouse
 * pipeline has propagated it, and the threshold check would miss that
 * event. With `scheduleDelayMs > bucketSizeMs`, even an event ingested
 * at the very end of a bucket has `(scheduleDelayMs - bucketSizeMs)`
 * milliseconds of margin to be visible to the handler's OpenMeter query.
 */
export class MeteringCloudTasksThresholdConfig {
  @IsString()
  @IsOptional()
  public readonly taskUrl: string = '';

  @IsString()
  @IsOptional()
  public readonly queueName: string = '';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly bucketSizeMs: number = 5 * 60 * 1000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly scheduleDelayMs: number = 7 * 60 * 1000;
}

export class MeteringCloudTasksConfig extends CloudTasksBaseConfig {
  @Type(() => MeteringCloudTasksThresholdConfig)
  @ValidateNested()
  @IsOptional()
  public readonly threshold: MeteringCloudTasksThresholdConfig =
    new MeteringCloudTasksThresholdConfig();
}

export class MeteringConfig {
  @IsString()
  public readonly openmeterBaseUrl!: string;

  @IsOptional()
  @IsString()
  public readonly openmeterApiKey?: string;

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

  @Type(() => MeteringMeterRegistryConfig)
  @ValidateNested()
  @IsOptional()
  public readonly meterRegistry?: MeteringMeterRegistryConfig;

  @Type(() => MeteringCloudTasksConfig)
  @ValidateNested()
  @IsOptional()
  public readonly cloudTasks?: MeteringCloudTasksConfig;
}

export const MockMeteringConfig = {
  openmeterBaseUrl: 'http://127.0.0.1:48888',
  openmeterApiKey: faker.string.uuid(),
  clients: { 'test-rp': faker.string.alphanumeric(48) },
  buffer: new MeteringBufferConfig(),
  cloudTasks: {
    useLocalEmulator: true,
    projectId: 'test',
    locationId: 'test',
    credentials: { keyFilename: '' },
    oidc: {
      aud: 'http://127.0.0.1/v1/metering/internal/threshold-check',
      serviceAccountEmail: 'metering-task-runner@example.iam.gserviceaccount.com',
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

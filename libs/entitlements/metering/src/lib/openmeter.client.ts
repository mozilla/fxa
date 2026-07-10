/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./openmeter-client.d.ts" />

import { Injectable } from '@nestjs/common';
import { OpenMeter as OpenMeterApiV3 } from '@openmeter/client';
import { OpenMeter as OpenMeterSdk } from '@openmeter/sdk';
import { Cacheable } from '@type-cacheable/core';

import {
  CacheFirstStrategy,
  MemoryAdapter,
} from '@fxa/shared/db/type-cacheable';

import { MeteringConfig } from './metering.config';
import { MeterNotConfiguredError } from './metering.error';
import type { MeteringCloudEvent } from './utils/toMeteringCloudEvent';

const DEFAULT_METER_ID_CACHE_TTL_SECONDS = 60 * 60;

export interface OpenMeterQueryUsageArgs {
  slug: string;
  subject: string[];
  from: Date;
  to: Date;
}

interface OpenMeterBackend {
  ingest(events: MeteringCloudEvent[]): Promise<void>;
  queryUsage(args: OpenMeterQueryUsageArgs): Promise<number>;
}

class OpenMeterV1Backend implements OpenMeterBackend {
  private readonly sdk: OpenMeterSdk;

  constructor(meteringConfig: MeteringConfig) {
    this.sdk = new OpenMeterSdk({
      baseUrl: meteringConfig.openmeterBaseUrl,
      apiKey: meteringConfig.openmeterApiKey,
    });
  }

  async ingest(events: MeteringCloudEvent[]): Promise<void> {
    await this.sdk.events.ingest(
      events.map((event) => ({
        id: event.id,
        source: event.source,
        type: event.type,
        subject: event.subject,
        time: event.time,
        data: { amount: event.data.amount },
      }))
    );
  }

  async queryUsage(args: OpenMeterQueryUsageArgs): Promise<number> {
    const result = await this.sdk.meters.query(args.slug, {
      from: args.from,
      to: args.to,
      subject: args.subject,
    });

    return result.data.reduce((sum, row) => sum + row.value, 0);
  }
}

class OpenMeterV3Backend implements OpenMeterBackend {
  private readonly client: OpenMeterApiV3;
  private readonly meterIdCache = new MemoryAdapter();
  private readonly meterIdCacheStrategy = new CacheFirstStrategy();
  private readonly meterIdCacheTtlSeconds: number;

  constructor(meteringConfig: MeteringConfig) {
    this.client = new OpenMeterApiV3({
      baseUrl: meteringConfig.openmeterBaseUrl,
      apiKey: meteringConfig.openmeterApiKey,
    });
    this.meterIdCacheTtlSeconds =
      meteringConfig.openmeterMeterIdCacheTtlSeconds ??
      DEFAULT_METER_ID_CACHE_TTL_SECONDS;
  }

  async ingest(events: MeteringCloudEvent[]): Promise<void> {
    await this.client.events.ingest(
      events.map((event) => ({
        id: event.id,
        source: event.source,
        type: event.type,
        subject: event.subject,
        time: event.time.toISOString(),
        data: { amount: event.data.amount },
      }))
    );
  }

  async queryUsage(args: OpenMeterQueryUsageArgs): Promise<number> {
    const meterId = await this.lookupMeterId(args.slug);
    const result = await this.client.meters.query({
      meterId,
      body: {
        from: args.from.toISOString(),
        to: args.to.toISOString(),
        filters: { dimensions: { subject: { in: args.subject } } },
      },
    });

    return result.data.reduce((sum, row) => sum + Number(row.value), 0);
  }

  @Cacheable({
    cacheKey: (args) => `openmeter:meter-id:${args[0]}`,
    strategy: (_, context: OpenMeterV3Backend) => context.meterIdCacheStrategy,
    ttlSeconds: (_, context: OpenMeterV3Backend) =>
      context.meterIdCacheTtlSeconds,
    client: (_, context: OpenMeterV3Backend) => context.meterIdCache,
  })
  private async lookupMeterId(key: string): Promise<string> {
    const result = await this.client.meters.list({ filter: { key } });
    const meter = result.data.find((candidate) => candidate.key === key);
    if (!meter) {
      throw new MeterNotConfiguredError(key);
    }
    return meter.id;
  }
}

@Injectable()
export class OpenMeterClient {
  private readonly backend: OpenMeterBackend;

  constructor(meteringConfig: MeteringConfig) {
    this.backend =
      meteringConfig.openmeterApiVersion === 'v3'
        ? new OpenMeterV3Backend(meteringConfig)
        : new OpenMeterV1Backend(meteringConfig);
  }

  ingest(events: MeteringCloudEvent[]): Promise<void> {
    return this.backend.ingest(events);
  }

  queryUsage(args: OpenMeterQueryUsageArgs): Promise<number> {
    return this.backend.queryUsage(args);
  }
}

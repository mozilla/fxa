/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';

import { SanitizeExceptions } from '@fxa/shared/error';

import { MeteringIngestBufferManager } from './metering-ingest-buffer.manager';
import { MeteringManager } from './metering.manager';
import { MeteringConfigurationManager } from './metering-configuration.manager';
import { MeteringThresholdTasksManager } from './metering-threshold-tasks.manager';
import {
  type IngestUsageRequest,
  type UsageQueryParams,
  type UsageQueryResponse,
} from './metering.schema';
import type { StrapiMeter } from '@fxa/shared/cms';
import { computeWindow } from './utils/computeWindow';

interface AuthorizedClient {
  clientId: string;
}

@Injectable()
export class UsageService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringManager: MeteringManager,
    private readonly meteringIngestBufferManager: MeteringIngestBufferManager,
    private readonly meteringThresholdTasksManager: MeteringThresholdTasksManager,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  /**
   * The ingest path is intentionally minimal: resolve the meter for the
   * slug, enqueue the event for batch dispatch to OpenMeter, and
   * fire-and-forget schedule a Cloud Task that will evaluate the user's
   * usage against the meter's notification thresholds ~5 minutes later.
   * Threshold detection and webhook dispatch happen out-of-band — the
   * request path never reads from OpenMeter, so per-request latency does
   * not depend on ClickHouse query times.
   */
  @SanitizeExceptions({
    allowlist: [NotFoundException],
  })
  async ingestUsage(
    ingestUsageRequest: IngestUsageRequest,
    authorizedClient: AuthorizedClient
  ): Promise<void> {
    const meter = await this.requireMeterBySlug(ingestUsageRequest.slug);
    this.meteringIngestBufferManager.push({
      id: ingestUsageRequest.id,
      userIdentifier: ingestUsageRequest.userIdentifier,
      amount: ingestUsageRequest.amount,
      timestamp: ingestUsageRequest.timestamp
        ? new Date(ingestUsageRequest.timestamp)
        : undefined,
      meter,
    });
    this.scheduleThresholdCheck(meter.slug, ingestUsageRequest.userIdentifier);
  }

  private scheduleThresholdCheck(
    slug: string,
    userIdentifier: string
  ): void {
    this.meteringThresholdTasksManager
      .scheduleThresholdCheck({ slug, userIdentifier })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  @SanitizeExceptions({
    allowlist: [NotFoundException],
  })
  async queryUsage(
    params: UsageQueryParams,
    authorizedClient: AuthorizedClient,
    now: Date = new Date()
  ): Promise<UsageQueryResponse> {
    const meter = await this.requireMeterBySlug(params.slug);

    const { windowStart, windowEnd } = computeWindow(meter.window, now);

    const result = await this.meteringManager.queryUsage({
      userIdentifier: params.userIdentifier,
      slug: params.slug,
      from: windowStart,
      to: windowEnd,
    });

    return {
      usage: result.usage,
      limit: meter.limit,
      unit: meter.unit,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    };
  }

  private async requireMeterBySlug(
    slug: string,
  ): Promise<StrapiMeter> {
    const meter = await this.meteringConfigurationManager.getMeterBySlug(slug);
    if (!meter) {
      throw new NotFoundException({
        message: 'Meter slug is not configured',
        slug,
      });
    }
    return meter;
  }
}

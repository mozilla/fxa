/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';

import { MeteringConfigurationManager } from '@fxa/shared/cms';

import { MeteringIngestManager } from './metering-ingest.manager';
import { MeteringQueryManager } from './metering-query.manager';
import { MeteringThresholdTasksManager } from './metering-threshold-tasks.manager';
import {
  type IngestUsageRequest,
  type UsageQueryParams,
  type UsageQueryResponse,
} from './metering.schema';
import { UsageGrantsManager } from './usage-grants.manager';
import { computeWindow } from './utils/computeWindow';
import { requireMeterBySlug } from './utils/requireMeterBySlug';

@Injectable()
export class UsageService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringQueryManager: MeteringQueryManager,
    private readonly meteringIngestManager: MeteringIngestManager,
    private readonly meteringThresholdTasksManager: MeteringThresholdTasksManager,
    private readonly usageGrantsManager: UsageGrantsManager,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async ingestUsage(ingestUsageRequest: IngestUsageRequest): Promise<void> {
    const meter = await requireMeterBySlug(
      this.meteringConfigurationManager,
      ingestUsageRequest.slug
    );
    this.meteringIngestManager.enqueue({
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

  private scheduleThresholdCheck(slug: string, userIdentifier: string): void {
    this.meteringThresholdTasksManager
      .scheduleThresholdCheck({ slug, userIdentifier })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  async queryUsage(
    params: UsageQueryParams,
    now: Date = new Date()
  ): Promise<UsageQueryResponse> {
    const meter = await requireMeterBySlug(
      this.meteringConfigurationManager,
      params.slug
    );

    const { windowStart, windowEnd } = computeWindow(meter.window, now);

    const [result, grantedAmount] = await Promise.all([
      this.meteringQueryManager.queryUsage({
        userIdentifier: params.userIdentifier,
        slug: params.slug,
        from: windowStart,
        to: windowEnd,
      }),
      this.usageGrantsManager.getActiveGrantedAmount(
        params.userIdentifier,
        params.slug,
        now
      ),
    ]);

    return {
      usage: result.usage,
      limit: meter.limit + grantedAmount,
      grantedAmount,
      unit: meter.unit,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    };
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { MeteringConfigurationManager } from '@fxa/shared/cms';

import { MeteringEventsManager } from './metering-events.manager';
import { MeteringPublisherManager } from './metering-publisher.manager';
import { MeteringSweepManager } from './metering-sweep.manager';
import { TimestampOutOfRangeError } from './metering.error';
import { isTimestampInRange } from './utils/isTimestampInRange';
import {
  type IngestUsageRequest,
  type UsageQueryParams,
  type UsageQueryResponse,
} from './metering.schema';
import { UsageGrantsManager } from './usage-grants.manager';
import { requireMeterBySlug } from './utils/requireMeterBySlug';
import { resolveWindow } from './utils/resolveWindow';

@Injectable()
export class UsageService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringPublisherManager: MeteringPublisherManager,
    private readonly meteringEventsManager: MeteringEventsManager,
    private readonly meteringSweepManager: MeteringSweepManager,
    private readonly usageGrantsManager: UsageGrantsManager
  ) {}

  async ingestUsage(
    clientId: string,
    ingestUsageRequest: IngestUsageRequest,
    now: Date = new Date()
  ): Promise<void> {
    if (
      ingestUsageRequest.timestamp !== undefined &&
      !isTimestampInRange(ingestUsageRequest.timestamp, now)
    ) {
      throw new TimestampOutOfRangeError(ingestUsageRequest.timestamp);
    }

    const meter = await requireMeterBySlug(
      this.meteringConfigurationManager,
      ingestUsageRequest.slug
    );

    await this.meteringPublisherManager.publish({
      id: ingestUsageRequest.id,
      clientId,
      slug: meter.slug,
      userIdentifier: ingestUsageRequest.userIdentifier,
      amount: ingestUsageRequest.amount,
      timestamp: ingestUsageRequest.timestamp ?? now.toISOString(),
    });
  }

  async queryUsage(
    clientId: string,
    params: UsageQueryParams,
    now: Date = new Date()
  ): Promise<UsageQueryResponse> {
    const meter = await requireMeterBySlug(
      this.meteringConfigurationManager,
      params.slug
    );

    const sessionStart =
      meter.window.kind === 'session'
        ? await this.findSessionStart(clientId, params)
        : undefined;
    const { windowStart, windowEnd } = resolveWindow(
      meter.window,
      now,
      sessionStart
    );

    const [usage, grantedAmount] = await Promise.all([
      this.meteringEventsManager.sumUsage({
        clientId,
        slug: params.slug,
        subject: params.userIdentifier,
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
      usage,
      limit: meter.limit + grantedAmount,
      grantedAmount,
      unit: meter.unit,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    };
  }

  private async findSessionStart(
    clientId: string,
    params: UsageQueryParams
  ): Promise<Date | undefined> {
    const starts = await this.meteringSweepManager.findSessionStarts({
      clientId,
      slug: params.slug,
      subjects: [params.userIdentifier],
    });
    return starts.get(params.userIdentifier);
  }
}

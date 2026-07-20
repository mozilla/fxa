/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';

import { MeteringConfigurationManager } from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringQueryManager } from './metering-query.manager';
import { MeteringWebhookManager } from './metering-webhook.manager';
import type { ThresholdCheckTaskBody } from './metering.schema';
import { UsageGrantsManager } from './usage-grants.manager';
import { computeThresholdsMet } from './utils/computeThresholdsMet';
import { computeWindow } from './utils/computeWindow';

@Injectable()
export class MeteringThresholdService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringQueryManager: MeteringQueryManager,
    private readonly meteringWebhookManager: MeteringWebhookManager,
    private readonly usageGrantsManager: UsageGrantsManager,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async handleThresholdCheck(
    thresholdCheckTaskBody: ThresholdCheckTaskBody,
    now: Date = new Date()
  ): Promise<void> {
    const meterResult =
      await this.meteringConfigurationManager.getMeterResultUtil(
        thresholdCheckTaskBody.slug
      );
    const meter = meterResult.meters.at(0);
    if (!meter) {
      this.logger.error(
        `threshold-check task for unknown slug ${thresholdCheckTaskBody.slug}`
      );
      this.statsd.increment('metering.tasks.handler', { outcome: 'no-meter' });
      return;
    }

    if (meter.webhooks.length === 0) {
      this.statsd.increment('metering.tasks.handler', {
        outcome: 'no-webhooks',
      });
      return;
    }

    const { windowStart, windowEnd } = computeWindow(meter.window, now);
    const [result, grantedAmount] = await Promise.all([
      this.meteringQueryManager.queryUsage({
        userIdentifier: thresholdCheckTaskBody.userIdentifier,
        slug: meter.slug,
        from: windowStart,
        to: windowEnd,
      }),
      this.usageGrantsManager.getActiveGrantedAmount(
        thresholdCheckTaskBody.userIdentifier,
        meter.slug,
        now
      ),
    ]);
    const effectiveLimit = meter.limit + grantedAmount;

    const thresholds = meterResult.getNotificationThresholds();
    const met = computeThresholdsMet(thresholds, result.usage, effectiveLimit);
    if (met.length === 0) {
      this.statsd.increment('metering.tasks.handler', {
        outcome: 'no-crossings',
      });
      return;
    }

    for (const threshold of met) {
      for (const webhook of meter.webhooks) {
        await this.meteringWebhookManager.dispatch({
          signingClientId: webhook.signingClientId,
          url: webhook.url,
          slug: meter.slug,
          userIdentifier: thresholdCheckTaskBody.userIdentifier,
          threshold,
          currentUsage: result.usage,
          limit: effectiveLimit,
          grantedAmount,
          unit: meter.unit,
          windowStart,
          windowEnd,
          eventId: `${meter.slug}:${thresholdCheckTaskBody.userIdentifier}:${windowStart.toISOString()}:${threshold}`,
        });
      }
    }

    this.statsd.increment('metering.tasks.handler', {
      outcome: 'crossings-dispatched',
    });
  }
}

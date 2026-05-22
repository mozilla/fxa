/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringManager } from './metering.manager';
import { MeteringConfigurationManager } from './metering-configuration.manager';
import { MeteringWebhookManager } from './metering-webhook.manager';
import type { ThresholdCheckTaskBody } from './metering.schema';
import { computeThresholdsMet } from './utils/computeThresholdsMet';
import { computeWindow } from './utils/computeWindow';

export type ThresholdCheckOutcome =
  | 'no-meter'
  | 'no-webhooks'
  | 'no-crossings'
  | 'crossings-dispatched';

@Injectable()
export class MeteringThresholdService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringManager: MeteringManager,
    private readonly meteringWebhookManager: MeteringWebhookManager,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async handleThresholdCheck(
    thresholdCheckTaskBody: ThresholdCheckTaskBody,
    now: Date = new Date()
  ): Promise<ThresholdCheckOutcome> {
    const meter = await this.meteringConfigurationManager.getMeterBySlug(thresholdCheckTaskBody.slug);
    if (!meter) {
      this.statsd.increment('metering.tasks.handler', { outcome: 'no-meter' });
      this.logger.error(
        `threshold-check task for unknown slug ${thresholdCheckTaskBody.slug}`
      );
      return 'no-meter';
    }
    if (meter.webhooks.length === 0) {
      this.statsd.increment('metering.tasks.handler', {
        outcome: 'no-webhooks',
      });
      return 'no-webhooks';
    }

    const { windowStart, windowEnd } = computeWindow(meter.window, now);
    const result = await this.meteringManager.queryUsage({
      userIdentifier: thresholdCheckTaskBody.userIdentifier,
      slug: meter.slug,
      from: windowStart,
      to: windowEnd,
    });

    const met = computeThresholdsMet(
      meter.notificationThresholds,
      result.usage,
      meter.limit
    );
    if (met.length === 0) {
      this.statsd.increment('metering.tasks.handler', {
        outcome: 'no-crossings',
      });
      return 'no-crossings';
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
          limit: meter.limit,
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
    return 'crossings-dispatched';
  }
}

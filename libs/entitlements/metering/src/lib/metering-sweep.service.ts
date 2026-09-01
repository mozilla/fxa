/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';

import {
  MeteringConfigurationManager,
  type StrapiMeter,
} from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MAX_TIMESTAMP_PAST_MS } from './metering.constants';
import type {
  MeterKey,
  RecordedNotification,
  SentNotification,
  SweepCandidate,
  SweepResult,
} from './metering.types';
import { MeteringSweepConfig } from './metering-sweep.config';
import { MeteringSweepManager } from './metering-sweep.manager';
import { MeteringWebhookManager } from './metering-webhook.manager';
import { UsageGrantsManager } from './usage-grants.manager';
import { chunk } from './utils/chunk';
import { computeThresholdsMet } from './utils/computeThresholdsMet';
import { computeWindowId } from './utils/computeWindowId';
import { notificationKey } from './utils/notificationKey';
import { resolveWindow } from './utils/resolveWindow';
import { shouldNotify } from './utils/shouldNotify';

interface SweepContext {
  params: MeterKey;
  meter: StrapiMeter;
  thresholds: number[];
  lastSent: Map<string, SentNotification>;
  sessionStarts: Map<string, Date>;
  now: Date;
}

interface SweepSummary extends Omit<SweepResult, 'watermark'> {
  failed: number;
}

interface SubjectDispatch {
  recorded: RecordedNotification[];
  failed: number;
}

@Injectable()
export class MeteringSweepService {
  constructor(
    private readonly meteringSweepConfig: MeteringSweepConfig,
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringSweepManager: MeteringSweepManager,
    private readonly meteringWebhookManager: MeteringWebhookManager,
    private readonly usageGrantsManager: UsageGrantsManager,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async sweep(params: MeterKey, now: Date = new Date()): Promise<SweepResult> {
    const startedAt = Date.now();
    let outcome = 'error';
    try {
      const result = await this.runSweep(params, now);
      outcome = result.outcome;
      return result;
    } finally {
      this.statsd.increment('metering.sweep', { outcome, slug: params.slug });
      this.statsd.timing('metering.sweep.duration', Date.now() - startedAt, {
        slug: params.slug,
      });
    }
  }

  private async runSweep(params: MeterKey, now: Date): Promise<SweepResult> {
    const meterResult =
      await this.meteringConfigurationManager.getMeterResultUtil(params.slug);
    const meter = meterResult.meters.at(0);
    if (!meter) {
      return {
        outcome: 'meter-not-configured',
        candidates: 0,
        dispatched: 0,
        watermark: now.toISOString(),
      };
    }

    const watermark =
      (await this.meteringSweepManager.findWatermark(params)) ??
      new Date(now.getTime() - this.meteringSweepConfig.lookbackMs);
    const ingestedSince = new Date(
      watermark.getTime() - this.meteringSweepConfig.watermarkLagMs
    );

    const thresholds = meterResult
      .getNotificationThresholds()
      .filter((threshold) => threshold > 0);

    const { failed, ...summary } = await this.notifyCrossings(
      params,
      meter,
      thresholds,
      ingestedSince,
      now
    );

    if (failed > 0) {
      this.statsd.increment('metering.sweep.watermark_held', {
        slug: params.slug,
      });
      return { ...summary, watermark: watermark.toISOString() };
    }

    await this.meteringSweepManager.advanceWatermark({
      ...params,
      watermark: now,
      updatedAt: now,
    });

    return { ...summary, watermark: now.toISOString() };
  }

  private async notifyCrossings(
    params: MeterKey,
    meter: StrapiMeter,
    thresholds: number[],
    ingestedSince: Date,
    now: Date
  ): Promise<SweepSummary> {
    if (meter.webhooks.length === 0) {
      return {
        outcome: 'no-webhooks',
        candidates: 0,
        dispatched: 0,
        failed: 0,
      };
    }
    if (thresholds.length === 0 || meter.limit <= 0) {
      return {
        outcome: 'no-thresholds',
        candidates: 0,
        dispatched: 0,
        failed: 0,
      };
    }

    await this.detectSessionStarts(params, meter, ingestedSince, now);

    const candidates = await this.findCandidates(
      params,
      meter,
      thresholds,
      ingestedSince,
      now
    );
    if (candidates.length === 0) {
      return {
        outcome: 'no-candidates',
        candidates: 0,
        dispatched: 0,
        failed: 0,
      };
    }

    const subjects = candidates.map((candidate) => candidate.subject);
    const [lastSent, sessionStarts] = await Promise.all([
      this.meteringSweepManager.findLastNotifications({ ...params, subjects }),
      meter.window.kind === 'session'
        ? this.meteringSweepManager.findSessionStarts({ ...params, subjects })
        : Promise.resolve(new Map<string, Date>()),
    ]);

    const context: SweepContext = {
      params,
      meter,
      thresholds,
      lastSent,
      sessionStarts,
      now,
    };

    let dispatched = 0;
    let failed = 0;
    for (const batch of chunk(
      candidates,
      this.meteringSweepConfig.dispatchConcurrency
    )) {
      const result = await this.processBatch(context, batch);
      dispatched += result.recorded.length;
      failed += result.failed;
    }

    return {
      outcome: dispatched === 0 ? 'no-crossings' : 'dispatched',
      candidates: candidates.length,
      dispatched,
      failed,
    };
  }

  private async processBatch(
    context: SweepContext,
    batch: SweepCandidate[]
  ): Promise<SubjectDispatch> {
    const settled = await Promise.allSettled(
      batch.map((candidate) => this.dispatchForSubject(context, candidate))
    );

    const recorded: RecordedNotification[] = [];
    let failed = 0;
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        recorded.push(...result.value.recorded);
        failed += result.value.failed;
      } else {
        failed += 1;
        this.statsd.increment('metering.sweep.subject_error');
        this.logger.error(result.reason);
      }
    }

    if (recorded.length > 0) {
      await this.meteringSweepManager.recordNotifications(recorded);
    }

    return { recorded, failed };
  }

  private async detectSessionStarts(
    params: MeterKey,
    meter: StrapiMeter,
    ingestedSince: Date,
    now: Date
  ): Promise<void> {
    if (meter.window.kind !== 'session') {
      return;
    }

    const opened = await this.meteringSweepManager.findNewSessionStarts({
      ...params,
      ingestedSince,
      eventTimeFloor: new Date(now.getTime() - meter.window.durationMs),
      to: now,
      durationMs: meter.window.durationMs,
    });

    if (opened.length === 0) {
      return;
    }

    await this.meteringSweepManager.recordSessionStarts(opened);
    this.statsd.increment('metering.sweep.sessions_opened', opened.length, {
      slug: params.slug,
    });
  }

  private async findCandidates(
    params: MeterKey,
    meter: StrapiMeter,
    thresholds: number[],
    ingestedSince: Date,
    now: Date
  ): Promise<SweepCandidate[]> {
    const minUsage = (Math.min(...thresholds) / 100) * meter.limit;

    if (meter.window.kind === 'session') {
      return this.meteringSweepManager.findSessionCandidates({
        ...params,
        expiredBefore: new Date(now.getTime() - meter.window.durationMs),
        to: now,
        minUsage,
      });
    }

    const { windowStart, windowEnd } = resolveWindow(meter.window, now);
    return this.meteringSweepManager.findWindowCandidates({
      ...params,
      from: windowStart,
      to: windowEnd,
      ingestedSince,
      eventTimeFloor: new Date(ingestedSince.getTime() - MAX_TIMESTAMP_PAST_MS),
      minUsage,
    });
  }

  private async dispatchForSubject(
    context: SweepContext,
    candidate: SweepCandidate
  ): Promise<SubjectDispatch> {
    const { params, meter, thresholds, lastSent, now } = context;

    const grantedAmount = await this.usageGrantsManager.getActiveGrantedAmount(
      candidate.subject,
      params.slug,
      now
    );
    const effectiveLimit = meter.limit + grantedAmount;
    const met = computeThresholdsMet(
      thresholds,
      candidate.usage,
      effectiveLimit
    );
    if (met.length === 0) {
      return { recorded: [], failed: 0 };
    }

    const { windowStart, windowEnd } = resolveWindow(
      meter.window,
      now,
      context.sessionStarts.get(candidate.subject)
    );
    const windowId = computeWindowId(meter.window, windowStart);
    const recorded: RecordedNotification[] = [];
    let failed = 0;

    for (const threshold of met) {
      for (const webhook of meter.webhooks) {
        const allowed = shouldNotify({
          windowId,
          lastSent: lastSent.get(
            notificationKey(
              candidate.subject,
              threshold,
              webhook.signingClientId
            )
          ),
          now,
          cooldownMs: this.meteringSweepConfig.cooldownMs,
        });
        if (!allowed) {
          continue;
        }

        try {
          await this.meteringWebhookManager.dispatch({
            signingClientId: webhook.signingClientId,
            url: webhook.url,
            slug: meter.slug,
            subject: candidate.subject,
            threshold,
            currentUsage: candidate.usage,
            limit: effectiveLimit,
            grantedAmount,
            unit: meter.unit,
            windowStart,
            windowEnd,
            idempotencyKey: `${params.clientId}:${meter.slug}:${
              candidate.subject
            }:${windowId ?? windowStart.toISOString()}:${threshold}`,
          });
        } catch (err) {
          this.statsd.increment('metering.sweep.dispatch_error');
          this.logger.error(err);
          failed += 1;
          continue;
        }

        recorded.push({
          clientId: params.clientId,
          slug: params.slug,
          subject: candidate.subject,
          threshold,
          signingClientId: webhook.signingClientId,
          windowId,
          sentAt: now,
        });
      }
    }

    return { recorded, failed };
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import {
  MeteringConfigurationManager,
  type StrapiMeter,
  type StrapiMeterWebhook,
} from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  CATCH_UP_SLICE_MS,
  MAX_TIMESTAMP_FUTURE_MS,
  MAX_TIMESTAMP_PAST_MS,
} from './metering.constants';
import type {
  MeterKey,
  RecordedNotification,
  SentNotification,
  SweepAllResult,
  SweepCandidate,
  SweepOutcome,
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

interface IngestRange {
  ingestedSince: Date;
  ingestedUntil: Date;
}

interface SweepContext {
  params: MeterKey;
  meter: StrapiMeter;
  thresholds: number[];
  lastSent: Map<string, SentNotification>;
  sessionStarts: Map<string, Date>;
  now: Date;
}

interface SweepTotals {
  candidates: number;
  dispatched: number;
}

interface SliceSummary extends SweepTotals {
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

  async sweepAll(now: Date = new Date()): Promise<SweepAllResult> {
    const startedAt = Date.now();
    const meters = await this.meteringSweepManager.findActiveMeters({
      ingestedSince: new Date(
        now.getTime() -
          this.meteringSweepConfig.lookbackMs -
          this.meteringSweepConfig.watermarkLagMs
      ),
    });

    let held = 0;
    let failed = 0;
    for (const meter of meters) {
      try {
        const result = await this.sweep(meter, now);
        if (result.held) {
          held += 1;
        }
        this.reportMeter(meter, result);
      } catch (err) {
        failed += 1;
        Sentry.withScope((scope) => {
          scope.setTag('clientId', meter.clientId);
          scope.setTag('slug', meter.slug);
          Sentry.captureException(err);
        });
        this.logger.error(err);
      }
    }

    this.statsd.timing('metering.sweep_all.duration', Date.now() - startedAt);
    return { total: meters.length, held, failed };
  }

  private reportMeter(meter: MeterKey, result: SweepResult): void {
    const label = `${meter.clientId}/${meter.slug}`;
    if (result.outcome === 'meter-not-configured') {
      this.logger.warn(
        `Meter ${label} is not configured in the CMS and was skipped`
      );
      return;
    }
    this.logger.log(
      `Swept ${label}: ${result.outcome}, ${result.candidates} candidates, ${
        result.dispatched
      } dispatched${result.held ? ', retry pending' : ''}`
    );
  }

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
        held: false,
        watermark: now.toISOString(),
      };
    }

    let watermark =
      (await this.meteringSweepManager.findWatermark(params)) ??
      new Date(now.getTime() - this.meteringSweepConfig.lookbackMs);
    this.statsd.gauge(
      'metering.sweep.watermark_age',
      now.getTime() - watermark.getTime(),
      { slug: params.slug }
    );

    const thresholds = meterResult
      .getNotificationThresholds()
      .filter((threshold) => threshold > 0);

    if (meter.webhooks.length === 0) {
      await this.meteringSweepManager.advanceWatermark({
        ...params,
        watermark: now,
        updatedAt: now,
      });
      return {
        outcome: 'no-webhooks',
        candidates: 0,
        dispatched: 0,
        held: false,
        watermark: now.toISOString(),
      };
    }
    if (thresholds.length === 0 || meter.limit <= 0) {
      await this.meteringSweepManager.advanceWatermark({
        ...params,
        watermark: now,
        updatedAt: now,
      });
      return {
        outcome: 'no-thresholds',
        candidates: 0,
        dispatched: 0,
        held: false,
        watermark: now.toISOString(),
      };
    }

    const floor = this.catchUpFloor(meter, now);
    if (watermark < floor) {
      watermark = floor;
    }

    const totals: SweepTotals = { candidates: 0, dispatched: 0 };
    while (watermark < now) {
      const range = this.nextSlice(watermark, now);
      if (meter.window.kind === 'session') {
        await this.detectSessionStarts(params, meter, range, now);
      } else {
        const candidates = await this.findWindowCandidates(
          params,
          meter,
          thresholds,
          range,
          now
        );
        const slice = await this.notifyCrossings(
          params,
          meter,
          thresholds,
          candidates,
          now
        );
        totals.candidates += slice.candidates;
        totals.dispatched += slice.dispatched;
        if (slice.failed > 0) {
          return this.pendingRetry(params, totals, watermark);
        }
      }
      await this.meteringSweepManager.advanceWatermark({
        ...params,
        watermark: range.ingestedUntil,
        updatedAt: now,
      });
      watermark = range.ingestedUntil;
    }

    if (meter.window.kind === 'session') {
      const candidates = await this.findSessionCandidates(
        params,
        meter,
        thresholds,
        now
      );
      const slice = await this.notifyCrossings(
        params,
        meter,
        thresholds,
        candidates,
        now
      );
      totals.candidates += slice.candidates;
      totals.dispatched += slice.dispatched;
      if (slice.failed > 0) {
        return this.pendingRetry(params, totals, watermark);
      }
    }

    return {
      ...totals,
      outcome: this.outcomeFor(totals, false),
      held: false,
      watermark: watermark.toISOString(),
    };
  }

  private catchUpFloor(meter: StrapiMeter, now: Date): Date {
    const windowStart =
      meter.window.kind === 'session'
        ? new Date(now.getTime() - meter.window.durationMs)
        : resolveWindow(meter.window, now).windowStart;
    return new Date(windowStart.getTime() - MAX_TIMESTAMP_FUTURE_MS);
  }

  private nextSlice(watermark: Date, now: Date): IngestRange {
    return {
      ingestedSince: new Date(
        watermark.getTime() - this.meteringSweepConfig.watermarkLagMs
      ),
      ingestedUntil: new Date(
        Math.min(now.getTime(), watermark.getTime() + CATCH_UP_SLICE_MS)
      ),
    };
  }

  private pendingRetry(
    params: MeterKey,
    totals: SweepTotals,
    watermark: Date
  ): SweepResult {
    this.statsd.increment('metering.sweep.watermark_held', {
      slug: params.slug,
    });
    return {
      ...totals,
      outcome: this.outcomeFor(totals, true),
      held: true,
      watermark: watermark.toISOString(),
    };
  }

  private outcomeFor(totals: SweepTotals, held: boolean): SweepOutcome {
    if (totals.dispatched > 0) {
      return 'dispatched';
    }
    if (held) {
      return 'dispatch-failed';
    }
    return totals.candidates > 0 ? 'no-crossings' : 'no-candidates';
  }

  private async notifyCrossings(
    params: MeterKey,
    meter: StrapiMeter,
    thresholds: number[],
    candidates: SweepCandidate[],
    now: Date
  ): Promise<SliceSummary> {
    if (candidates.length === 0) {
      return { candidates: 0, dispatched: 0, failed: 0 };
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

    return { candidates: candidates.length, dispatched, failed };
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
    range: IngestRange,
    now: Date
  ): Promise<void> {
    if (meter.window.kind !== 'session') {
      return;
    }

    const opened = await this.meteringSweepManager.findNewSessionStarts({
      ...params,
      ...range,
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

  private async findWindowCandidates(
    params: MeterKey,
    meter: StrapiMeter,
    thresholds: number[],
    range: IngestRange,
    now: Date
  ): Promise<SweepCandidate[]> {
    const { windowStart, windowEnd } = resolveWindow(meter.window, now);
    return this.meteringSweepManager.findWindowCandidates({
      ...params,
      ...range,
      from: windowStart,
      to: windowEnd,
      eventTimeFloor: new Date(
        range.ingestedSince.getTime() - MAX_TIMESTAMP_PAST_MS
      ),
      minUsage: (Math.min(...thresholds) / 100) * meter.limit,
    });
  }

  private async findSessionCandidates(
    params: MeterKey,
    meter: StrapiMeter,
    thresholds: number[],
    now: Date
  ): Promise<SweepCandidate[]> {
    if (meter.window.kind !== 'session') {
      return [];
    }
    return this.meteringSweepManager.findSessionCandidates({
      ...params,
      expiredBefore: new Date(now.getTime() - meter.window.durationMs),
      to: now,
      minUsage: (Math.min(...thresholds) / 100) * meter.limit,
    });
  }

  private async dispatchForSubject(
    context: SweepContext,
    candidate: SweepCandidate
  ): Promise<SubjectDispatch> {
    const { params, meter, thresholds, lastSent, now } = context;

    const { windowStart, windowEnd } = resolveWindow(
      meter.window,
      now,
      context.sessionStarts.get(candidate.subject)
    );
    const windowId = computeWindowId(meter.window, windowStart);
    const isDue = (threshold: number, webhook: StrapiMeterWebhook): boolean =>
      shouldNotify({
        windowId,
        lastSent: lastSent.get(
          notificationKey(candidate.subject, threshold, webhook.signingClientId)
        ),
        now,
        cooldownMs: this.meteringSweepConfig.cooldownMs,
      });

    const due = thresholds.filter((threshold) =>
      meter.webhooks.some((webhook) => isDue(threshold, webhook))
    );
    if (due.length === 0) {
      return { recorded: [], failed: 0 };
    }

    const grantedAmount = await this.usageGrantsManager.getActiveGrantedAmount(
      candidate.subject,
      params.slug,
      now
    );
    const effectiveLimit = meter.limit + grantedAmount;
    const met = computeThresholdsMet(due, candidate.usage, effectiveLimit);
    if (met.length === 0) {
      return { recorded: [], failed: 0 };
    }

    const recorded: RecordedNotification[] = [];
    let failed = 0;

    for (const threshold of met) {
      for (const webhook of meter.webhooks) {
        if (!isDue(threshold, webhook)) {
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

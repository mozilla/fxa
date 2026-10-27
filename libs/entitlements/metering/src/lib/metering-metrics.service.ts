/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import {
  MeteringConfigurationManager,
  type MeterBySlugResultUtil,
  type StrapiMeter,
} from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import type {
  MeterKey,
  MetricsReportAllResult,
  MetricsReportOutcome,
  NotifiedSubjectCount,
} from './metering.types';
import { MeteringMetricsManager } from './metering-metrics.manager';
import { MeteringSweepManager } from './metering-sweep.manager';
import { resolveWindow } from './utils/resolveWindow';

@Injectable()
export class MeteringMetricsService {
  constructor(
    private readonly meteringConfigurationManager: MeteringConfigurationManager,
    private readonly meteringMetricsManager: MeteringMetricsManager,
    private readonly meteringSweepManager: MeteringSweepManager,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {}

  async reportAll(now: Date = new Date()): Promise<MetricsReportAllResult> {
    const startedAt = Date.now();
    const meters = await this.meteringSweepManager.findSweptMeters();

    let failed = 0;
    for (const meter of meters) {
      try {
        const outcome = await this.report(meter, now);
        this.logMeter(meter, outcome);
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

    this.statsd.timing(
      'metering.metrics_report_all.duration',
      Date.now() - startedAt
    );
    return { total: meters.length, failed };
  }

  private logMeter(meter: MeterKey, outcome: MetricsReportOutcome): void {
    const label = `${meter.clientId}/${meter.slug}`;
    if (outcome === 'meter-not-configured') {
      this.logger.warn(
        `Meter ${label} is not configured in the CMS and was skipped`
      );
      return;
    }
    this.logger.log(`Reported metrics for ${label}`);
  }

  async report(
    params: MeterKey,
    now: Date = new Date()
  ): Promise<MetricsReportOutcome> {
    const startedAt = Date.now();
    let outcome: MetricsReportOutcome | 'error' = 'error';
    try {
      outcome = await this.runReport(params, now);
      return outcome;
    } finally {
      this.statsd.increment('metering.metrics_report', {
        outcome,
        slug: params.slug,
      });
      this.statsd.timing(
        'metering.metrics_report.duration',
        Date.now() - startedAt,
        { slug: params.slug }
      );
    }
  }

  private async runReport(
    params: MeterKey,
    now: Date
  ): Promise<MetricsReportOutcome> {
    const meterResult =
      await this.meteringConfigurationManager.getMeterResultUtil(params.slug);
    const meter = meterResult.meters.at(0);
    if (!meter) {
      return 'meter-not-configured';
    }

    const today = resolveWindow({ kind: 'calendar', period: 'daily' }, now);
    const [activeSubjectCountToday, notifiedSubjectCounts] = await Promise.all([
      this.meteringMetricsManager.findActiveSubjectCount({
        ...params,
        from: today.windowStart,
        to: today.windowEnd,
      }),
      this.meteringMetricsManager.findNotifiedSubjectCounts({
        ...params,
        from: this.currentWindowStart(meter, now),
        to: now,
        thresholds: this.notifiedThresholds(meterResult, meter),
      }),
    ]);

    this.sendGauges(
      params,
      meter,
      activeSubjectCountToday,
      notifiedSubjectCounts
    );
    return 'reported';
  }

  private notifiedThresholds(
    meterResult: MeterBySlugResultUtil,
    meter: StrapiMeter
  ): number[] {
    if (meter.webhooks.length === 0 || meter.limit <= 0) {
      return [];
    }
    return meterResult
      .getNotificationThresholds()
      .filter((threshold) => threshold > 0);
  }

  private currentWindowStart(meter: StrapiMeter, now: Date): Date {
    if (meter.window.kind === 'session') {
      return new Date(now.getTime() - meter.window.durationMs);
    }
    return resolveWindow(meter.window, now).windowStart;
  }

  private sendGauges(
    params: MeterKey,
    meter: StrapiMeter,
    activeSubjectCountToday: number,
    notifiedSubjectCounts: NotifiedSubjectCount[]
  ): void {
    const tags = { clientId: params.clientId, slug: params.slug };
    this.statsd.gauge('metering.metrics.meter_limit', meter.limit, {
      ...tags,
      unit: meter.unit,
    });
    this.statsd.gauge(
      'metering.metrics.active_subjects_today',
      activeSubjectCountToday,
      tags
    );
    for (const { threshold, subjectCount } of notifiedSubjectCounts) {
      this.statsd.gauge('metering.metrics.notified_subjects', subjectCount, {
        ...tags,
        threshold: String(threshold),
      });
    }
  }
}

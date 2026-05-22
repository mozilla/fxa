/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  MeteringConfig,
  MeteringMeterRegistryConfig,
} from './metering.config';
import { OpenMeterClient } from './openmeter.client';

/**
 * Caches the set of meter slugs OpenMeter knows about, refreshed on a
 * timer. `UsageService.ingestUsage` consults this registry after the
 * Strapi lookup so we fail fast when a Strapi-configured slug has no
 * corresponding OpenMeter meter — events for unknown slugs are silently
 * dead-lettered by OpenMeter (returned 202 on ingest, but flagged with
 * `validationError: "no meter found for event type: ..."` on read), and
 * surfacing that failure server-side is dramatically more useful than
 * waiting to discover it via the dead-letter poller hours later.
 *
 * Fail-open semantics: if the initial bootstrap load has not yet completed
 * (e.g. OpenMeter unreachable at startup), `exists` returns `true` rather
 * than rejecting every ingest. The buffer's existing backpressure handles
 * the case where OpenMeter is wholly unavailable.
 */
@Injectable()
export class MeteringMeterRegistry
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private slugs: Set<string> = new Set();
  private loaded = false;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly opts: MeteringMeterRegistryConfig;

  constructor(
    private readonly openMeterClient: OpenMeterClient,
    meteringConfig: MeteringConfig,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    this.opts = meteringConfig.meterRegistry ?? new MeteringMeterRegistryConfig();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh();
    this.scheduleRefresh();
  }

  onApplicationShutdown(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  exists(slug: string): boolean {
    if (!this.loaded) {
      this.statsd.increment('metering.registry.unloaded');
      return true;
    }
    const present = this.slugs.has(slug);
    if (!present) {
      this.statsd.increment('metering.registry.miss', [`slug:${slug}`]);
    }
    return present;
  }

  async refresh(): Promise<void> {
    try {
      const meters = await this.openMeterClient.meters.list();
      const next = new Set<string>();
      for (const meter of meters ?? []) {
        if (meter.slug) {
          next.add(meter.slug);
        }
      }
      this.slugs = next;
      this.loaded = true;
      this.statsd.increment('metering.registry.refresh');
      this.statsd.gauge('metering.registry.size', this.slugs.size);
    } catch (err) {
      Sentry.captureException(err);
      this.statsd.increment('metering.registry.refresh_error');
      this.logger.error(err);
    }
  }

  private scheduleRefresh(): void {
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh().finally(() => {
        if (this.refreshTimer === null) {
          this.scheduleRefresh();
        }
      });
    }, this.opts.refreshIntervalMs);
    if (typeof this.refreshTimer.unref === 'function') {
      this.refreshTimer.unref();
    }
  }
}

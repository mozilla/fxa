/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeterInvalidNotificationThresholdError,
  MeterInvalidWindowError,
  MeterNotFoundError,
} from '../../cms.error';
import {
  MeterBySlugResult,
  MeteringWindow,
  StrapiMeter,
  StrapiMeterRaw,
} from './types';

export function toStrapiMeter(meter: StrapiMeterRaw): StrapiMeter {
  return {
    slug: meter.slug,
    unit: meter.unit,
    limit: meter.limit,
    notificationThresholds: meter.notificationThresholds,
    webhooks: meter.webhooks,
    window: toMeteringWindow(meter),
  };
}

function toMeteringWindow(meter: StrapiMeterRaw): MeteringWindow {
  switch (meter.windowKind) {
    case 'calendar':
      if (!meter.windowPeriod) {
        throw new MeterInvalidWindowError(
          meter.slug,
          'calendar meters need a windowPeriod'
        );
      }
      return { kind: 'calendar', period: meter.windowPeriod };
    case 'sliding':
    case 'session':
      if (!meter.windowDurationMinutes || meter.windowDurationMinutes <= 0) {
        throw new MeterInvalidWindowError(
          meter.slug,
          `${meter.windowKind} meters need a positive windowDurationMinutes`
        );
      }
      return {
        kind: meter.windowKind,
        durationMs: meter.windowDurationMinutes * 60_000,
      };
  }
}

export class MeterBySlugResultUtil {
  private readonly normalizedMeters: StrapiMeter[];

  constructor(
    rawResult: MeterBySlugResult,
    private slug: string
  ) {
    this.normalizedMeters = rawResult.meters.map(toStrapiMeter);
  }

  getMeter(): StrapiMeter {
    const meter = this.meters.at(0);
    if (!meter) throw new MeterNotFoundError(this.slug);
    return meter;
  }

  getNotificationThresholds(): number[] {
    const meter = this.getMeter();
    const thresholds = meter.notificationThresholds
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => !Number.isNaN(n));

    for (const n of thresholds) {
      if (n < 0 || n > 100) {
        throw new MeterInvalidNotificationThresholdError(this.slug, n);
      }
    }

    return thresholds;
  }

  get meters(): StrapiMeter[] {
    return this.normalizedMeters;
  }
}

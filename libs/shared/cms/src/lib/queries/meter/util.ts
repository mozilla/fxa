/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeterInvalidNotificationThresholdError,
  MeterNotFoundError,
} from '../../cms.error';
import { MeterBySlugResult, StrapiMeter, StrapiMeterRaw } from './types';

export function toStrapiMeter(meter: StrapiMeterRaw): StrapiMeter {
  return { ...meter, window: { kind: 'calendar', period: meter.window } };
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

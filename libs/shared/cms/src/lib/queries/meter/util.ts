/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeterInvalidNotificationThresholdError,
  MeterNotFoundError,
} from '../../cms.error';
import { MeterBySlugResult, StrapiMeter } from './types';

export class MeterBySlugResultUtil {
  constructor(
    private rawResult: MeterBySlugResult,
    private slug: string
  ) {}

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

  get meters(): MeterBySlugResult['meters'] {
    return this.rawResult.meters;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import type {
  FindActiveSubjectCountParams,
  FindNotifiedSubjectCountsParams,
  NotifiedSubjectCount,
} from './metering.types';
import { MeteringMetricsRepository } from './metering-metrics.repository';

@Injectable()
export class MeteringMetricsManager {
  constructor(
    private readonly meteringMetricsRepository: MeteringMetricsRepository
  ) {}

  async findActiveSubjectCount(
    params: FindActiveSubjectCountParams
  ): Promise<number> {
    return this.meteringMetricsRepository.findActiveSubjectCount(params);
  }

  async findNotifiedSubjectCounts(
    params: FindNotifiedSubjectCountsParams
  ): Promise<NotifiedSubjectCount[]> {
    if (params.thresholds.length === 0) {
      return [];
    }

    const rows =
      await this.meteringMetricsRepository.findNotifiedSubjectCounts(params);
    const counts = new Map(
      rows.map((row) => [row.threshold, row.subject_count])
    );

    return params.thresholds.map((threshold) => ({
      threshold,
      subjectCount: counts.get(threshold) ?? 0,
    }));
  }
}

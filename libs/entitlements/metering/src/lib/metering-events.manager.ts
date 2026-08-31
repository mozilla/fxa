/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { MeteringEventsRepository } from './metering-events.repository';
import type { MeteringEventInput, SumUsageParams } from './metering.types';

@Injectable()
export class MeteringEventsManager {
  constructor(
    private readonly meteringEventsRepository: MeteringEventsRepository
  ) {}

  async insertEvents(events: MeteringEventInput[]): Promise<void> {
    await this.meteringEventsRepository.insertEvents(events);
  }

  async sumUsage(params: SumUsageParams): Promise<number> {
    return this.meteringEventsRepository.sumUsage(params);
  }
}

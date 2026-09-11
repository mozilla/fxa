/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class MeteringSweepConfig {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly lookbackMs: number = 90_000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly cooldownMs: number = 60 * 60 * 1000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly dispatchConcurrency: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  public readonly watermarkLagMs: number = 30_000;
}

export const MockMeteringSweepConfig = {
  lookbackMs: 90_000,
  cooldownMs: 60 * 60 * 1000,
  dispatchConcurrency: 20,
  watermarkLagMs: 30_000,
} satisfies MeteringSweepConfig;

export const MockMeteringSweepConfigProvider = {
  provide: MeteringSweepConfig,
  useValue: MockMeteringSweepConfig,
} satisfies Provider<MeteringSweepConfig>;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Must be the first import so Sentry patches Nest before it boots.
import './monitoring';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

import { MeteringSweepService } from '@fxa/entitlements/metering';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringSweepModule } from './app/metering-sweep.module';

async function run(): Promise<number> {
  const app = await NestFactory.createApplicationContext(MeteringSweepModule);
  try {
    const result = await app.get(MeteringSweepService).sweepAll();
    Logger.log(
      `Swept ${result.total} meters: ${result.held} held, ${result.failed} failed`,
      'MeteringSweep'
    );
    return result.failed > 0 ? 1 : 0;
  } finally {
    await new Promise<void>((resolve) =>
      app.get<StatsD>(StatsDService).close(() => resolve())
    );
    await app.close();
  }
}

run()
  .catch((err: unknown) => {
    Sentry.captureException(err);
    Logger.error(err, undefined, 'MeteringSweep');
    return 1;
  })
  .then(async (code) => {
    await Sentry.close(2000);
    process.exit(code);
  });

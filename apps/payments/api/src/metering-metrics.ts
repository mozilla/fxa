/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Must be the first import so Sentry patches Nest before it boots.
import './monitoring';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';

import { MeteringMetricsService } from '@fxa/entitlements/metering';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringMetricsModule } from './app/metering-metrics.module';

async function run(): Promise<number> {
  const app = await NestFactory.createApplicationContext(MeteringMetricsModule);
  try {
    const result = await app.get(MeteringMetricsService).reportAll();
    Logger.log(
      `Reported metrics for ${result.total} meters: ${result.failed} failed`,
      'MeteringMetrics'
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
    Logger.error(err, undefined, 'MeteringMetrics');
    return 1;
  })
  .then(async (code) => {
    await Sentry.close(2000);
    process.exit(code);
  });

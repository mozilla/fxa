/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { existsSync } from 'fs';
import { join } from 'path';

import * as dotenv from 'dotenv';
import { initSentry } from '@fxa/shared/sentry-nest';

// Sentry must initialize before `@nestjs/core` is imported so the
// SDK's async-context patches attach to every Nest handler. Nest's
// TypedConfigModule has not run yet, so pull configuration straight
// from the same `.env` files the module would load.
for (const file of ['.env.local', '.env']) {
  const path = join(process.cwd(), file);
  if (existsSync(path)) {
    dotenv.config({ path, override: false });
  }
}

const parseNumber = (raw: string | undefined, fallback: number) => {
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

initSentry(
  {
    release: process.env.APP_VERSION,
    sentry: {
      dsn: process.env.SENTRY_CONFIG__DSN,
      env: process.env.SENTRY_CONFIG__ENV,
      serverName: process.env.SENTRY_CONFIG__SERVER_NAME,
      sampleRate: parseNumber(process.env.SENTRY_CONFIG__SAMPLE_RATE, 0),
      tracesSampleRate: parseNumber(
        process.env.SENTRY_CONFIG__TRACES_SAMPLE_RATE,
        0
      ),
    },
  },
  console
);

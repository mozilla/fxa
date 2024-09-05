/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { initSentryForNextjsClient } from '@fxa/shared/sentry/client';
import { version } from './package.json';

const DEFAULT_SAMPLE_RATE = '1';
const DEFAULT_TRACES_SAMPLE_RATE = '1';

const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  env: process.env.NEXT_PUBLIC_SENTRY_ENV,
  clientName: process.env.NEXT_PUBLIC_SENTRY_CLIENT_NAME,
  sampleRate: parseInt(
    process.env.NEXT_PUBLIC_SENTRY_SAMPLE_RATE || DEFAULT_SAMPLE_RATE
  ),
  tracesSampleRate: parseInt(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ||
      DEFAULT_TRACES_SAMPLE_RATE
  ),
};

initSentryForNextjsClient({
  release: version,
  sentry: sentryConfig,
});

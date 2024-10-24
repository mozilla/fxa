/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { initSentryForNextjsServer } from '@fxa/shared/sentry-next';
import { config } from './config';

const sentryConfig = {
  dsn: config.nextPublicSentryDsn,
  env: config.nextPublicSentryEnv,
  serverName: config.sentry.serverName,
  sampleRate: config.nextPublicSentrySampleRate,
  tracesSampleRate: config.nextPublicSentryTracesSampleRate,
};

initSentryForNextjsServer(
  {
    release: process.env.version,
    sentry: sentryConfig,
  },
  console
);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const { version } = require('../package.json');

// config registers the @fxa/* path aliases, so it must load before them.
const config = require('./config').getProperties();
const { initTracing } = require('@fxa/shared/otel');
const { initSentry } = require('@fxa/shared/sentry-node');
const log = require('./logging')('configure-sentry');

// Sentry also uses OTEL under the hood. Tracing must start first, and each side
// must know about the other, or traces and breadcrumbs bleed between requests.
if (config.sentry?.dsn) {
  config.tracing.sentry = { enabled: true };
}
if (initTracing(config.tracing, log)) {
  config.sentry.skipOpenTelemetrySetup = true;
}
initSentry(
  {
    ...config,
    release: version,
    integrations: [Sentry.linkedErrorsIntegration({ key: 'jse_cause' })],
  },
  log
);

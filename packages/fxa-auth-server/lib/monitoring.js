/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { initTracing } = require('@fxa/shared/otel');
const { initSentry } = require('fxa-shared/sentry/node');
const Sentry = require('@sentry/node');
const { config: convictConfig } = require('../config');
const config = convictConfig.getProperties();
const { version } = require('../package.json');
const { ignoreErrors } = require('@fxa/accounts/errors');

const logger = require('./log')(config.log.level, 'configure-sentry');

// Sentry also uses OTEL under the hood. Tracing must start first, and each side
// must know about the other, or traces and breadcrumbs bleed between requests.
if (config.sentry?.dsn) {
  config.tracing.sentry = { enabled: true };
}
if (initTracing(config.tracing, logger)) {
  config.sentry.skipOpenTelemetrySetup = true;
}
initSentry(
  {
    ...config,
    release: version,
    eventFilters: [filterSentryEvent],
    integrations: [
      // Important! This fixes a ton of problems with our previous integration.
      Sentry.hapiIntegration(),
      Sentry.linkedErrorsIntegration({ key: 'jse_cause' }),
    ],
  },
  logger
);

/**
 * Filter a sentry event for PII in addition to the default filters.
 *
 * Current replacements:
 *   - A 32-char hex string that typically is a FxA user-id.
 *
 * Data Removed:
 *   - Request body.
 *
 * @param {Sentry.Event} event
 */
function filterSentryEvent(event, hint) {
  // If we encounter a WError, we likely want to filter it out. These errors are
  // intentionally relayed to the client, and don't constitute unexpected errors.
  // Note, that these might arrive here from our reportSentryError function, or
  // some other instrumentation that has captured the error.
  if (hint?.originalException != null && ignoreErrors(hint.originalException)) {
    return null;
  }

  return event;
}

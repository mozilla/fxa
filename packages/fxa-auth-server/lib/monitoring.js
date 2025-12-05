/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { initMonitoring } = require('fxa-shared/monitoring');
const Sentry = require('@sentry/node');
const { config } = require('../config');
const logger = require('./log')(
  config.getProperties().log.level,
  'configure-sentry'
);
const { version } = require('../package.json');
const { ignoreErrors } = require('@fxa/accounts/errors');

/**
 * Initialize sentry & otel
 */
initMonitoring({
  logger,
  config: {
    ...config.getProperties(),
    release: version,
    eventFilters: [filterSentryEvent],
    integrations: [Sentry.linkedErrorsIntegration({ key: 'jse_cause' })],
  },
});

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
  // This flag indicates the error was captured by us. Without this, we were seeing
  // errors propagate from instrumentation libraries, thereby creating duplicates
  // and create errors without expected context. This appeared to start happening
  // when we enabled tracing. See the reportError function if you are curious about
  // how this gets set, and wired into hapi's error handling.
  if (event.extra?.report !== true) {
    return null;
  }

  // If we encounter a WError, we likely want to filter it out. These errors are
  // intentionally relayed to the client, and don't constitute unexpected errors.
  // Note, that these might arrive here from our reportSentryError function, or
  // some other instrumentation that has captured the error.
  if (hint?.originalException != null && ignoreErrors(hint.originalException)) {
    return null;
  }

  return event;
}

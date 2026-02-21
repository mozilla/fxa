/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Sentry = require('@sentry/node');

const {
  formatMetadataValidationErrorMessage,
  reportValidationError,
} = require('fxa-shared/sentry/report-validation-error');

function reportSentryMessage(message, captureContext) {
  Sentry.captureMessage(message, captureContext);
}

function reportSentryError(err, request) {
  Sentry.captureException(err);
}

async function configureSentry(server, config, processName = 'key_server') {
  if (config.sentry.dsn) {
    Sentry.getGlobalScope().setTag('process', processName);

    if (!server) {
      return;
    }
    server.ext({
      type: 'onPreHandler',
      method(request, h) {
        // hapiIntegration() manages per-request isolation scopes via async context.
        // Set tags/extras directly on the current scope — no withIsolationScope
        // wrapper here, which would create a synchronous child scope that is
        // discarded before the async handler runs, causing breadcrumbs to leak
        // onto the global scope and accumulate across requests.
        Sentry.setTag('route', request.route.path);
        Sentry.setTag('method', request.method);
        Sentry.setExtra('request_payload', request.payload || {});
        Sentry.setExtra('request_headers', request.headers || {});
        Sentry.setExtra('request_params', request.params || {});
        return h.continue;
      },
    });

    server.events.on('request', (request, event, tags) => {
      if (event?.error) {
        Sentry.withScope((scope) => {
          scope.setExtra('hapi_event', event);
          Sentry.captureException(event.error);
        });
      }
    });
  }
}

module.exports = {
  configureSentry,
  reportSentryMessage,
  reportSentryError,
  reportValidationError,
  formatMetadataValidationErrorMessage,
};

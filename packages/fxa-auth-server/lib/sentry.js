/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Sentry = require('@sentry/node');

const {
  formatMetadataValidationErrorMessage,
  reportValidationError,
} = require('fxa-shared/sentry/report-validation-error');

// Anything with these keys containing these strings will be redacted.
const SENSITIVE_KEY_TERMS = new Set(['auth', 'pw', 'kb', 'key']);

function filterExtras(obj, depth = 0) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const lower = k.toLowerCase();
      if ([...SENSITIVE_KEY_TERMS].some((term) => lower.includes(term))) {
        return [k, '[Filtered]'];
      }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (depth >= 4) {
          return [k, '[Filtered]'];
        }
        return [k, filterExtras(v, depth + 1)];
      }
      return [k, v];
    })
  );
}

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
        const UNKNOWN = 'Unknown';
        Sentry.setTag('route', request.route.path);
        Sentry.setTag('method', request.method);
        Sentry.setUser({
          email:
            request.credentials?.email ||
            request.payload?.email ||
            request.params?.email ||
            UNKNOWN,
          geo: {
            city: request.app?.geo?.location?.city || UNKNOWN,
            country_code:
              request.app?.geo?.location?.countryCode ||
              request.app?.geo?.location?.country ||
              UNKNOWN,
            region:
              request.app?.geo?.location?.stateCode ||
              request.app?.geo?.location?.state ||
              UNKNOWN,
          },
          id: request.auth?.credentials?.uid || UNKNOWN,
          ip_address: request.app?.clientAddress || UNKNOWN,
        });
        Sentry.setExtra('acceptLanguage', request.app?.acceptLanguage || {});
        Sentry.setExtra('request_payload', filterExtras(request.payload || {}));
        Sentry.setExtra('request_headers', filterExtras(request.headers || {}));
        Sentry.setExtra('request_params', filterExtras(request.params || {}));
        return h.continue;
      },
    });

    server.events.on('request', (request, event, tags) => {
      if (event?.error && tags?.handler && tags?.error) {
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
  filterExtras,
  reportSentryMessage,
  reportSentryError,
  reportValidationError,
  formatMetadataValidationErrorMessage,
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Hoek = require('@hapi/hoek');
const Sentry = require('@sentry/node');

const getVersion = require('./version').getVersion;

// Matches uid, session, oauth and other common tokens which we would
// prefer not to include in Sentry reports.
const TOKENREGEX = /[a-fA-F0-9]{32,}/gi;
const FILTERED = '[Filtered]';
const URIENCODEDFILTERED = encodeURIComponent(FILTERED);

/**
 * Filters all of an objects string properties to remove tokens.
 *
 * @param {Object} obj Object to filter values on
 */
function filterObject(obj) {
  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        obj[key] = value.replace(TOKENREGEX, FILTERED);
      }
    }
  }
  return obj;
}

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
  if (event.breadcrumbs) {
    for (const bc of event.breadcrumbs) {
      if (bc.message) {
        bc.message = bc.message.replace(TOKENREGEX, FILTERED);
      }
      if (bc.data) {
        bc.data = filterObject(bc.data);
      }
    }
  }
  if (event.request) {
    if (event.request.url) {
      event.request.url = event.request.url.replace(TOKENREGEX, FILTERED);
    }
    if (event.request.query_string) {
      event.request.query_string = event.request.query_string.replace(
        TOKENREGEX,
        URIENCODEDFILTERED
      );
    }
    if (event.request.headers) {
      event.request.headers = filterObject(event.request.headers);
    }
    if (event.request.data) {
      // Remove request data entirely
      delete event.request.data;
    }
  }
  if (event.tags && event.tags.url) {
    event.tags.url = event.request.url.replace(TOKENREGEX, FILTERED);
  }
  return event;
}

async function configureSentry(server, config) {
  const sentryDsn = config.sentryDsn;
  const versionData = await getVersion();
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      release: versionData.version,
      beforeSend(event, hint) {
        return filterSentryEvent(event, hint);
      },
    });
    Sentry.configureScope(scope => {
      scope.setTag('process', 'key_server');
    });

    // Attach a new Sentry scope to the request for breadcrumbs/tags/extras
    server.ext({
      type: 'onRequest',
      method(request, h) {
        request.sentryScope = new Sentry.Scope();
        return h.continue;
      },
    });

    // Sentry handler for hapi errors
    server.events.on(
      { name: 'request', channels: 'error' },
      (request, event) => {
        const err = (event && event.error) || null;
        let exception = '';
        if (err && err.stack) {
          try {
            exception = err.stack.split('\n')[0];
          } catch (e) {
            // ignore bad stack frames
          }
        }

        Sentry.withScope(scope => {
          scope.addEventProcessor(_sentryEvent => {
            const sentryEvent = Sentry.Handlers.parseRequest(
              _sentryEvent,
              request.raw.req
            );
            sentryEvent.level = 'error';
            return sentryEvent;
          });
          scope.setExtra('exception', exception);

          // Merge the request scope into the temp scope
          Hoek.merge(scope, request.sentryScope);
          Sentry.captureException(err);
        });
      }
    );
  }
}

module.exports = { configureSentry };

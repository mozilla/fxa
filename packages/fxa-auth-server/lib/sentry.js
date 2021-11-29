/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Hoek = require('@hapi/hoek');
const Sentry = require('@sentry/node');
const { ExtraErrorData } = require('@sentry/integrations');
const verror = require('verror');

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
    event.tags.url = event.tags.url.replace(TOKENREGEX, FILTERED);
  }
  return event;
}

function reportSentryError(err, request) {
  let exception = '';
  if (err && err.stack) {
    try {
      exception = err.stack.split('\n')[0];
    } catch (e) {
      // ignore bad stack frames
    }
  }

  Sentry.withScope((scope) => {
    if (request) {
      scope.addEventProcessor((_sentryEvent) => {
        const sentryEvent = Sentry.Handlers.parseRequest(
          _sentryEvent,
          request.raw.req
        );
        sentryEvent.level = Sentry.Severity.Error;
        return sentryEvent;
      });
    }
    scope.setExtra('exception', exception);
    // If additional data was added to the error, extract it.
    if (err.output && typeof err.output.payload === 'object') {
      const payload = err.output.payload;
      if (typeof payload.data === 'object') {
        scope.setContext('payload.data', payload.data);
        delete payload.data;
      }
      scope.setContext('payload', payload);
    }
    const cause = verror.cause(err);
    if (cause && cause.message) {
      const causeContext = {
        errorName: cause.name,
        reason: cause.reason,
        errorMessage: cause.message,
      };

      // Poolee EndpointError's have a few other things and oddly don't include
      // a stack at all. We try and extract a bit more to reflect what actually
      // happened as 'socket hang up' is somewhat inaccurate when the remote server
      // throws a 500.
      const output = cause.output;
      if (output && output.payload) {
        for (const key of ['error', 'message', 'statusCode']) {
          causeContext[key] = output.payload[key];
        }
      }
      const attempt = cause.attempt;
      if (attempt) {
        causeContext.method = attempt.method;
        causeContext.path = attempt.path
          ? attempt.path.replace(TOKENREGEX, FILTERED)
          : null;
      }
      scope.setContext('cause', causeContext);
    }

    if (request) {
      // Merge the request scope into the temp scope
      Hoek.merge(scope, request.sentryScope);
    }
    Sentry.captureException(err);
  });
}

async function configureSentry(server, config, processName = 'key_server') {
  const sentryDsn = config.sentryDsn;
  const versionData = await getVersion();
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      release: versionData.version,
      beforeSend(event, hint) {
        return filterSentryEvent(event, hint);
      },
      normalizeDepth: 6,
      integrations: [
        new Sentry.Integrations.LinkedErrors({ key: 'jse_cause' }),
        new ExtraErrorData({ depth: 5 }),
      ],
      // https://docs.sentry.io/platforms/node/configuration/options/#max-value-length
      maxValueLength: 500,
    });
    Sentry.configureScope((scope) => {
      scope.setTag('process', processName);
    });

    if (!server) {
      return;
    }

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
        reportSentryError(err, request);
      }
    );
  }
}

/**
 * Format a Stripe product/plan metadata validation error message for
 * Sentry to include as much detail as possible about what metadata
 * failed validation and in what way.
 *
 * @param {string} planId
 * @param {string | import('@hapi/joi').ValidationError} error
 */
function formatMetadataValidationErrorMessage(planId, error) {
  let msg = `${planId} metadata invalid:`;
  if (typeof error === 'string') {
    msg = `${msg} ${error}`;
  } else {
    msg = `${msg}${error.details
      .map(({ message }) => ` ${message};`)
      .join('')}`;
  }
  return msg;
}

/**
 * Report a validation error to Sentry with validation details.
 *
 * @param {*} message
 * @param {string | import('@hapi/joi').ValidationError} error
 */
function reportValidationError(message, error) {
  const details = {};
  if (typeof error === 'string') {
    details.error = error;
  } else {
    for (const errorItem of error.details) {
      const key = errorItem.path.join('.');
      details[key] = {
        message: errorItem.message,
        type: errorItem.type,
      };
    }
  }
  Sentry.withScope((scope) => {
    scope.setContext('validationError', details);
    Sentry.captureMessage(message, Sentry.Severity.Error);
  });
}

module.exports = {
  configureSentry,
  reportSentryError,
  reportValidationError,
  formatMetadataValidationErrorMessage,
};

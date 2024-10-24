/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Sentry = require('@sentry/node');
const get = require('lodash/get');
const config = require('./configuration');
const { initSentry } = require('@fxa/shared/sentry-node');
const logger = require('./logging/log')('sentry');
const { version } = require('../../package.json');

const STACKTRACE_FRAME_LENGTH = 10;

function removeQuery(url) {
  if (!url) {
    return '';
  }

  // this removes the query params, avoids revealing PII
  // in the future we can add allowed fields if it is useful
  return url.split('?').shift();
}

const eventFilter = (event) => {
  if (get(event, 'request.headers.Referer')) {
    event.request.headers.Referer = removeQuery(event.request.headers.Referer);
  }

  if (get(event, 'request.url')) {
    event.request.url = removeQuery(event.request.url);
  }

  if (get(event, 'request.query_string')) {
    event.request.query_string = null; //eslint-disable-line camelcase
  }

  if (get(event, 'exception[0].stacktrace.frames')) {
    // trim the stacktrace to avoid sending a lot of event
    // by default some traces may have 100+ frames
    event.exception[0].stacktrace.frames.length = STACKTRACE_FRAME_LENGTH;
  }

  return event;
};

initSentry(
  {
    ...config.getProperties(),
    release: version,
    integrations: [
      Sentry.extraErrorDataIntegration({ depth: 5 }),
      Sentry.linkedErrorsIntegration({ key: 'jse_cause' }),
    ],
  },
  {
    warn: (type, data) => logger.warn(type.replace(/ /g, '-'), data),
    debug: (type, data) => logger.debug(type.replace(/ /g, '-'), data),
    info: (type, data) => logger.info(type.replace(/ /g, '-'), data),
    error: (type, data) => logger.error(type.replace(/ /g, '-'), data),
  }
);

/**
 * Attempts to capture an error and report it to sentry. If the error is a
 * validation error special steps are taken to capture the reasons validation failed.
 * @param {*} err
 * @returns true if error was reported, false otherwise
 */
function tryCaptureValidationError(err) {
  try {
    // Try to get error details. This might not be present.
    let errorDetails = null;
    if (err != null && err.details instanceof Map) {
      errorDetails = err.details.get('body');
    }

    if (errorDetails) {
      const message = `${errorDetails}`;
      const validationError = errorDetails.details.reduce((a, v) => {
        // Try to get the key for the field that failed validation and update
        // the error state
        if (v && Array.isArray(v.path)) {
          const key = v.path.join('.');

          if (key) {
            return {
              ...a,
              [key]: `reason: ${v.type} - ${v.message}`,
            };
          }
        }

        return a;
      }, {});

      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'validation_error');
        scope.setContext('validationError', { validationError });
        Sentry.captureMessage(message, 'error');
      });

      return true;
    }
  } catch (err) {
    logger.error(err);
  }

  return false;
}

module.exports = {
  _eventFilter: eventFilter, // exported for testing purposes
  sentryModule: Sentry,
  tryCaptureValidationError,
};

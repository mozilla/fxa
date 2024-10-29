import { ErrorEvent, EventHint, Exception } from '@sentry/types';
import {
  SentryConfigOpts,
  tagFxaName,
  cleanUpQueryParam,
} from '@fxa/shared/sentry-utils';

// Internal flag to keep track of whether or not sentry is initialized
let sentryEnabled = false;
export function disableSentry() {
  sentryEnabled = false;
}
export function enableSentry() {
  sentryEnabled = true;
}
export function isSentryEnabled() {
  return sentryEnabled;
}

/**
 * function that gets called before data gets sent to error metrics
 *
 * @param {Object} event
 *  Error object data
 * @returns {Object} data
 *  Modified error object data
 * @private
 */
export function beforeSendBrowser(
  opts: SentryConfigOpts,
  event: ErrorEvent,
  hint?: EventHint
) {
  if (sentryEnabled === false) {
    return null;
  }

  if (event.request) {
    if (event.request.url) {
      event.request.url = cleanUpQueryParam(event.request.url);
    }

    if (event.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (event.tags['errno']) {
        event.fingerprint = ['errno' + (event.tags['errno'] as number)];
        // if it is a known error change the error level to info.
        event.level = 'info';
      }
    }

    if (event.exception?.values) {
      event.exception.values.forEach((value: Exception) => {
        if (value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame: { abs_path?: string }) => {
            if (frame.abs_path) {
              frame.abs_path = cleanUpQueryParam(frame.abs_path); // eslint-disable-line camelcase
            }
          });
        }
      });
    }

    if (event.request.headers?.['Referer']) {
      event.request.headers['Referer'] = cleanUpQueryParam(
        event.request.headers['Referer']
      );
    }
  }

  event = tagFxaName(event, opts.sentry?.clientName || opts.sentry?.serverName);
  return event;
}

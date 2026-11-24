import { ErrorEvent, EventHint } from '@sentry/core';
import { SentryConfigOpts, tagFxaName } from '@fxa/shared/sentry-utils';

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

// Locally saved FxA pages (file://) send errors that only clutter Sentry.
function isFromWebPage(event: ErrorEvent) {
  const url = event.request?.url ?? globalThis.location?.href;
  if (!url) {
    return true;
  }
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
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
  if (sentryEnabled === false || !isFromWebPage(event)) {
    return null;
  }

  if (event.request) {
    if (event.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (event.tags['errno']) {
        event.fingerprint = ['errno' + (event.tags['errno'] as number)];
        // if it is a known error change the error level to info.
        event.level = 'info';
      }
    }
  }

  event = tagFxaName(event, opts.sentry?.clientName || opts.sentry?.serverName);
  return event;
}

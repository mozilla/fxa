/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { SentryConfigOpts } from './models/SentryConfigOpts';
import { tagFxaName } from './reporting';
import { buildSentryConfig } from './config-builder';
import { Logger } from './sentry.types';

/**
 * Exception fields that are imported as tags
 */
const EXCEPTION_TAGS = ['code', 'context', 'errno', 'namespace', 'status'];

// Internal flag to keep track of whether or not sentry is initialized
let sentryEnabled = false;

export function captureException(err: Error) {
  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope: Sentry.Scope) => {
    EXCEPTION_TAGS.forEach((tagName) => {
      if (tagName in err) {
        scope.setTag(
          tagName,
          (
            err as {
              [key: string]: any;
            }
          )[tagName]
        );
      }
    });
    _Sentry.captureException(err);
  });
}

export function isEnabled() {
  return sentryEnabled;
}

/**
 * Toggle sentry error capture to be disabled.
 */
export function disable() {
  sentryEnabled = false;
}

/**
 * Toggle sentry error capture to be enabled.
 */
export function enable() {
  sentryEnabled = true;
}

/**
 * Gets called before data gets sent to error metrics. Useful for altering event state before it gets sent to Sentry.
 * For example, we use this to set the event fingerprint based on known error numbers.
 *
 * @param {Object} opts - Sentry configuration options
 * @param {Object} event - Sentry error object data
 * @param {Object} hint - Sentry error object hint data
 * @returns {Object} event - Modified error object data
 */
export function beforeSend(
  opts: SentryConfigOpts,
  event: Sentry.Event,
  _hint?: Sentry.EventHint
) {
  if (sentryEnabled === false) {
    return null;
  }

  if (event.request) {
    if (event.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (event.tags.errno) {
        event.fingerprint = ['errno' + (event.tags.errno as number)];
        // if it is a known error change the error level to info.
        event.level = 'info';
      }
    }
  }

  event = tagFxaName(event, opts.sentry?.clientName || opts.sentry?.serverName);
  return event;
}

export function configure(config: SentryConfigOpts, log?: Logger) {
  if (!log) {
    log = console;
  }

  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided');
    return;
  }

  // We want sentry to be disabled by default... This is because we only emit data
  // for users that 'have opted in'. A subsequent call to 'enable' is needed to ensure
  // that sentry events only flow under the proper circumstances.
  disable();

  const opts = buildSentryConfig(config, log);
  try {
    Sentry.init({
      ...opts,
      beforeSend: function (event: Sentry.ErrorEvent, hint?: Sentry.EventHint) {
        return beforeSend(opts, event, hint);
      },
    });
  } catch (e) {
    log.error(e);
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Change to @sentry/browser after upgrade to Sentry 8
import * as Sentry from '@sentry/nextjs';
import { cleanUpQueryParam } from './cleanUpQueryParam';
import { SentryConfigOpts } from '../models/SentryConfigOpts';
import { tagFxaName } from './tagFxaName';

/**
 * function that gets called before data gets sent to error metrics
 *
 * @param {Object} event
 *  Error object data
 * @returns {Object} data
 *  Modified error object data
 * @private
 */
export function beforeSend(
  sentryEnabled: boolean,
  opts: SentryConfigOpts,
  event: Sentry.ErrorEvent
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
      if (event.tags.errno) {
        event.fingerprint = ['errno' + (event.tags.errno as number)];
        // if it is a known error change the error level to info.
        event.level = 'info';
      }
    }

    if (event.exception?.values) {
      event.exception.values.forEach((value: Sentry.Exception) => {
        if (value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame: { abs_path?: string }) => {
            if (frame.abs_path) {
              frame.abs_path = cleanUpQueryParam(frame.abs_path); // eslint-disable-line camelcase
            }
          });
        }
      });
    }

    if (event.request.headers?.Referer) {
      event.request.headers.Referer = cleanUpQueryParam(
        event.request.headers.Referer
      );
    }
  }

  event = tagFxaName(event, opts.sentry?.clientName || opts.sentry?.serverName);
  return event;
}

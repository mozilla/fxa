/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import Logger from './logger';

// HACK: allow tests to stub this function from Sentry
// https://stackoverflow.com/questions/35240469/how-to-mock-the-imports-of-an-es6-module
export const _Sentry = {
  captureException: Sentry.captureException,
};

const ALLOWED_QUERY_PARAMETERS = [
  'automatedBrowser',
  'client_id',
  'context',
  'entrypoint',
  'keys',
  'migration',
  'redirect_uri',
  'scope',
  'service',
  'setting',
  'style',
];

/**
 * function that gets called before data gets sent to error metrics
 *
 * @param {Object} data
 *  Error object data
 * @returns {Object} data
 *  Modified error object data
 * @private
 */
function beforeSend(data: Sentry.Event): Sentry.Event {
  if (data.request) {
    if (data.request.url) {
      data.request.url = cleanUpQueryParam(data.request.url);
    }

    if (data.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (data.tags.errno) {
        data.fingerprint = ['errno' + data.tags.errno];
        // if it is a known error change the error level to info.
        data.level = Sentry.Severity.Info;
      }
    }

    if (data.exception?.values) {
      data.exception.values.forEach((value: Sentry.Exception) => {
        if (value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame: { abs_path?: string }) => {
            if (frame.abs_path) {
              frame.abs_path = cleanUpQueryParam(frame.abs_path); // eslint-disable-line camelcase
            }
          });
        }
      });
    }

    if (data.request.headers?.Referer) {
      data.request.headers.Referer = cleanUpQueryParam(
        data.request.headers.Referer
      );
    }
  }

  return data;
}

/**
 * Overwrites sensitive query parameters with a dummy value.
 *
 * @param {String} url
 * @returns {String} url
 * @private
 */
function cleanUpQueryParam(url = '') {
  const urlObj = new URL(url);

  if (!urlObj.search.length) {
    return url;
  }

  // Iterate the search parameters.
  urlObj.searchParams.forEach((_, key) => {
    if (!ALLOWED_QUERY_PARAMETERS.includes(key)) {
      // if the param is a PII (not allowed) then reset the value.
      urlObj.searchParams.set(key, 'VALUE');
    }
  });

  return urlObj.href;
}

/**
 * Exception fields that are imported as tags
 */
const exceptionTags = ['code', 'context', 'errno', 'namespace', 'status'];

interface SentryMetrics {
  _logger: Logger;
  configure: (arg0: string, arg1?: string) => void;
  captureException: (arg0: Error) => void;
  __beforeSend: (arg0: Sentry.Event) => Sentry.Event;
  __cleanUpQueryParam: (arg0: string) => string;
}

/**
 * Creates a SentryMetrics singleton object that starts up Sentry/browser.
 *
 * This must be configured with the `configure` method before use.
 *
 * Read more at https://docs.sentry.io/platforms/javascript
 *
 * @constructor
 */
const SentryMetrics = (function (this: SentryMetrics) {
  this._logger = new Logger();
} as any) as new () => SentryMetrics;

SentryMetrics.prototype = {
  /**
   * Configure the SentryMetrics instance for this singleton.
   *
   * @param {String} dsn
   * @param {String} [release] - settings release version
   */
  configure(dsn: string, release: string) {
    this._logger.info('release: ' + release);
    this._release = release;
    if (!dsn) {
      this._logger.error('No Sentry dsn provided');
      return;
    }

    try {
      Sentry.init({
        release,
        dsn,
        beforeSend,
      });
    } catch (e) {
      this._logger.error(e);
    }
  },
  /**
   * Capture an exception. Error fields listed in exceptionTags
   * will be added as tags to the sentry data.
   *
   * @param {Error} err
   */
  captureException(err: Error) {
    Sentry.withScope((scope: Sentry.Scope) => {
      exceptionTags.forEach((tagName) => {
        if (tagName in err) {
          scope.setTag(
            tagName,
            (err as {
              [key: string]: any;
            })[tagName]
          );
        }
      });
      _Sentry.captureException(err);
    });
  },

  // Private functions, exposed for testing
  __beforeSend: beforeSend,
  __cleanUpQueryParam: cleanUpQueryParam,
};

const sentryMetrics = new SentryMetrics();

export default sentryMetrics;

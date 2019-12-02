/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Logger from './logger';
import * as Sentry from '@sentry/browser';

var ALLOWED_QUERY_PARAMETERS = [
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
function beforeSend(data) {
  if (data && data.request) {
    if (data.request.url) {
      data.request.url = cleanUpQueryParam(data.request.url);
    }

    if (data.tags) {
      // if this is a known errno, then use grouping with fingerprints
      // Docs: https://docs.sentry.io/hosted/learn/rollups/#fallback-grouping
      if (data.tags.errno) {
        data.fingerprint = ['errno' + data.tags.errno];
        // if it is a known error change the error level to info.
        data.level = 'info';
      }
    }

    if (data.exception && data.exception.values) {
      data.exception.values.forEach((value) => {
        if(value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame) => {
            if (frame.abs_path) {
              frame.abs_path = cleanUpQueryParam(frame.abs_path); // eslint-disable-line camelcase
            }
          });
        }
      });
    }

    if (data.request.headers && data.request.headers.Referer) {
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
  for (const p of urlObj.searchParams) {
    const key = p[0];
    if (!ALLOWED_QUERY_PARAMETERS.includes(key)) {
      // if the param is a PII (not allowed) then reset the value.
      urlObj.searchParams.set(key, "VALUE");
    }
  }

  return urlObj.href;
}

/**
 * Exception fields that are imported as tags
 */
const exceptionTags = ['code', 'context', 'errno', 'namespace', 'status'];

/**
 * Creates a SentryMetrics object that starts up Sentry/browser
 *
 * Read more at https://docs.sentry.io/platforms/javascript
 *
 * @param {String} dsn
 * @param {String} [release] - content server release version
 * @constructor
 */
function SentryMetrics(dsn, release) {
  this._logger = new Logger();
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
}

SentryMetrics.prototype = {
  /**
   * Capture an exception. Error fields listed in exceptionTags
   * will be added as tags to the sentry data.
   *
   * @param {Error} err
   */
  captureException(err) {
    Sentry.withScope(function(scope) {
      exceptionTags.forEach(function(tagName) {
        if (tagName in err) {
          scope.setTag(tagName, err[tagName]);
        }
      });
      Sentry.captureException(err);
    });
  },

  // Private functions, exposed for testing
  __beforeSend: beforeSend,
  __cleanUpQueryParam: cleanUpQueryParam,
};

export default SentryMetrics;

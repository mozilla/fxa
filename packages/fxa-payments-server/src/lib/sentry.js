/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Logger from './logger';
import * as Sentry from '@sentry/browser';

import {
  tagFxaName,
  tagCriticalEvent,
  buildSentryConfig,
} from 'fxa-shared/sentry';

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
        if (value.stacktrace && value.stacktrace.frames) {
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
      urlObj.searchParams.set(key, 'VALUE');
    }
  }

  return urlObj.href;
}

/**
 * Exception fields that are imported as tags
 */
const exceptionTags = ['code', 'context', 'errno', 'namespace', 'status'];

/**
 * Creates a SentryMetrics singleton object that starts up Sentry/browser.
 *
 * This must be configured with the `configure` method before use.
 *
 * Read more at https://docs.sentry.io/platforms/javascript
 *
 * @constructor
 */
function SentryMetrics() {
  this._logger = new Logger();
}

SentryMetrics.prototype = {
  /**
   * Configure the SentryMetrics instance for this singleton.
   *
   * @param {SentryClientConfigOpts} config
   */
  configure(config) {
    if (!config) {
      this._logger.error('No config provided.');
      return;
    }
    this._logger.info('release: ' + config.release);
    this._release = config.release;

    if (!config.sentry || !config.sentry.dsn) {
      this._logger.error('No Sentry dsn provided');
      return;
    }

    try {
      const opts = buildSentryConfig(config, this._logger);

      Sentry.init({
        ...opts,
        beforeSend(event) {
          event = tagCriticalEvent(event);
          event = tagFxaName(event, opts.clientName);
          return event;
        },
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
  captureException(err) {
    Sentry.withScope(function (scope) {
      exceptionTags.forEach(function (tagName) {
        if (tagName in err) {
          scope.setTag(tagName, err[tagName]);
        }
      });
      Sentry.captureException(err);
    });
  },

  /**
   * Capture message to report to sentry.
   *
   * @param {*} message Passed to Sentry.captureMessage
   * @param {*} contextKey Sentry.setContext key
   * @param {*} context Sentry.setContext context object
   * @param {*} severity Enum passed to Sentry.captureMessage to set severity level
   */
  captureMessage(message, contextKey, context, severity) {
    Sentry.withScope(function (scope) {
      scope.setContext(contextKey, context);
      Sentry.captureMessage(message, severity);
    });
  },

  // Private functions, exposed for testing
  __beforeSend: beforeSend,
  __cleanUpQueryParam: cleanUpQueryParam,
};

const sentryMetrics = new SentryMetrics();

export default sentryMetrics;

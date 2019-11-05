/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Logger from './logger';
import Raven from 'raven';
import Url from './url';

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

// last error that Sentry sent
// stored in the global state due to
// callback options and multiple Sentry interfaces
var SAME_ERROR_LIMIT = 10;
var SAME_ERROR_ATTEMPTS = 0;
var PREVIOUS_ERROR = null;

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
      _.each(data.exception.values, function(value) {
        if (value.stacktrace && value.stacktrace.frames) {
          _.each(value.stacktrace.frames, function(frame) {
            if (frame.abs_path) {
              // clean up query parameters in absolute paths
              frame.abs_path = cleanUpQueryParam(frame.abs_path); //eslint-disable-line camelcase
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
 * Determines if the error message should be sent
 * Source: github.com/getsentry/raven-js/blob/0184ca3bc7624be0fb0b093d9a96becc424bc9b5/src/raven.js
 *
 * @param {Object} data Error message data
 * @returns {Boolean} true if message should be sent.
 */
function shouldSendCallback(data) {
  if (data && data.message) {
    var sameError = data.message === PREVIOUS_ERROR;
    if (sameError) {
      SAME_ERROR_ATTEMPTS++;
    } else {
      SAME_ERROR_ATTEMPTS = 0;
    }
    if (SAME_ERROR_LIMIT === SAME_ERROR_ATTEMPTS) {
      return false;
    }
    PREVIOUS_ERROR = data.message;
    return true;
  }

  return true;
}

/**
 * Overwrites sensitive query parameters with a dummy value.
 *
 * @param {String} url
 * @returns {String} url
 * @private
 */
function cleanUpQueryParam(url = '') {
  var startOfParams = url.indexOf('?');
  var newUrl = url;
  var params;

  if (startOfParams === -1) {
    return newUrl;
  }

  params = Url.searchParams(url.substring(startOfParams + 1));
  newUrl = url.substring(0, startOfParams);

  if (_.isObject(params)) {
    Object.keys(params).forEach(function(key) {
      // if the param is a PII (not allowed) then reset the value.
      if (! _.contains(ALLOWED_QUERY_PARAMETERS, key)) {
        params[key] = 'VALUE';
      }
    });

    newUrl += Url.objToSearchString(params);
  }

  return newUrl;
}

/**
 * Creates a SentryMetrics object that starts up Raven.js
 *
 * Read more at https://github.com/getsentry/raven-js
 *
 * @param {String} host
 * @param {String} [release] - content server release version
 * @constructor
 */
function SentryMetrics(host, release) {
  this._logger = new Logger();
  this._release = release;

  if (host) {
    // use __API_KEY__ instead of the real API key because raven.js requires it
    // we can configure the real API key on the server using our local endpoint instead.
    // See issue https://github.com/getsentry/raven-js/issues/346 for more information

    this._endpoint = '//__API_KEY__@' + host + '/metrics-errors';
  } else {
    this._logger.error('No Sentry host provided');
    return;
  }

  try {
    Raven.config(this._endpoint, this._ravenOpts).install();
    Raven.debug = false;
  } catch (e) {
    Raven.uninstall();
    this._logger.error(e);
  }
}

SentryMetrics.prototype = {
  /**
   * Specialized raven.js endpoint string
   *
   * See https://raven-js.readthedocs.org/en/latest/config/index.html#configuration
   */
  _endpoint: null,
  /**
   * raven.js settings
   *
   * See https://raven-js.readthedocs.org/en/latest/config/index.html#optional-settings
   */
  _ravenOpts: {
    dataCallback: beforeSend,
    shouldSendCallback: shouldSendCallback,
  },

  /**
   * Exception fields that are imported as tags
   */
  _exceptionTags: ['code', 'context', 'errno', 'namespace', 'status'],

  /**
   * Capture an exception. Error fields listed in _exceptionTags
   * will be added as tags to the raven data.
   *
   * @param {Error} err
   */
  captureException(err) {
    var tags = {};

    this._exceptionTags.forEach(function(tagName) {
      if (tagName in err) {
        tags[tagName] = err[tagName];
      }
    });

    var extraContext = {
      tags: tags,
    };

    if (this._release) {
      // add release version if available
      extraContext.release = this._release;
    }

    Raven.captureException(err, extraContext);
  },

  /**
   * Disable error metrics with raven.js
   *
   * window.onerror reverted back to normal, TraceKit disabled
   */
  remove() {
    Raven.uninstall();
  },
  // Private functions, exposed for testing
  __beforeSend: beforeSend,
  __cleanUpQueryParam: cleanUpQueryParam,
  __shouldSendCallback: shouldSendCallback,
};

export default SentryMetrics;

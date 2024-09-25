/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as Sentry from '@sentry/browser';

import {
  buildSentryConfig,
  tagCriticalEvent,
  tagFxaName,
} from 'fxa-shared/sentry';
import _ from 'underscore';

import Logger from './logger';
import Url from './url';

var ALLOWED_QUERY_PARAMETERS = [
  'automatedBrowser',
  'client_id',
  'context',
  'entrypoint',
  'keys',
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
  data = tagCriticalEvent(data);
  if (data && data.request) {
    if (data.request.url) {
      data.request.url = cleanUpQueryParam(data.request.url);
    }

    if (data.tags) {
      const errno = data.tags.errno;
      if (errno && _.isNumber(errno)) {
        // if the 'errno' is a Number, then it is a known error.
        // In the future this could log the errors into StatsD or somewhere else.
        // See https://github.com/mozilla/fxa/issues/2298 for details.
        return null;
      }
    }

    if (data.exception && data.exception.values) {
      _.each(data.exception.values, function (value) {
        if (value.stacktrace && value.stacktrace.frames) {
          _.each(value.stacktrace.frames, function (frame) {
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
    Object.keys(params).forEach(function (key) {
      // if the param is a PII (not allowed) then reset the value.
      if (!_.contains(ALLOWED_QUERY_PARAMETERS, key)) {
        params[key] = 'VALUE';
      }
    });

    newUrl += Url.objToSearchString(params);
  }

  return newUrl;
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
 * @param {SentryClientConfigOpts} config - a configuration object for sentry
 * @constructor
 */
function SentryMetrics(config) {
  this._logger = new Logger();
  this._release = config?.release;

  if (!config?.sentry?.dsn) {
    this._logger.error('No Sentry dsn provided');
    return;
  }

  try {
    const opts = buildSentryConfig(config, this._logger);
    Sentry.init({
      ...opts,
      beforeSend(event) {
        event = tagFxaName(event, opts.clientName);
        event = beforeSend(event);
        return event;
      },
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
    Sentry.withScope(function (scope) {
      exceptionTags.forEach(function (tagName) {
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

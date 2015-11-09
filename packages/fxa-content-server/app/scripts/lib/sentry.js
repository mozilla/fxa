/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Raven = require('raven');
  var Url = require('lib/url');

  var ALLOWED_QUERY_PARAMETERS = [
    'automatedBrowser',
    'campaign',
    'client_id',
    'context',
    'customizeSync',
    'entrypoint',
    'keys',
    'migration',
    'redirect_uri',
    'scope',
    'service',
    'setting',
    'style',
    'verification_redirect'
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
      if (data.request.headers && data.request.headers.Referer) {
        data.request.headers.Referer = cleanUpQueryParam(data.request.headers.Referer);
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
  function cleanUpQueryParam(url) {
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
   * @constructor
   */
  function SentryMetrics (host) {
    if (host) {
      // use __API_KEY__ instead of the real API key because raven.js requires it
      // we can configure the real API key on the server using our local endpoint instead.
      // See issue https://github.com/getsentry/raven-js/issues/346 for more information

      this._endpoint = '//__API_KEY__@' + host + '/metrics-errors';
    } else {
      console.error('No Sentry host provided');
      return;
    }

    try {
      Raven.config(this._endpoint, this._ravenOpts).install();
      Raven.debug = false;
    } catch (e) {
      Raven.uninstall();
      console.error(e);
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
      dataCallback: beforeSend
    },

    /**
     * Exception fields that are imported as tags
     */
    _exceptionTags: [
      'code',
      'errno',
      'namespace',
      'status'
    ],

    /**
     * Capture an exception. Error fields listed in _exceptionTags
     * will be added as tags to the raven data.
     */
    captureException: function (err) {
      var tags = {};

      this._exceptionTags.forEach(function (tagName) {
        if (tagName in err) {
          tags[tagName] = err[tagName];
        }
      });

      var extraContext = {
        tags: tags
      };

      Raven.captureException(err, extraContext);
    },

    /**
     * Disable error metrics with raven.js
     *
     * window.onerror reverted back to normal, TraceKit disabled
     */
    remove: function () {
      Raven.uninstall();
    },
    // Private functions, exposed for testing
    __beforeSend: beforeSend,
    __cleanUpQueryParam: cleanUpQueryParam
  };

  module.exports = SentryMetrics;
});


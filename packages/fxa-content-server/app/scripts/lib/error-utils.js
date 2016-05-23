/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Error handling utilities
 */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var Constants = require('lib/constants');
  var Logger = require('lib/logger');
  var OAuthErrors = require('lib/oauth-errors');
  var p = require('lib/promise');
  var Url = require('lib/url');

  var ERROR_REDIRECT_TIMEOUT_MS = Constants.ERROR_REDIRECT_TIMEOUT_MS;

  module.exports = {
    ERROR_REDIRECT_TIMEOUT_MS: ERROR_REDIRECT_TIMEOUT_MS,

    /**
     * Get the URL of the error page to which an error should redirect.
     *
     * @param {Error} error - error for which to get error page URL
     * @param {Object} translator - translator to translate error
     * @returns {String}
     */
    getErrorPageUrl: function (error, translator) {
      if (AuthErrors.is(error, 'INVALID_PARAMETER') ||
          AuthErrors.is(error, 'MISSING_PARAMETER') ||
          OAuthErrors.is(error, 'INVALID_PARAMETER') ||
          OAuthErrors.is(error, 'MISSING_PARAMETER') ||
          OAuthErrors.is(error, 'UNKNOWN_CLIENT')) {
        var queryString = Url.objToSearchString({
          client_id: error.client_id, //eslint-disable-line camelcase
          context: error.context,
          errno: error.errno,
          message: error.errorModule.toInterpolatedMessage(error, translator),
          namespace: error.namespace,
          param: error.param
        });

        return Constants.BAD_REQUEST_PAGE + queryString;
      }

      return Constants.INTERNAL_ERROR_PAGE;
    },

    /**
     * Report an error to metrics. No metrics report is sent.
     *
     * @param {Error} error
     * @param {Object} sentryMetrics
     * @param {Object} metrics
     * @param {Object} window
     */
    captureError: function (error, sentryMetrics, metrics, win) {
      var logger = new Logger(win);
      logger.error(error);

      // Ensure the message is interpolated before sending to
      // sentry and metrics.
      error.message = this.getErrorMessage(error);
      sentryMetrics.captureException(error);

      if (metrics) {
        metrics.logError(error);
      }
    },

    /**
     * Report an error to metrics. Send metrics report.
     *
     * @param {Error} error
     * @param {Object} sentryMetrics
     * @param {Object} metrics
     * @param {Object} window
     * @returns {promise};
     */
    captureAndFlushError: function (error, sentryMetrics, metrics, win) {
      this.captureError(error, sentryMetrics, metrics, win);
      return p().then(function () {
        if (metrics) {
          return metrics.flush();
        }
      });
    },

    /**
     * Handle a fatal error. Logs and reports the error, then redirects
     * to the appropriate error page.
     *
     * @param {Error} error
     * @param {Object} sentryMetrics
     * @param {Object} metrics
     * @param {Object} window
     * @param {Object} translator
     * @returns {promise}
     */
    fatalError: function (error, sentryMetrics, metrics, win, translator) {
      var self = this;

      return self.captureAndFlushError(error, sentryMetrics, metrics, win)
        // give a bit of time to flush the Sentry error logs,
        // otherwise Safari Mobile redirects too quickly.
        .delay(self.ERROR_REDIRECT_TIMEOUT_MS)
        .then(function () {
          var errorPageUrl = self.getErrorPageUrl(error, translator);
          win.location.href = errorPageUrl;
        });
    },

    /**
     * Get the error message, performing any interpolation.
     *
     * @param {string} err - an error object
     * @return {string} interpolated error text.
     */
    getErrorMessage: function (error) {
      if (error && error.errorModule) {
        return error.errorModule.toInterpolatedMessage(error);
      }

      return error.message;
    }
  };
});

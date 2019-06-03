/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Error handling utilities
 */

import AuthErrors from './auth-errors';
import domWriter from './dom-writer';
import FiveHundredTemplate from 'templates/500.mustache';
import FourHundredTemplate from 'templates/400.mustache';
import Logger from './logger';
import OAuthErrors from './oauth-errors';

export default {
  /**
   * Get the URL of the error page to which an error should redirect.
   *
   * @param {Error} error - error for which to get error page URL
   * @returns {String}
   */
  getErrorPageTemplate (error) {
    if (AuthErrors.is(error, 'INVALID_PARAMETER') ||
        AuthErrors.is(error, 'MISSING_PARAMETER') ||
        AuthErrors.is(error, 'USER_CANCELED_LOGIN') ||
        OAuthErrors.is(error, 'INCORRECT_REDIRECT') ||
        OAuthErrors.is(error, 'INVALID_PARAMETER') ||
        OAuthErrors.is(error, 'INVALID_PAIRING_CLIENT') ||
        OAuthErrors.is(error, 'MISSING_PARAMETER') ||
        OAuthErrors.is(error, 'UNKNOWN_CLIENT')) {
      return FourHundredTemplate;
    }

    return FiveHundredTemplate;
  },

  /**
   * Report an error to metrics. No metrics report is sent.
   *
   * @param {Error} error
   * @param {Object} sentryMetrics
   * @param {Object} metrics
   * @param {Object} win
   */
  captureError (error, sentryMetrics, metrics, win) {
    var logger = new Logger(win);
    logger.error(error);

    // Ensure the message is interpolated before sending to
    // sentry and metrics.
    try {
      // some errors do not allow reassigning a read-only message property
      error.message = this.getErrorMessage(error);
    } catch (e) {
      // unable to change error message.
    }

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
   * @param {Object} win
   * @returns {Promise};
   */
  captureAndFlushError (error, sentryMetrics, metrics, win) {
    this.captureError(error, sentryMetrics, metrics, win);
    return Promise.resolve().then(function () {
      if (metrics) {
        return metrics.flush();
      }
    });
  },

  /**
   * Render an error to the DOM
   *
   * @param {Error} error
   * @param {Object} win
   * @param {Object} translator
   */
  renderError (error, win, translator) {
    var errorPageTemplate = this.getErrorPageTemplate(error);
    var errorMessage = this.getErrorMessage(error, translator);
    var errorHtml = errorPageTemplate({
      message: errorMessage,
      t: getTranslationHelper(translator)
    });

    domWriter.write(win, errorHtml);
  },

  /**
   * Handle a fatal error. Logs and reports the error, then redirects
   * to the appropriate error page.
   *
   * @param {Error} error
   * @param {Object} sentryMetrics
   * @param {Object} metrics
   * @param {Object} win
   * @param {Object} translator
   * @returns {Promise}
   */
  fatalError (error, sentryMetrics, metrics, win, translator) {
    return Promise.all([
      this.captureAndFlushError(error, sentryMetrics, metrics, win),
      this.renderError(error, win, translator)
    ]);
  },

  /**
   * Get the error message, performing any interpolation. If a translator
   * is passed, return value will be translated to the user's locale.
   *
   * @param {String} error - an error object
   * @param {Object} [translator] - translator to translate error
   * @return {String} interpolated error text.
   */
  getErrorMessage (error, translator) {
    if (error && error.errorModule) {
      return error.errorModule.toInterpolatedMessage(error, translator);
    }

    return error.message;
  }
};

function getTranslationHelper(translator) {
  // Use the translator's helper if available, if the translator
  // is not available (the app could error before the translator is
  // created), then create a standin.
  if (translator) {
    return translator.translateInTemplate.bind(translator);
  }

  // create the standin helper.
  return function () {
    return function (msg) {
      return msg;
    };
  };
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global window */
/**
 * Logging module that performs proper checks and string
 * interpolation before logging message.
 *
 */

/**
 * Constructor of log module.
 *
 * @param {Object} logWindow Window object that contains console used for logging.
 *
 * @constructor
 */
function Logger(logWindow) {
  this._window = logWindow || window;
}

Logger.prototype = {
  /**
   * Wrapper for `console.info` function that checks for availability and
   * then prints info.
   *
   */
  info() {
    if (this._window.console && this._window.console.info) {
      this._window.console.info.apply(this._window.console, arguments);
    }
  },

  /**
   * Wrapper for `console.trace` function that checks for availability and then prints
   * trace.
   *
   */
  trace() {
    if (this._window.console && this._window.console.trace) {
      this._window.console.trace();
    }
  },

  /**
   * Wrapper for `console.warn` function that checks for availability and
   * then prints warn.
   *
   */
  warn() {
    if (this._window.console && this._window.console.warn) {
      this._window.console.warn.apply(this._window.console, arguments);
    }
  },

  /**
   * Wrapper for `console.error` function that checks for availability and interpolates
   * error messages if a translation exists.
   *
   * @param {Error} error Error object with optional errorModule.
   */
  error(error) {
    if (this._window.console && this._window.console.error) {
      var errorMessage = '';

      // If error module is present, attempt to interpolate string, else use error object message
      if (error.errorModule) {
        errorMessage = error.errorModule.toInterpolatedMessage(error);
        this._window.console.error(errorMessage);
      } else {
        // Use regular console.error
        this._window.console.error.apply(this._window.console, arguments);
      }
    }
  },
};

export default Logger;

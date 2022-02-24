/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Logging module that performs proper checks and string
 * interpolation before logging message.
 *
 */

interface Logger {
  _window: Window;
  info: (...args: any) => void;
  trace: (...args: any) => void;
  warn: (...args: any) => void;
  error: (...args: any) => void;
}

interface ModuleError {
  errorModule: {
    toInterpolatedMessage: (arg0: ModuleError) => string;
  };
}

/**
 * Constructor of log module.
 *
 * @param {Object} logWindow Window object that contains console used for logging.
 *
 * @constructor
 */
const Logger = (function (this: Logger, logWindow?: Window) {
  this._window = logWindow || window;
} as any) as new (logWindow?: Window) => Logger;

Logger.prototype = {
  /**
   * Wrapper for `console.info` function that checks for availability and
   * then prints info.
   *
   */
  info() {
    this._window.console?.info?.apply(this._window.console, arguments);
  },

  /**
   * Wrapper for `console.trace` function that checks for availability and then prints
   * trace.
   *
   */
  trace() {
    this._window.console?.trace?.apply(this._window.console, arguments);
  },

  /**
   * Wrapper for `console.warn` function that checks for availability and
   * then prints warn.
   *
   */
  warn() {
    this._window.console?.warn?.apply(this._window.console, arguments);
  },

  /**
   * Wrapper for `console.error` function that checks for availability and interpolates
   * error messages if a translation exists.
   *
   * @param {Error} error Error object with optional errorModule.
   */
  error(error?: ModuleError) {
    if (this._window.console?.error) {
      let errorMessage = '';

      // If error module is present, attempt to interpolate string, else use error object message
      if (error?.errorModule) {
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

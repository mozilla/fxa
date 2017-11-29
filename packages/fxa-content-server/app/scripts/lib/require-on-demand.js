/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Load modules asynchronously using requirejs. Useful to load modules
 * that are not part of the main bundle. Calls to load a module return
 * a promise that resolves once the module is loaded.
 *
 * Usage:
 * requireOnDemand('passwordcheck')
 *   .then(function (PasswordCheck) {
 *      // use PasswordCheck here.
 *   });
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Errors = require('./errors');

  const t = function (msg) {
    return msg;
  };

  const REQUIRE_WAIT_SECONDS = 40;

  /*eslint-disable sorting/sort-object-props*/
  const RODErrors = _.extend({}, Errors, {
    ERRORS: {
      UNEXPECTED_ERROR: {
        errno: 999,
        message: t('Unexpected error')
      },
      TIMEOUT: {
        errno: 1000,
        message: t('Resources failed to load')
      },
      NODEFINE: {
        errno: 1001,
        message: t('Unexpected resource error')
      },
      SCRIPTERROR: {
        errno: 1002,
        message: t('Script error')
      }
    },
    NAMESPACE: 'require-on-demand'
  });
  /*eslint-enable sorting/sort-object-props*/

  /**
   * Require a dependency on demand
   *
   * @param {String} resourceToGet - path or URL of the resource to get.
   * @param {Object} [win] - window object, useful to pass in for testing.
   * Defaults to `window`
   * @returns {Promise}
   */
  function requireOnDemand(resourceToGet, win = window) {
    return new Promise((resolve, reject) => {
      // requirejs takes care of ensuring only one outstanding request
      // per module occurs if multiple requests are concurrently made
      // for the same module.

      // An alias to require is used to prevent almond from bundling
      // the resource into the main bundle. Instead, the item will
      // be loaded on demand, and the module returned when the promise
      // resolves.
      const getNow = win.require;

      // give `waitSeconds` seconds to load a requireOnDemand resource
      getNow.config({
        waitSeconds: REQUIRE_WAIT_SECONDS
      });

      getNow([resourceToGet], resolve,
        function (requireErr) {
          // RequireJS errors described in
          // http://requirejs.org/docs/api.html#errors
          const errorType = requireErr.requireType || 'UNEXPECTED_ERROR';
          const normalizedErrorType = errorType.toUpperCase();
          const err = RODErrors.toError(normalizedErrorType, resourceToGet);
          reject(err);
        });
    });
  }

  requireOnDemand.Errors = RODErrors;

  module.exports = requireOnDemand;
});


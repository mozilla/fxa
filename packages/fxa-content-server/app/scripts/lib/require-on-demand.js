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

  var _ = require('underscore');
  var Errors = require('lib/errors');
  var p = require('lib/promise');

  var t = function (msg) {
    return msg;
  };

  /*eslint-disable sorting/sort-object-props*/
  var RODErrors = _.extend({}, Errors, {
    ERRORS: {
      UNEXPECTED_ERROR: {
        errno: 999,
        message: t('Unexpected error')
      },
      TIMEOUT: {
        errno: 1000,
        message: t('Unexpected error')
      },
      NODEFINE: {
        errno: 1001,
        message: t('Unexpected error')
      },
      SCRIPTERROR: {
        errno: 1002,
        message: t('Unexpected error')
      }
    },
    NAMESPACE: 'require-on-demand'
  });
  /*eslint-enable sorting/sort-object-props*/

  function requireOnDemand(resourceToGet) {
    return p().then(function () {
      var deferred = p.defer();

      // requirejs takes care of ensuring only one outstanding request
      // per module occurs if multiple requests are concurrently made
      // for the same module.

      // An alias to require is used to prevent almond from bundling
      // the resource into the main bundle. Instead, the item will
      // be loaded on demand, and the module returned when the promise
      // resolves.
      var getNow = window.require;
      getNow(['nocache!' + resourceToGet], deferred.resolve.bind(deferred),
        function (requireErr) {
          // RequireJS errors described in
          // http://requirejs.org/docs/api.html#errors
          var errorType = requireErr.requireType || 'UNEXPECTED_ERROR';
          var normalizedErrorType = errorType.toUpperCase();
          var err = RODErrors.toError(normalizedErrorType, resourceToGet);

          deferred.reject(err);
        });

      return deferred.promise;
    });
  }

  requireOnDemand.Errors = RODErrors;

  module.exports = requireOnDemand;
});


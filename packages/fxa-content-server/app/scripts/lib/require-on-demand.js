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

define([
  'lib/promise'
], function (p) {
  'use strict';

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
      getNow([resourceToGet], deferred.resolve.bind(deferred));

      return deferred.promise;
    });
  }

  return requireOnDemand;
});


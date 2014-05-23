/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A null metrics module. For use as a standin if metrics are disabled
 * or for unit tests.
 */

define([
  'underscore',
  'p-promise',
  'lib/metrics'
], function (_, p, Metrics) {
  'use strict';

  function NullMetrics () {
    // do nothing
  }

  _.forEach(_.keys(Metrics.prototype), function(key) {
    NullMetrics.prototype[key] = function () {
      // do nothing
    };
  });

  // Metrics.flush returns a promise.
  NullMetrics.prototype.flush = function () {
    return p();
  };

  return NullMetrics;
});



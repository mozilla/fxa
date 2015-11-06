/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A null metrics module. For use as a standin if metrics are disabled
 * or for unit tests.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var Metrics = require('lib/metrics');
  var p = require('lib/promise');

  function NullMetrics () {
    // do nothing
  }

  _.forEach(_.keys(Metrics.prototype), function (key) {
    NullMetrics.prototype[key] = function () {
      // do nothing
    };
  });

  // Metrics.flush returns a promise.
  NullMetrics.prototype.flush = function () {
    return p();
  };

  NullMetrics.prototype.isCollectionEnabled = function () {
    return false;
  };

  module.exports = NullMetrics;
});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define([
  'chai',
  'lib/null-metrics',
  'lib/metrics'
],
function (chai, NullMetrics, Metrics) {
  'use strict';

  /*global describe, it*/
  var assert = chai.assert;

  describe('lib/null-metrics', function () {
    var nullMetrics;

    beforeEach(function () {
      nullMetrics = new NullMetrics();
    });

    afterEach(function () {
      nullMetrics = null;
    });

    it('has the same function signature as Metrics', function () {
      for (var key in Metrics.prototype) {
        if (typeof Metrics.prototype[key] === 'function') {
          assert.isFunction(nullMetrics[key], key);
        }
      }
    });

    it('flush returns a promise', function () {
      return nullMetrics.flush()
        .then(function () {
          assert.isTrue(true);
        });
    });
  });
});

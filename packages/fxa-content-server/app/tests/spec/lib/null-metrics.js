/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Metrics = require('lib/metrics');
  var NullMetrics = require('lib/null-metrics');

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

    it('reports that real collection is not enabled', function () {
      assert.isFalse(nullMetrics.isCollectionEnabled());
    });
  });
});

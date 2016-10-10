/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A Storage metrics module. For use as a standin when running functional
 * tests
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const Metrics = require('lib/metrics');
  const p = require('lib/promise');
  const Storage = require('lib/storage');

  var storage = Storage.factory('localStorage');

  function StorageMetrics() {
    // do nothing
  }

  _.extend(StorageMetrics.prototype, new Metrics(), {
    _send: function (data) {
      var metrics = storage.get('metrics_all');

      if (! Array.isArray(metrics)) {
        metrics = [];
      }

      metrics.push(data);

      storage.set('metrics_all', metrics);

      return p(data);
    },

    isMetricsCollectionEnabled: function () {
      return false;
    }
  });

  module.exports = StorageMetrics;

});

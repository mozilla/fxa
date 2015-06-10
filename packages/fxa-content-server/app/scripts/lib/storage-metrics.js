/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A Storage metrics module. For use as a standin when running functional
 * tests
 */
'use strict';

define([
  'underscore',
  'lib/promise',
  'lib/metrics',
  'lib/storage'
], function (_, p, Metrics, Storage) {
  var storage = Storage.factory('localStorage');

  function StorageMetrics() {
    // do nothing
  }

  _.extend(StorageMetrics.prototype, new Metrics(), {
    _send: function (data) {
      var metrics = storage.get('metrics_all');

      if (!Array.isArray(metrics)) {
        metrics = [];
      }

      metrics.push(data);

      storage.set('metrics_all', metrics);

      return p(data);
    }
  });

  return StorageMetrics;

});

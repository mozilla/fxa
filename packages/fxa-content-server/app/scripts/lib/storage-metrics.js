/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A Storage metrics module. For use as a standin when running functional
 * tests
 */

import _ from 'underscore';
import Metrics from './metrics';
import Storage from './storage';

var storage = Storage.factory('localStorage');

function StorageMetrics(options) {
  Metrics.call(this, options);
}

_.extend(StorageMetrics.prototype, Metrics.prototype, {
  _send(data) {
    var metrics = storage.get('metrics_all');

    if (! Array.isArray(metrics)) {
      metrics = [];
    }

    metrics.push(data);

    storage.set('metrics_all', metrics);

    return Promise.resolve(data);
  },

  isMetricsCollectionEnabled() {
    return false;
  },
});

export default StorageMetrics;

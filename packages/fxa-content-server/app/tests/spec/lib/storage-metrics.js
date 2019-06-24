/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

import { assert } from 'chai';
import Metrics from 'lib/metrics';
import Storage from 'lib/storage';
import StorageMetrics from 'lib/storage-metrics';
import WindowMock from '../../mocks/window';

describe('lib/storage-metrics', function() {
  var storageMetrics;
  var windowMock;
  var storage = Storage.factory('localStorage');

  beforeEach(function() {
    windowMock = new WindowMock();

    storageMetrics = new StorageMetrics({
      brokerType: 'fx-desktop',
      clientHeight: 966,
      clientWidth: 1033,
      context: 'fx_desktop_v3',
      devicePixelRatio: 2,
      entrypoint: 'menupanel',
      lang: 'db_LB',
      screenHeight: 1200,
      screenWidth: 1600,
      service: 'sync',
      window: windowMock,
    });
  });

  afterEach(function() {
    //storageMetrics.destroy();
    storageMetrics = null;
  });

  it('has the same function signature as Metrics', function() {
    for (var key in Metrics.prototype) {
      if (typeof Metrics.prototype[key] === 'function') {
        assert.isFunction(storageMetrics[key], key);
      }
    }
  });

  it('flush writes to localStorage instead of making a xhr request', function() {
    var filteredData;

    function compareLastData() {
      var storedData = storage.get('metrics_all');
      storedData = storedData[storedData.length - 1];

      // These properties are affected by timing, for example:
      // `duration` fields are different if the above `getFilteredData`
      // is called in a different millisecond than the one used to
      // generate data that is sent to the server.
      // Ensure `duration` is in the results, but do not compare the two.
      ['duration', 'flushTime'].forEach(function(prop) {
        assert.isTrue(storedData.hasOwnProperty(prop));
        delete filteredData[prop];
        delete storedData[prop];
      });

      assert.deepEqual(filteredData, storedData);
    }

    storageMetrics.logEvent('event1');
    storageMetrics.logEvent('event2');
    filteredData = storageMetrics.getFilteredData();
    return storageMetrics
      .flush()
      .then(function() {
        compareLastData();
        storageMetrics.logEvent('event3');
        filteredData = storageMetrics.getFilteredData();
        return storageMetrics.flush();
      })
      .then(function() {
        compareLastData();
      });
  });

  it('reports that real collection is not enabled', function() {
    assert.isFalse(storageMetrics.isCollectionEnabled());
  });
});

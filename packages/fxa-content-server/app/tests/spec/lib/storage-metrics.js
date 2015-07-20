/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define([
  'chai',
  'lib/storage-metrics',
  'lib/metrics',
  'lib/storage',
  '../../mocks/window'
],
function (chai, StorageMetrics, Metrics, Storage, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('lib/storage-metrics', function () {
    var storageMetrics;
    var windowMock;
    var storage = Storage.factory('localStorage');

    beforeEach(function () {
      windowMock = new WindowMock();

      storageMetrics = new StorageMetrics({
        window: windowMock,
        lang: 'db_LB',
        service: 'sync',
        context: 'fx_desktop_v1',
        brokerType: 'fx-desktop',
        entrypoint: 'menupanel',
        migration: 'sync1.5',
        campaign: 'fennec',
        devicePixelRatio: 2,
        clientWidth: 1033,
        clientHeight: 966,
        screenWidth: 1600,
        screenHeight: 1200
      });
      storageMetrics.init();
    });

    afterEach(function () {
      //storageMetrics.destroy();
      storageMetrics = null;
    });

    it('has the same function signature as Metrics', function () {
      for (var key in Metrics.prototype) {
        if (typeof Metrics.prototype[key] === 'function') {
          assert.isFunction(storageMetrics[key], key);
        }
      }
    });

    it('flush writes to localStorage instead of making a xhr request', function () {

      var filteredData;

      function compareLastData () {
        var storedData = storage.get('metrics_all');
        storedData = storedData[storedData.length - 1];

        // `duration` fields are different if the above `getFilteredData`
        // is called in a different millisecond than the one used to
        // generate data that is sent to the server.
        // Ensure `duration` is in the results, but do not compare the two.
        assert.isTrue(storedData.hasOwnProperty('duration'));

        delete filteredData.duration;
        delete storedData.duration;

        assert.deepEqual(filteredData, storedData);
      }

      storageMetrics.logEvent('event1');
      storageMetrics.logEvent('event2');
      filteredData = storageMetrics.getFilteredData();
      return storageMetrics.flush()
        .then(function () {
          compareLastData();
          storageMetrics.logEvent('event3');
          filteredData = storageMetrics.getFilteredData();
          return storageMetrics.flush();
        })
        .then(function () {
          compareLastData();
        });
    });

    it('reports that real collection is not enabled', function () {
      assert.isFalse(storageMetrics.isCollectionEnabled());
    });
  });
});

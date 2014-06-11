/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/metrics-collector-stderr'
], function (registerSuite, assert, StdErrCollector) {
  'use strict';

  var und;

  var suite = {
    name: 'metrics-collector-stderr'
  };

  var metricsCollector = new StdErrCollector();

  suite['writes formatted data to stderr'] = function () {
    var dfd = this.async(1000);

    var _origWrite = process.stderr.write;
    process.stderr.write = dfd.callback(function (chunk) {
      process.stderr.write = _origWrite;
      var loggedMetrics = JSON.parse(String(chunk));

      assert.equal(loggedMetrics.op, 'client.metrics');
      assert.equal(loggedMetrics.duration, 1234);
      assert.equal(loggedMetrics['nt.included'], 0);
      assert.isUndefined(loggedMetrics['nt.notIncludedUndefined']);
      assert.isUndefined(loggedMetrics['nt.notIncludedNull']);
      assert.equal(loggedMetrics['event[0].firstEvent'], 1235);
      assert.equal(loggedMetrics['event[1].secondEvent'], 3512);

    });

    metricsCollector.write({
      navigationTiming: {
        included: 0,
        notIncludedUndefined: und,
        notIncludedNull: null
      },
      events: [
        {
          type: 'firstEvent',
          offset: 1235
        }, {
          type: 'secondEvent',
          offset: 3512
        }
      ],
      duration: 1234
    });
  };

  registerSuite(suite);
});

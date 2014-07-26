/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (intern, registerSuite, assert, config, request) {
  'use strict';

  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var asyncTimeout = 5000;

  // IMHO, metrics should be enabled in dev too.
  var metricsSampleRate = intern.config.fxaProduction ? 0.1 : config.get('metrics.sample_rate');

  var suite = {
    name: 'metrics'
  };

  suite['#get /config returns a `metricsSampleRate`'] = function () {
    var dfd = this.async(asyncTimeout);

    request(serverUrl + '/config',
    dfd.callback(function (err, res) {
      var results = JSON.parse(res.body);

      assert.equal(results.metricsSampleRate, metricsSampleRate);
    }, dfd.reject.bind(dfd)));
  };

  suite['#post /metrics - returns 200, all the time'] = function () {
    var dfd = this.async(asyncTimeout);

    request.post(serverUrl + '/metrics', {
      data: {
        events: [ { type: 'event1', offset: 1 } ]
      }
    },
    dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});

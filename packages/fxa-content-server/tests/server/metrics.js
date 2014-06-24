/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (registerSuite, assert, config, request) {
  'use strict';

  var serverUrl = config.get('public_url');

  var suite = {
    name: 'metrics'
  };

  suite['#get /config returns a `metricsSampleRate`'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/config',
    dfd.callback(function (err, res) {
      var results = JSON.parse(res.body);

      assert.equal(results.metricsSampleRate, config.get('metrics.sample_rate'));
    }, dfd.reject.bind(dfd)));
  };

  suite['#post /metrics - returns 200, all the time'] = function () {
    var dfd = this.async(1000);

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

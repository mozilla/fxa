/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!got'
], function (intern, registerSuite, assert, config, got) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'metrics'
  };

  suite['#post /metrics - returns 200'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.post(serverUrl + '/metrics', {
      data: {
        events: [{
          offset: 1,
          type: 'event1'
        }]
      }
    }).then(function (res) {
      assert.equal(res.statusCode, 200);
    }).then(dfd.resolve, dfd.reject);
  };

  suite['#post /metrics - returns 200 if Content-Type is text/plain'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.post(serverUrl + '/metrics', {
      data: '',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      }
    }).then(function (res) {
      assert.equal(res.statusCode, 200);
    }).then(dfd.resolve, dfd.reject);
  };

  registerSuite(suite);
});

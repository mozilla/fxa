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
    name: 'ver.json'
  };

  suite['#get ver.json'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/ver.json', dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

      var body = JSON.parse(res.body);
      assert.ok('version' in body);
      assert.ok('commit' in body);
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});

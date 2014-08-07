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

  var suite = {
    name: 'cookies disabled'
  };

  suite['#get /config without cookies returns `cookiesEnabled=false`'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/config', {
      headers: {
        'Cookie': ''
      }
    },
    dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

      var results = JSON.parse(res.body);

      assert.equal(results.cookiesEnabled, false);
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /config with cookies returns `cookiesEnabled=true`'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/config', {
      headers: {
        'Cookie': '__cookie_check=1; path=/config;'
      }
    },
    dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

      var results = JSON.parse(res.body);
      assert.equal(results.cookiesEnabled, true);
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);

});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request',
  'tests/lib/helpers'
], function (registerSuite, assert, config, request, TestHelpers) {
  'use strict';

  var httpsUrl = config.get('public_url');

  var suite = {
    name: 'auth & oauth server proxy'
  };

  suite['#auth server proxied GET request'] = function () {
    var dfd = this.async(1000);

    var route = '/';

    request(httpsUrl + route, {
      method: 'GET'
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
    }, dfd.reject.bind(dfd)));
  };

  suite['#auth server proxied POST request'] = function () {
    var dfd = this.async(1000);

    var route = '/auth/v0/expect-gone';

    request(httpsUrl + route, {
      method: 'POST'
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 410);
    }, dfd.reject.bind(dfd)));
  };

  /*
  suite['#oauth server proxied GET request'] = function () {
    var dfd = this.async(1000);

    var route = '/oauth/ver.txt';

    request(httpsUrl + route, {
      method: 'GET'
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
    }, dfd.reject.bind(dfd)));
  };

  suite['#oauth server proxied POST request'] = function () {
    var dfd = this.async(1000);

    var route = '/oauth/v1/authorization';

    request(httpsUrl + route, {
      method: 'POST'
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 400);
    }, dfd.reject.bind(dfd)));
  };
  */


  registerSuite(suite);
});

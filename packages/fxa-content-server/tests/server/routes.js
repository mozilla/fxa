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
    name: 'front end routes'
  };

  var routes = {
    '/config': 200,
    '/tests/index.html': 200,
    '/tests/index.html?coverage': 200,
    '/ver.json': 200,
    '/non_existent': 404
  };

  function routeTest(route, expectedStatusCode) {
    suite['#get ' + route] = function () {
      var dfd = this.async(1000);

      request(serverUrl + route, dfd.callback(function (err, res) {
        assert.equal(res.statusCode, expectedStatusCode);
      }, dfd.reject.bind(dfd)));
    };
  }

  Object.keys(routes).forEach(function (key) {
    routeTest(key, routes[key]);
  });

  registerSuite(suite);

});

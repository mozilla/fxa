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

  var httpsUrl = config.get('public_url');
  var httpUrl = httpsUrl.replace(config.get('port'), config.get('http_port'));

  var suite = {
    name: 'front end routes'
  };

  var routes = {
    '/config': 200,
    '/signin': 200,
    '/signin_complete': 200,
    '/signup': 200,
    '/signup_complete': 200,
    '/confirm': 200,
    '/settings': 200,
    '/change_password': 200,
    '/legal': 200,
    '/legal/terms': 200,
    '/legal/privacy': 200,
    '/cannot_create_account': 200,
    '/verify_email': 200,
    '/reset_password': 200,
    '/confirm_reset_password': 200,
    '/complete_reset_password': 200,
    '/reset_password_complete': 200,
    '/delete_account': 200,
    '/force_auth': 200,
    '/tests/index.html': 200,
    '/tests/index.html?coverage': 200,
    '/ver.json': 200,
    '/non_existent': 404,
    '/legal/non_existent': 404,
    '/en-US/legal/non_existent': 404,
    '/cookies_disabled': 200
  };

  function routeTest(route, expectedStatusCode) {
    suite['#https get ' + httpsUrl + route] = function () {
      var dfd = this.async(1000);

      request(httpsUrl + route, dfd.callback(function (err, res) {
        assert.equal(res.statusCode, expectedStatusCode);
      }, dfd.reject.bind(dfd)));
    };

    // test to ensure http->https redirection works as expected.
    suite['#http get ' + httpUrl + route] = function () {
      var dfd = this.async(1000);

      request(httpUrl + route, dfd.callback(function (err, res) {
        assert.equal(res.statusCode, expectedStatusCode);
      }, dfd.reject.bind(dfd)));
    };
  }

  Object.keys(routes).forEach(function (key) {
    routeTest(key, routes[key]);
  });

  registerSuite(suite);

});

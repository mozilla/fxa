/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Ensure l10n is working as expected based on the
// user's `Accept-Language` headers

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (registerSuite, assert, config, request) {
  'use strict';

  var serverUrl = config.get('public_url');

  var suite = {
    name: 'i18n'
  };

  suite['#get /config'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/config', {
      headers: {
        'Accept-Language': 'es,en;q=0.8,de;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf8');
      // Response differs depending on the Accept-Language, let all
      // intermediaries know this.
      assert.equal(res.headers.vary, 'accept-language');

      var body = JSON.parse(res.body);
      assert.equal(body.language, 'es');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /config should return language not locale'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/config', {
      headers: {
        'Accept-Language': 'en-us'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);

      var body = JSON.parse(res.body);
      assert.equal(body.language, 'en-us');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /i18n/client.json'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/i18n/client.json', {
      headers: {
        'Accept-Language': 'de,en;q=0.8,en;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf8');
      // Response differs depending on the Accept-Language, let all
      // intermediaries know this.
      assert.equal(res.headers.vary, 'accept-language');

      var body = JSON.parse(res.body);
      // yes, body[''] is correct. Language pack meta
      // info is in the '' field.
      assert.equal(body[''].language, 'de');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /i18n/client.json with lowercase language'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/i18n/client.json', {
      headers: {
        'Accept-Language': 'en-gb'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf8');
      var body = JSON.parse(res.body);

      assert.equal(body[''].language, 'en_GB');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /i18n/client.json with unsupported locale'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/i18n/client.json', {
      headers: {
        'Accept-Language': 'no-OP'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf8');
      var body = JSON.parse(res.body);

      assert.equal(body[''].language, 'en_US');
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});

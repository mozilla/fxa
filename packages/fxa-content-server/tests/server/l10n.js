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

  function testClientJson(acceptLanguageHeader, expectedLanguage) {
    /*jshint validthis: true*/
    var dfd = this.async(1000);

    var headers = {};
    if (acceptLanguageHeader) {
      headers['Accept-Language'] = acceptLanguageHeader;
    }

    request(serverUrl + '/i18n/client.json', {
      headers: headers
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
      // Response differs depending on the Accept-Language, let all
      // intermediaries know this.
      assert.equal(res.headers.vary, 'accept-language');

      var body = JSON.parse(res.body);

      // yes, body[''] is correct. Language pack meta
      // info is in the '' field.
      assert.equal(body[''].language, expectedLanguage);
    }, dfd.reject.bind(dfd)));
  }

  suite['#get /config'] = function () {
    var dfd = this.async(1000);

    request(serverUrl + '/config', {
      headers: {
        'Accept-Language': 'es,en;q=0.8,de;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
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

  ['/', '/non-existent', '/boom', '/legal/terms', '/legal/privacy'].forEach(function (page) {
    suite['#get page ' + page + ' has correct localized resources'] = function () {
      var dfd = this.async(1000);

      request(serverUrl + page, {
        headers: {
          'Accept-Language': 'en-us',
          'Accept': 'text/html'
        }
      }, dfd.callback(function (err, res) {
        assert.ok(res.body.match(/styles\/en_US\.css/));
        assert.ok(res.body.match(/dir="ltr"/));
        assert.ok(res.body.match(/lang="en-us"/));
      }, dfd.reject.bind(dfd)));
    };
  });

  // Test against Hebrew, a rtl langauge that must use system fonts
  ['/', '/non-existent', '/boom', '/legal/terms', '/legal/privacy'].forEach(function (page) {
    suite['#get page ' + page + ' has correct localized resources for he locale'] = function () {
      var dfd = this.async(1000);

      request(serverUrl + page, {
        headers: {
          'Accept-Language': 'he',
          'Accept': 'text/html'
        }
      }, dfd.callback(function (err, res) {
        assert.ok(res.body.match(/styles\/system-font-main\.css/));
        assert.ok(res.body.match(/dir="rtl"/));
        assert.ok(res.body.match(/lang="he"/));
      }, dfd.reject.bind(dfd)));
    };
  });

  suite['#get /i18n/client.json with multiple supported languages'] = function () {
    testClientJson.call(this,
        'de,en;q=0.8,en;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2',
        'de');
  };

  suite['#get /i18n/client.json with lowercase language'] = function () {
    testClientJson.call(this, 'en-gb', 'en_GB');
  };

  suite['#get /i18n/client.json with uppercase language'] = function () {
    testClientJson.call(this, 'EN-gb', 'en_GB');
  };

  suite['#get /i18n/client.json with uppercase region'] = function () {
    testClientJson.call(this, 'en-GB', 'en_GB');
  };

  suite['#get /i18n/client.json all uppercase language'] = function () {
    testClientJson.call(this, 'EN-GB', 'en_GB');
  };

  suite['#get /i18n/client.json for language with multiple regions and only language specified'] = function () {
    testClientJson.call(this, 'es', 'es');
  };

  suite['#get /i18n/client.json for language with multiple regions and unsupported region specified'] = function () {
    testClientJson.call(this, 'es-NONEXISTANT', 'es');
  };

  suite['#get /i18n/client.json with language with two-part region with an unsupported region specified'] = function () {
    testClientJson.call(this, 'ja-JP-mac', 'ja');
  };

  suite['#get /i18n/client.json with unsupported language returns default locale'] = function () {
    testClientJson.call(this, 'no-OP', 'en_US');
  };

  suite['#get /i18n/client.json with no locale returns default locale'] = function () {
    testClientJson.call(this, null, 'en_US');
  };

  registerSuite(suite);
});

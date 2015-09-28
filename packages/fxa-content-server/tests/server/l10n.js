/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure l10n is working as expected based on the
// user's `Accept-Language` headers

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request'
], function (intern, registerSuite, assert, config, request) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'i18n'
  };

  function testClientJson(acceptLanguageHeader, expectedLanguage) {
    var dfd = this.async(intern.config.asyncTimeout);

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
      //
      // Note: in production, for /i18n/client.json, nginx can do gzip compression,
      // and will add the header 'Vary: Accept-Encoding' in addition to the 'Vary:
      // Accept-Language' that is set by nodejs on the server-side. However, while
      // that is legal in HTTP, in nodejs < 0.11.11 on the client-side, the second
      // 'Vary:' header clobbers the first one. In nodejs >= 0.11.11, the two headers
      // are folded into one comma-separated value. Which leads to this way too
      // complicated test condition. See https://github.com/joyent/node/pull/6821.
      //
      assert.ok(res.headers.vary, 'the vary header exists');
      var varyHeader = res.headers.vary.toLowerCase().split(/,\s*/);
      if (intern.config.fxaProduction && ! intern.config.fxaDevBox) {
        if (process.versions['node'] < '0.11.11') {
          assert.ok(varyHeader.indexOf('accept-encoding') !== -1);
        } else {
          assert.ok(varyHeader.indexOf('accept-language') !== -1);
          assert.ok(varyHeader.indexOf('accept-encoding') !== -1);
        }
      } else {
        assert.ok(varyHeader.indexOf('accept-language') !== -1);
      }

      var body = JSON.parse(res.body);

      // yes, body[''] is correct. Language pack meta
      // info is in the '' field.
      assert.equal(body[''].language, expectedLanguage);
    }, dfd.reject.bind(dfd)));
  }

  function testExpectHTMLResponse(url, acceptHeader) {
    var dfd = this.async(intern.config.asyncTimeout);

    var headers = {};

    if (acceptHeader) {
      headers.Accept = acceptHeader;
    }

    request(url, {
      headers: headers
    }, dfd.callback(function (err, res) {
      assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    }, dfd.reject.bind(dfd)));
  }

  suite['#get /config'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/config', {
      headers: {
        'Accept-Language': 'es,en;q=0.8,de;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
      // Response differs depending on the Accept-Language, let all
      // intermediaries know this.
      assert.ok(res.headers.vary, 'the vary header exists');
      // the field names in Vary are case-insensitive
      var varyHeader = res.headers.vary.toLowerCase();
      assert.equal(varyHeader, 'accept-language');

      var body = JSON.parse(res.body);
      assert.equal(body.language, 'es');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /config should return language not locale'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/config', {
      headers: {
        'Accept-Language': 'zh-cn'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);

      var body = JSON.parse(res.body);
      assert.equal(body.language, 'zh-cn');
    }, dfd.reject.bind(dfd)));
  };

  // Test each server template based page
  ['/', '/non-existent', '/boom', '/legal/terms', '/legal/privacy'].forEach(function (page) {
    suite['#get page ' + page + ' has correct localized resources'] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      request(serverUrl + page, {
        headers: {
          'Accept': 'text/html',
          'Accept-Language': 'en'
        }
      }, dfd.callback(function (err, res) {
        var re = /styles\/en\.css/;
        if (intern.config.fxaProduction) {
          re = /styles\/[a-f0-9]{0,8}\.en\.css/;
        }
        assert.ok(res.body.match(re));
        assert.ok(res.body.match(/dir="ltr"/));
        assert.ok(res.body.match(/lang="en"/i));
      }, dfd.reject.bind(dfd)));
    };
  });

  // Test against Hebrew, a rtl langauge that must use system fonts
  ['/', '/non-existent', '/boom'].forEach(function (page) {
    suite['#get page ' + page + ' has correct localized resources for he locale'] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      request(serverUrl + page, {
        headers: {
          'Accept': 'text/html',
          'Accept-Language': 'he'
        }
      }, dfd.callback(function (err, res) {
        var re = /styles\/system-font-main\.css/;
        if (intern.config.fxaProduction) {
          re = /styles\/[a-f0-9]{0,8}\.he\.css/;
        }
        assert.ok(res.body.match(re));
        assert.ok(res.body.match(/dir="rtl"/));
        assert.ok(res.body.match(/lang="he"/));
      }, dfd.reject.bind(dfd)));
    };
  });

  suite['#get terms page using lang in the URL'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/zh-CN/legal/terms', {
      headers: {
        'Accept': 'text/html'
      }
    }, dfd.callback(function (err, res) {
      var re = /styles\/system-font-main\.css/;
      if (intern.config.fxaProduction) {
        re = /styles\/[a-f0-9]{0,8}\.zh_CN\.css/;
      }
      assert.ok(re);
      assert.ok(res.body.match(/dir="ltr"/));
      assert.ok(res.body.match(/lang="zh-CN"/));
    }, dfd.reject.bind(dfd)));
  };

  suite['#get terms page with `Accept: */*` (IE8)'] = function () {
    testExpectHTMLResponse.call(this, serverUrl + '/legal/terms', '*/*');
  };

  suite['#get terms page no `Accept` header'] = function () {
    testExpectHTMLResponse.call(this, serverUrl + '/legal/terms', undefined);
  };


  suite['#get privacy page using lang in the URL'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/zh-CN/legal/privacy', {
      headers: {
        'Accept': 'text/html'
      }
    }, dfd.callback(function (err, res) {
      var re = /styles\/system-font-main\.css/;
      if (intern.config.fxaProduction) {
        re = /styles\/[a-f0-9]{0,8}\.zh_CN\.css/;
      }
      assert.ok(re);
      assert.ok(res.body.match(/dir="ltr"/));
      assert.ok(res.body.match(/lang="zh-CN"/));
    }, dfd.reject.bind(dfd)));
  };

  suite['#get privacy page with supported lang that has no privacy template should show en'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/legal/privacy', {
      headers: {
        'Accept': 'text/html',
        'Accept-Language': 'hsb'
      }
    }, dfd.callback(function (err, res) {
      assert.equal(res.request.href, serverUrl + '/en/legal/privacy');
    }, dfd.reject.bind(dfd)));
  };

  suite['#get privacy page with `Accept: */*` (IE8)'] = function () {
    testExpectHTMLResponse.call(this, serverUrl + '/legal/privacy', '*/*');
  };

  suite['#get privacy page with no `Accept` header'] = function () {
    testExpectHTMLResponse.call(this, serverUrl + '/legal/privacy', undefined);
  };

  suite['#get /i18n/client.json with multiple supported languages'] = function () {
    testClientJson.call(this,
        'de,en;q=0.8,en;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2',
        'de');
  };

  suite['#get /i18n/client.json with en,fr should use en'] = function () {
    testClientJson.call(this,
        'en,fr',
        'en');
  };

  suite['#get /i18n/client.json with en-US,fr should use en'] = function () {
    testClientJson.call(this,
        'en-us,fr',
        'en');
  };

  suite['#get /i18n/client.json with lowercase language'] = function () {
    testClientJson.call(this, 'es-ar', 'es_AR');
  };

  suite['#get /i18n/client.json with uppercase language'] = function () {
    testClientJson.call(this, 'ES-ar', 'es_AR');
  };

  suite['#get /i18n/client.json with uppercase region'] = function () {
    testClientJson.call(this, 'es-AR', 'es_AR');
  };

  suite['#get /i18n/client.json all uppercase language'] = function () {
    testClientJson.call(this, 'ES-AR', 'es_AR');
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
    testClientJson.call(this, 'no-OP', 'en');
  };

  suite['#get /i18n/client.json with no locale returns default locale'] = function () {
    testClientJson.call(this, null, 'en');
  };

  // this is a basic test to ensure the original strings are replaced
  // in dev mode and the templates do not render without text.
  suite['#get /503.html page - check text is rendered in dev mode'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/503.html', {
      headers: {
        'Accept': 'text/html'
      }
    }, dfd.callback(function (err, res) {
      assert.ok(res.body.match(/server busy/i));
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});

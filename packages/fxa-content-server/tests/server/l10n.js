/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// Ensure l10n is working as expected based on the
// user's `Accept-Language` headers
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {},
};

const RE_DIR_LTR = /dir="?ltr"?/;
const RE_DIR_RTL = /dir="?rtl"?/;
const RE_LANG_EN = /lang="?en"?/;
const RE_LANG_HE = /lang="?he"?/;
const RE_LANG_ZH_CN = /lang="?zh-CN"?/;

function testClientJson(acceptLanguageHeader, expectedLanguage) {
  var dfd = this.async(intern._config.asyncTimeout);

  var headers = {};
  if (acceptLanguageHeader) {
    headers['Accept-Language'] = acceptLanguageHeader;
  }

  got(serverUrl + '/i18n/client.json', {
    headers: headers,
  })
    .then(function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );
      // Response differs depending on the Accept-Language, let all
      // intermediaries know this.
      //
      // Note: in production, for /i18n/client.json, nginx can do gzip compression,
      // and will add the header 'Vary: Accept-Encoding' in addition to the 'Vary:
      // Accept-Language' that is set by nodejs on the server-side. In nodejs >=
      // 0.11.11, the two headers are folded into one comma-separated value by the
      // client library, so check that both Vary values are present in the Vary
      // header.
      //
      assert.ok(res.headers.vary, 'the vary header exists');
      var varyHeader = res.headers.vary.toLowerCase().split(/,\s*/);
      if (intern._config.fxaProduction && !intern._config.fxaDevBox) {
        assert.ok(varyHeader.indexOf('accept-language') !== -1);
        assert.ok(varyHeader.indexOf('accept-encoding') !== -1);
      } else {
        assert.ok(varyHeader.indexOf('accept-language') !== -1);
      }

      var body = JSON.parse(res.body);

      // yes, body[''] is correct. Language pack meta
      // info is in the '' field.
      assert.equal(body[''].language, expectedLanguage);
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
}

function testExpectHTMLResponse(url, acceptHeader) {
  var dfd = this.async(intern._config.asyncTimeout);

  var headers = {};

  if (acceptHeader) {
    headers.Accept = acceptHeader;
  }

  got(url, {
    headers: headers,
  })
    .then(function(res) {
      assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
}

// Test each server template based page
['/', '/non-existent', '/boom', '/legal/terms', '/legal/privacy'].forEach(
  function(page) {
    suite.tests[
      '#get page ' + page + ' has correct localized resources'
    ] = function() {
      var dfd = this.async(intern._config.asyncTimeout);

      got(serverUrl + page, {
        headers: {
          Accept: 'text/html',
          'Accept-Language': 'en',
        },
      })
        .catch(function(err) {
          return err.response;
        })
        .then(function(res) {
          var re = /styles\/main\.css/;
          if (intern._config.fxaProduction) {
            re = /styles\/[a-f0-9]{0,8}\.main\.css/;
          }
          assert.ok(res.body.match(re));
          assert.ok(res.body.match(RE_DIR_LTR));
          assert.ok(res.body.match(RE_LANG_EN));
        })
        .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

      return dfd;
    };
  }
);

// Test against Hebrew, a rtl langauge that must use system fonts
['/', '/non-existent', '/boom'].forEach(function(page) {
  suite.tests[
    '#get page ' + page + ' has correct localized resources for he locale'
  ] = function() {
    var dfd = this.async(intern._config.asyncTimeout);

    got(serverUrl + page, {
      headers: {
        Accept: 'text/html',
        'Accept-Language': 'he',
      },
    })
      .catch(function(err) {
        return err.response;
      })
      .then(function(res) {
        var re = /styles\/main\.css/;
        if (intern._config.fxaProduction) {
          re = /styles\/[a-f0-9]{0,8}\.main\.css/;
        }
        assert.ok(res.body.match(re));
        assert.ok(res.body.match(RE_DIR_RTL));
        assert.ok(res.body.match(RE_LANG_HE));
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };
});

suite.tests['#get terms page using lang in the URL'] = function() {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/zh-CN/legal/terms', {
    headers: {
      Accept: 'text/html',
    },
  })
    .then(function(res) {
      var re = /styles\/main\.css/;
      if (intern._config.fxaProduction) {
        re = /styles\/[a-f0-9]{0,8}\.main\.css/;
      }
      assert.ok(re);
      assert.ok(res.body.match(RE_DIR_LTR));
      assert.ok(res.body.match(RE_LANG_ZH_CN));
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

suite.tests['#get terms page with `Accept: */*` (IE8)'] = function() {
  return testExpectHTMLResponse.call(this, serverUrl + '/legal/terms', '*/*');
};

suite.tests['#get terms page no `Accept` header'] = function() {
  return testExpectHTMLResponse.call(
    this,
    serverUrl + '/legal/terms',
    undefined
  );
};

suite.tests['#get privacy page using lang in the URL'] = function() {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/zh-CN/legal/privacy', {
    headers: {
      Accept: 'text/html',
    },
  })
    .then(function(res) {
      var re = /styles\/main\.css/;
      if (intern._config.fxaProduction) {
        re = /styles\/[a-f0-9]{0,8}\.main\.css/;
      }
      assert.ok(re);
      assert.ok(res.body.match(RE_DIR_LTR));
      assert.ok(res.body.match(RE_LANG_ZH_CN));
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

suite.tests[
  '#get privacy page with supported lang that has no privacy template should show en'
] = function() {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/legal/privacy', {
    headers: {
      Accept: 'text/html',
      'Accept-Language': 'hsb',
    },
  })
    .then(function(res) {
      assert.equal(res.url, serverUrl + '/en/legal/privacy');
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

suite.tests['#get privacy page with `Accept: */*` (IE8)'] = function() {
  return testExpectHTMLResponse.call(this, serverUrl + '/legal/privacy', '*/*');
};

suite.tests['#get privacy page with no `Accept` header'] = function() {
  return testExpectHTMLResponse.call(
    this,
    serverUrl + '/legal/privacy',
    undefined
  );
};

suite.tests[
  '#get /i18n/client.json with multiple supported languages'
] = function() {
  return testClientJson.call(
    this,
    'de,en;q=0.8,en;q=0.6,en-gb;q=0.4,chrome://global/locale/intl.properties;q=0.2',
    'de'
  );
};

suite.tests['#get /i18n/client.json with en,fr should use en'] = function() {
  return testClientJson.call(this, 'en,fr', 'en');
};

suite.tests['#get /i18n/client.json with en-US,fr should use en'] = function() {
  return testClientJson.call(this, 'en-us,fr', 'en');
};

suite.tests['#get /i18n/client.json with lowercase language'] = function() {
  return testClientJson.call(this, 'es-ar', 'es_AR');
};

suite.tests['#get /i18n/client.json with uppercase language'] = function() {
  return testClientJson.call(this, 'ES-ar', 'es_AR');
};

suite.tests['#get /i18n/client.json with uppercase region'] = function() {
  return testClientJson.call(this, 'es-AR', 'es_AR');
};

suite.tests['#get /i18n/client.json all uppercase language'] = function() {
  return testClientJson.call(this, 'ES-AR', 'es_AR');
};

suite.tests[
  '#get /i18n/client.json for language with multiple regions and only language specified'
] = function() {
  return testClientJson.call(this, 'es', 'es');
};

suite.tests[
  '#get /i18n/client.json for language with multiple regions and unsupported region specified'
] = function() {
  return testClientJson.call(this, 'es-NONEXISTANT', 'es');
};

suite.tests[
  '#get /i18n/client.json with language with two-part region with an unsupported region specified'
] = function() {
  return testClientJson.call(this, 'ja-JP-mac', 'ja');
};

suite.tests[
  '#get /i18n/client.json with unsupported language returns default locale'
] = function() {
  return testClientJson.call(this, 'no-OP', 'en');
};

suite.tests[
  '#get /i18n/client.json with no locale returns default locale'
] = function() {
  return testClientJson.call(this, null, 'en');
};

// this is a basic test to ensure the original strings are replaced
// in dev mode and the templates do not render without text.
suite.tests[
  '#get /503.html page - check text is rendered in dev mode'
] = function() {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/503.html', {
    headers: {
      Accept: 'text/html',
    },
  })
    .then(function(res) {
      assert.ok(res.body.match(/server busy/i));
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

registerSuite('i18n', suite);

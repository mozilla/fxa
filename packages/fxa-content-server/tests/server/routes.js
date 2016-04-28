/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!../../server/lib/csp',
  'intern/dojo/node!htmlparser2',
  'intern/dojo/node!request',
  'intern/dojo/node!url',
  'intern/node_modules/dojo/Promise'
], function (intern, registerSuite, assert, config, csp,
  htmlparser2, request, url, Promise) {
  var httpUrl, httpsUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  if (intern.config.fxaProduction) {
    assert.equal(0, httpsUrl.indexOf('https://'), 'uses https scheme');
    httpUrl = httpsUrl.replace('https://', 'http://');
  } else {
    httpUrl = httpsUrl.replace(config.get('port'), config.get('http_port'));
  }

  var suite = {
    name: 'front end routes'
  };

  var routes = {
    '/.well-known/openid-configuration': { statusCode: 200 },
    '/account_unlock_complete': { statusCode: 200 },
    '/cannot_create_account': { statusCode: 200 },
    '/choose_what_to_sync': { statusCode: 200 },
    '/complete_reset_password': { statusCode: 200 },
    '/complete_unlock_account': { statusCode: 200 },
    '/config': {
      headerAccept: 'application/json',
      statusCode: 200
    },
    '/confirm': { statusCode: 200 },
    '/confirm_account_unlock': { statusCode: 200 },
    '/confirm_reset_password': { statusCode: 200 },
    '/cookies_disabled': { statusCode: 200 },
    '/force_auth': { statusCode: 200 },
    '/force_auth_complete': { statusCode: 200 },
    '/legal': { statusCode: 200 },
    '/legal/privacy': { statusCode: 200 },
    '/legal/terms': { statusCode: 200 },
    '/metrics-errors': { statusCode: 200 },
    '/oauth': { statusCode: 200 },
    '/oauth/force_auth': { statusCode: 200 },
    '/oauth/signin': { statusCode: 200 },
    '/oauth/signup': { statusCode: 200 },
    '/openid/login': { statusCode: 200 },
    '/openid/start': { statusCode: 200 },
    '/reset_password': { statusCode: 200 },
    '/reset_password_complete': { statusCode: 200 },
    '/settings': { statusCode: 200 },
    '/settings/avatar/camera': { statusCode: 200 },
    '/settings/avatar/change': { statusCode: 200 },
    '/settings/avatar/crop': { statusCode: 200 },
    '/settings/avatar/gravatar': { statusCode: 200 },
    '/settings/avatar/gravatar_permissions': { statusCode: 200 },
    '/settings/change_password': { statusCode: 200 },
    '/settings/delete_account': { statusCode: 200 },
    '/settings/devices': { statusCode: 200 },
    '/settings/display_name': { statusCode: 200 },
    '/signin': { statusCode: 200 },
    '/signin_complete': { statusCode: 200 },
    '/signin_permissions': { statusCode: 200 },
    '/signup': { statusCode: 200 },
    '/signup_complete': { statusCode: 200 },
    '/signup_permissions': { statusCode: 200 },
    '/unexpected_error': { statusCode: 200 },
    // the following have a version prefix
    '/v1/complete_reset_password': { statusCode: 200 },
    '/v1/complete_unlock_account': { statusCode: 200 },
    '/v1/reset_password': { statusCode: 200 },
    '/v1/verify_email': { statusCode: 200 },
    '/ver.json': {
      headerAccept: 'application/json',
      statusCode: 200
    },
    '/verify_email': { statusCode: 200 }
  };

  if (config.get('are_dist_resources')) {
    routes['/500.html'] = { statusCode: 200 };
    routes['/502.html'] = { statusCode: 200 };
    routes['/503.html'] = { statusCode: 200 };
  }

  if (! intern.config.fxaProduction) {
    routes['/tests/index.html'] = { statusCode: 200 };
    routes['/tests/index.html?coverage'] = { statusCode: 200 };
    routes['/boom'] = { statusCode: 500 };
    routes['/non_existent'] = { statusCode: 404 };
    routes['/legal/non_existent'] = { statusCode: 404 };
    routes['/en/legal/non_existent'] = { statusCode: 404 };
  }

  var iframeAllowedRoutes = [
    '/legal/terms',
    '/legal/privacy',
    '/oauth/',
    '/oauth/signin',
    '/oauth/signup',
    '/oauth/force_auth',
    '/reset_password',
    '/v1/reset_password',
    '/signin',
    '/signup',
    '/500.html',
    '/502.html',
    '/503.html'
  ];

  function routeTest(route, expectedStatusCode, requestOptions) {
    suite['#https get ' + httpsUrl + route] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      makeRequest(httpsUrl + route, requestOptions)
        .then(function (res) {
          assert.equal(res.statusCode, expectedStatusCode);
          checkHeaders(route, res);

          return res;
        })
        .then(extractAndCheckUrls)
        .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

      return dfd;
    };

    // test to ensure http->https redirection works as expected.
    suite['#http get ' + httpUrl + route] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      makeRequest(httpUrl + route, requestOptions)
        .then(function (res) {
          checkHeaders(route, res);
          assert.equal(res.statusCode, expectedStatusCode);
        })
        .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));
    };
  }

  Object.keys(routes).forEach(function (key) {
    var requestOptions = {
      headers: {
        'Accept': routes[key].headerAccept || 'text/html'
      }
    };

    routeTest(key, routes[key].statusCode, requestOptions);
  });

  registerSuite(suite);

  function makeRequest(url, requestOptions) {
    return new Promise(function (resolve, reject) {
      request(url, requestOptions, function (err, res) {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  function checkHeaders(route, res) {
    var headers = res.headers;

    if (iframeAllowedRoutes.indexOf(route) >= 0) {
      assert.notOk(headers.hasOwnProperty('x-frame-options'));
    } else {
      assert.ok(headers.hasOwnProperty('x-frame-options'));
    }

    // fxa-dev boxes currently do not set CSP headers (but should - GH-2155)
    var routePathname = url.parse(route).pathname;
    if (csp.isCspRequired(routePathname)) {
      assert.ok(headers.hasOwnProperty('content-security-policy-report-only'));
      assert.ok(headers.hasOwnProperty('content-security-policy'));
    }

    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.include(headers['strict-transport-security'], 'max-age=');
  }


  /**
   * Go through each of the HTML files, look for URLs, check that
   * each URL exists, responds with a 200, and in the case of JS, CSS
   * and fonts, that the correct CORS headers are set.
   */
  function extractAndCheckUrls(res) {
    return extractUrls(res.body)
      .then(checkUrls);
  }

  function extractUrls(body) {
    return new Promise(function (resolve, reject) {
      var dependencyUrls = [];

      var parser = new htmlparser2.Parser({
        onattribute: function (attrName, attrValue) {
          if (attrName === 'href' || attrName === 'src') {
            var depUrl;
            if (isAbsoluteUrl(attrValue)) {
              depUrl = attrValue;
            } else {
              depUrl = httpsUrl + attrValue;
            }
            dependencyUrls.push(depUrl);
          }
        },
        onend: function () {
          resolve(dependencyUrls);
        }
      });

      parser.write(body);
      parser.end();
    });
  }

  // keep a cache of checked URLs to avoid duplicate tests and
  // speed up the tests.
  var checkedUrlPromises = {};

  function checkUrls(urls) {
    var requests = urls.map(function (url) {
      if (checkedUrlPromises[url]) {
        return checkedUrlPromises[url];
      }

      var promise = makeRequest(url, {})
        .then(function (res) {
          assert.equal(res.statusCode, 200);

          var headers = res.headers;
          var hasCORSHeaders = headers.hasOwnProperty('Access-Control-Allow-Origin');
          if (doesURLRequireCORS(url)) {
            assert.ok(hasCORSHeaders, url);
          } else {
            assert.notOk(hasCORSHeaders, url);
          }
        });

      checkedUrlPromises[url] = promise;
      return promise;
    });

    return Promise.all(requests);
  }

  function isAbsoluteUrl(url) {
    return /^http/.test(url);
  }

  function doesURLRequireCORS(url) {
    return isExternalUrl(url) && doesExtensionRequireCORS(url);
  }

  function isContentServerUrl(url) {
    return url.indexOf(httpsUrl) === 0 ||
           url.indexOf(httpUrl) === 0;
  }

  function isExternalUrl(url) {
    return ! isContentServerUrl(url);
  }

  function doesExtensionRequireCORS(url) {
    return /\.(js|css|woff|eot)/.test(url);
  }
});

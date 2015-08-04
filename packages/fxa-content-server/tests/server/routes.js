/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request',
  'intern/dojo/node!url'
], function (intern, registerSuite, assert, config, request, url) {
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
    '/config': { statusCode: 200, headerAccept: 'application/json' },
    '/signin': { statusCode: 200 },
    '/signup': { statusCode: 200 },
    '/force_auth': { statusCode: 200 },
    '/oauth': { statusCode: 200 },
    '/oauth/signin': { statusCode: 200 },
    '/oauth/signup': { statusCode: 200 },
    '/oauth/force_auth': { statusCode: 200 },
    '/signup_complete': { statusCode: 200 },
    '/confirm': { statusCode: 200 },
    '/settings': { statusCode: 200 },
    '/settings/avatar/change': { statusCode: 200 },
    '/settings/avatar/gravatar': { statusCode: 200 },
    '/settings/avatar/camera': { statusCode: 200 },
    '/settings/avatar/crop': { statusCode: 200 },
    '/settings/avatar/gravatar_permissions': { statusCode: 200 },
    '/settings/change_password': { statusCode: 200 },
    '/settings/delete_account': { statusCode: 200 },
    '/settings/display_name': { statusCode: 200 },
    '/legal': { statusCode: 200 },
    '/legal/terms': { statusCode: 200 },
    '/legal/privacy': { statusCode: 200 },
    '/cannot_create_account': { statusCode: 200 },
    '/verify_email': { statusCode: 200 },
    '/reset_password': { statusCode: 200 },
    '/confirm_reset_password': { statusCode: 200 },
    '/complete_reset_password': { statusCode: 200 },
    '/reset_password_complete': { statusCode: 200 },
    '/ver.json': { statusCode: 200, headerAccept: 'application/json' },
    '/cookies_disabled': { statusCode: 200 },
    '/confirm_account_unlock': { statusCode: 200 },
    '/complete_unlock_account': { statusCode: 200 },
    '/account_unlock_complete': { statusCode: 200 },
    '/signup_permissions': { statusCode: 200 },
    '/signin_permissions': { statusCode: 200 },
    '/metrics-errors': { statusCode: 200 },
    '/unexpected_error': { statusCode: 200 },

    // the following have a version prefix
    '/v1/complete_reset_password': { statusCode: 200 },
    '/v1/complete_unlock_account': { statusCode: 200 },
    '/v1/reset_password': { statusCode: 200 },
    '/v1/verify_email': { statusCode: 200 }
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
    '/500.html',
    '/502.html',
    '/503.html'
  ];

  function routeTest(route, expectedStatusCode, requestOptions) {
    suite['#https get ' + httpsUrl + route] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      request(httpsUrl + route, requestOptions, dfd.callback(function (err, res) {
        checkHeaders(route, res);
        assert.equal(res.statusCode, expectedStatusCode);
      }, dfd.reject.bind(dfd)));
    };

    // test to ensure http->https redirection works as expected.
    suite['#http get ' + httpUrl + route] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      request(httpUrl + route, requestOptions, dfd.callback(function (err, res) {
        checkHeaders(route, res);
        assert.equal(res.statusCode, expectedStatusCode);
      }, dfd.reject.bind(dfd)));
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

  function checkHeaders(route, res) {
    var headers = res.headers;

    if (iframeAllowedRoutes.indexOf(route) >= 0) {
      assert.notOk(headers.hasOwnProperty('x-frame-options'));
    } else {
      assert.ok(headers.hasOwnProperty('x-frame-options'));
    }

    // fxa-dev boxes currently do not set CSP headers (but should - GH-2155)
    if (! intern.config.fxaDevBox) {
      if (intern.config.fxaProduction) {
        assert.ok(headers.hasOwnProperty('content-security-policy-report-only'));
      } else if (config.get('env') === 'development' &&
                 // the front end tests do not get CSP headers.
                 url.parse(route).pathname !== '/tests/index.html') {
        assert.ok(headers.hasOwnProperty('content-security-policy'));
      }
    }

    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.include(headers['strict-transport-security'], 'max-age=');
  }

});

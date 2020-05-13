/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const config = require('../../server/lib/configuration');
const _ = require('lodash');
const routesHelpers = require('./helpers/routesHelpers');

var checkHeaders = routesHelpers.checkHeaders;
//var extractAndCheckUrls = routesHelpers.extractAndCheckUrls;
var makeRequest = routesHelpers.makeRequest;

var httpUrl,
  httpsUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

if (intern._config.fxaProduction) {
  assert.equal(0, httpsUrl.indexOf('https://'), 'uses https scheme');
  httpUrl = httpsUrl.replace('https://', 'http://');
} else {
  httpUrl = httpsUrl.replace(config.get('port'), config.get('http_port'));
}

const suite = {
  tests: {},
};

var routes = {
  '/.well-known/fxa-client-configuration': { statusCode: 200 },
  '/.well-known/openid-configuration': { statusCode: 200 },
  '/authorization': { statusCode: 200 },
  '/cannot_create_account': { statusCode: 200 },
  '/choose_what_to_sync': { statusCode: 200 },
  '/complete_reset_password': { statusCode: 200 },
  '/complete_signin': { statusCode: 200 },
  '/config': {
    headerAccept: 'application/json',
    statusCode: 410,
  },
  '/confirm': { statusCode: 200 },
  '/confirm_reset_password': { statusCode: 200 },
  '/confirm_signin': { statusCode: 200 },
  '/connect_another_device': { statusCode: 200 },
  '/connect_another_device/why': { statusCode: 200 },
  '/cookies_disabled': { statusCode: 200 },
  '/force_auth': { statusCode: 200 },
  '/get_flow': { statusCode: 200 },
  '/legal': { statusCode: 200 },
  '/legal/privacy': { statusCode: 200 },
  '/legal/terms': { statusCode: 200 },
  '/oauth': { statusCode: 200 },
  '/oauth/force_auth': { statusCode: 200 },
  '/oauth/signin': { statusCode: 200 },
  '/oauth/signup': { statusCode: 200 },
  '/report_signin': { statusCode: 200 },
  '/reset_password': { statusCode: 200 },
  '/reset_password_confirmed': { statusCode: 200 },
  '/reset_password_verified': { statusCode: 200 },
  '/settings': { statusCode: 200 },
  '/settings/avatar/camera': { statusCode: 200 },
  '/settings/avatar/change': { statusCode: 200 },
  '/settings/avatar/crop': { statusCode: 200 },
  '/settings/change_password': { statusCode: 200 },
  '/settings/clients': { statusCode: 200 },
  '/settings/clients/disconnect': { statusCode: 200 },
  '/settings/delete_account': { statusCode: 200 },
  '/settings/display_name': { statusCode: 200 },
  '/signin': { statusCode: 200 },
  '/signin_bounced': { statusCode: 200 },
  '/signin_confirmed': { statusCode: 200 },
  '/signin_permissions': { statusCode: 200 },
  '/signin_reported': { statusCode: 200 },
  '/signin_unblock': { statusCode: 200 },
  '/signin_verified': { statusCode: 200 },
  '/signup': { statusCode: 200 },
  '/signup_confirmed': { statusCode: 200 },
  '/signup_permissions': { statusCode: 200 },
  '/signup_verified': { statusCode: 200 },
  '/subscriptions': { statusCode: 200 },
  '/subscriptions/products/123doneProProduct': { statusCode: 200 },
  '/sms': { statusCode: 200 },
  '/sms/sent': { statusCode: 200 },
  '/sms/sent/why': { statusCode: 200 },
  '/sms/why': { statusCode: 200 },
  '/support': { statusCode: 200 },
  // the following have a version prefix
  '/v1/complete_reset_password': { statusCode: 200 },
  '/v1/reset_password': { statusCode: 200 },
  '/v1/verify_email': { statusCode: 200 },
  '/ver.json': {
    headerAccept: 'application/json',
    statusCode: 200,
  },
  '/verify_email': { statusCode: 200 },
};

if (config.get('are_dist_resources')) {
  routes['/500.html'] = { statusCode: 200 };
  routes['/502.html'] = { statusCode: 200 };
  routes['/503.html'] = { statusCode: 200 };
}

if (!intern._config.fxaProduction) {
  routes['/tests/index.html'] = { csp: false, statusCode: 200 };
  routes['/tests/index.html?coverage'] = { csp: false, statusCode: 200 };
  routes['/boom'] = { statusCode: 500 };
  routes['/non_existent'] = { statusCode: 404 };
  routes['/non_existent.js'] = { statusCode: 404 };
  routes['/legal/non_existent'] = { statusCode: 404 };
  routes['/en/legal/non_existent'] = { statusCode: 404 };
}

var redirectedRoutes = {
  '/m/12345678': {
    location: _.template(config.get('sms.redirect.targetURITemplate'))({
      channel: config.get('sms.redirect.channels.release'),
      signinCode: '12345678',
    }),
    statusCode: 302,
  },
  '/reset_password_complete': {
    location: '/reset_password_verified',
    statusCode: 302,
  },
  '/signin_complete': {
    location: '/signin_verified',
    statusCode: 302,
  },
  '/signup_complete': {
    location: '/signup_verified',
    statusCode: 302,
  },
};

Object.keys(routes).forEach(function(key) {
  var requestOptions = {
    headers: {
      Accept: routes[key].headerAccept || 'text/html',
    },
  };

  routeTest(key, routes[key].statusCode, requestOptions);
});

Object.keys(redirectedRoutes).forEach(redirectTest);

registerSuite('front end routes', suite.tests);

function routeTest(route, expectedStatusCode, requestOptions) {
  const testName = `#https get ${httpsUrl}${route}`;
  suite.tests[testName] = function() {
    var dfd = this.async(intern._config.asyncTimeout);

    makeRequest(httpsUrl + route, requestOptions)
      .then(function(res) {
        assert.equal(res.statusCode, expectedStatusCode);
        checkHeaders(routes, route, res);

        //return extractAndCheckUrls(res, testName);
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };

  // test to ensure http->https redirection works as expected.
  suite['#http get ' + httpUrl + route] = function() {
    var dfd = this.async(intern._config.asyncTimeout);

    makeRequest(httpUrl + route, requestOptions)
      .then(function(res) {
        checkHeaders(routes, route, res);
        assert.equal(res.statusCode, expectedStatusCode);
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));
  };
}

function redirectTest(route) {
  suite['https get ' + httpsUrl + route] = function() {
    var dfd = this.async(intern._config.asyncTimeout);

    var routeConfig = redirectedRoutes[route];

    var requestOptions = {
      followRedirect: false,
      headers: {
        Accept: 'text/html',
      },
    };

    makeRequest(httpsUrl + route, requestOptions)
      .then(function(res) {
        assert.equal(res.statusCode, routeConfig.statusCode);
        assert.equal(res.headers.location, routeConfig.location);

        return res;
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };
}

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
  'intern/dojo/node!got',
  'intern/dojo/node!url',
  'intern/browser_modules/dojo/Promise',
  'tests/server/helpers/routesHelpers',
  'intern/dojo/node!fxa-shared'
], function (intern, registerSuite, assert, config, csp,
  htmlparser2, got, url, Promise, routesHelpers, fxaShared) {

  var checkHeaders = routesHelpers.checkHeaders;
  var extractAndCheckUrls = routesHelpers.extractAndCheckUrls;
  var makeRequest = routesHelpers.makeRequest;

  var languages = fxaShared.l10n.supportedLanguages;
  var httpsUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  if (intern.config.fxaProduction) {
    assert.equal(0, httpsUrl.indexOf('https://'), 'uses https scheme');
  }

  var suite = {
    name: 'check resources entrained by /signin in all locales'
  };

  var routes = {
    '/signin': { statusCode: 200 }
  };

  Object.keys(routes).forEach(function (key) {
    languages.forEach(function (lang) {
      var requestOptions = {
        headers: {
          'Accept': routes[key].headerAccept || 'text/html',
          'Accept-Language': lang
        }
      };

      routeTest(key, routes[key].statusCode, requestOptions);
    });
  });

  registerSuite(suite);

  function routeTest(route, expectedStatusCode, requestOptions) {
    suite['#https get ' + httpsUrl + route + ' ' + requestOptions.headers['Accept-Language']] = function () {
      var dfd = this.async(intern.config.asyncTimeout);

      makeRequest(httpsUrl + route, requestOptions)
        .then((res) => {
          assert.equal(res.statusCode, expectedStatusCode);
          checkHeaders(routes, route, res);

          return res;
        })
        .then(extractAndCheckUrls)
        .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

      return dfd;
    };
  }

});

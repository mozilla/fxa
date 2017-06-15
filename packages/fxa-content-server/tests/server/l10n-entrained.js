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
  'intern/dojo/node!fxa-shared',
  'intern/dojo/node!./lib/dnshook'
], function (intern, registerSuite, assert, config, csp, htmlparser2,
             got, url, Promise, routesHelpers, fxaShared, dnshook) {

  var checkHeaders = routesHelpers.checkHeaders;
  var extractAndCheckUrls = routesHelpers.extractAndCheckUrls;
  var makeRequest = routesHelpers.makeRequest;

  var languages = fxaShared.l10n.supportedLanguages;
  var httpsUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var hookDns = process.env.FXA_DNS_ELB && process.env.FXA_DNS_ALIAS;

  if (intern.config.fxaProduction) {
    assert.equal(0, httpsUrl.indexOf('https://'), 'uses https scheme');
  }

  var dnsSuite = {
    name: 'confirm that dns.lookup is called via makeRequest by aliasing non-existent domain',
    setup: function () {
      if (hookDns) {
        dnshook('nxdomain.nxdomain.nxdomain', process.env.FXA_DNS_ALIAS);
      }
    },
    teardown: function () {
      dnshook(false);
    }
  };

  dnsSuite['#https get ' + httpsUrl + '/signin fails if non-existent domain'] = function () {
    var dfd = this.async(2000);

    makeRequest(httpsUrl + '/signin', {})
      .then((res) => {
        if (hookDns) {
          // If we've hooked dns, then this should fail. But `makeRequest`
          // squelches errors, so "failure" means `res` will be undefined.
          assert.ok(res === undefined);
        } else {
          // Otherwise, if we haven't hooked dns, then this should succeed.
          assert.equal(res.statusCode, 200);
        }
      })
      .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

    return dfd;
  };

  registerSuite(dnsSuite);

  var suite = {
    name: 'check resources entrained by /signin in all locales',
    setup: function () {
      if (hookDns) {
        dnshook(process.env.FXA_DNS_ELB, process.env.FXA_DNS_ALIAS);
      }
    },
    teardown: function () {
      dnshook(false);
    }
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

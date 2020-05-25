/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const getAppleSiteAssociation = require('../../../server/lib/routes/get-apple-app-site-association');
const got = require('got');
var serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

var suite = {
  tests: {},
};

var route;

suite.tests['get-apple-app-site-association route function'] = {
  'route interface is correct': function () {
    route = getAppleSiteAssociation();
    assert.isObject(route);
    assert.lengthOf(Object.keys(route), 3);
    assert.equal(route.method, 'get');
    assert.equal(route.path, '/.well-known/apple-app-site-association');
    assert.isFunction(route.process);
    assert.lengthOf(route.process, 2);
  },
};

suite.tests[
  '#get /.well-known/apple-app-site-association - returns a JSON doc with expected values'
] = function () {
  var dfd = this.async(intern._config.asyncTimeout);

  got(serverUrl + '/.well-known/apple-app-site-association', {})
    .then(function (res) {
      assert.equal(res.statusCode, 200);
      assert.equal(
        res.headers['content-type'],
        'application/json; charset=utf-8'
      );

      const result = JSON.parse(res.body);
      const paths = ['/verify_email', '/complete_signin'];
      const expectedResult = {
        applinks: {
          apps: [],
          details: [
            {
              appID: '43AQ936H96.org.mozilla.ios.Firefox',
              paths: paths,
            },
            {
              appID: '43AQ936H96.org.mozilla.ios.Fennec',
              paths: paths,
            },
            {
              appID: '43AQ936H96.org.mozilla.ios.FirefoxBeta',
              paths: paths,
            },
          ],
        },
      };
      assert.deepEqual(result, expectedResult);
    })
    .then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));

  return dfd;
};

registerSuite('apple-app-site-association', suite);

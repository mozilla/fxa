/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../../server/lib/routes/get-apple-app-site-association',
  'intern/dojo/node!got'
], function (intern, registerSuite, assert, getAppleSiteAssociation, got) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'apple-app-site-association'
  };

  var route;

  suite['get-apple-app-site-association route function'] = {

    'route interface is correct': function () {
      route = getAppleSiteAssociation();
      assert.isObject(route);
      assert.lengthOf(Object.keys(route), 3);
      assert.equal(route.method, 'get');
      assert.equal(route.path, '/.well-known/apple-app-site-association');
      assert.isFunction(route.process);
      assert.lengthOf(route.process, 2);
    }
  };

  suite['#get /.well-known/apple-app-site-association - returns a JSON doc with expected values'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got(serverUrl + '/.well-known/apple-app-site-association', {})
      .then(function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');

        const result = JSON.parse(res.body);
        const paths = ['/verify_email', '/complete_signin'];
        const expectedResult = {
          'applinks': {
            'apps': [],
            'details': [
              {
                'appID': '43AQ936H96.org.mozilla.ios.Firefox',
                'paths': paths
              },
              {
                'appID': '43AQ936H96.org.mozilla.ios.Fennec',
                'paths': paths
              },
              {
                'appID': '43AQ936H96.org.mozilla.ios.FirefoxBeta',
                'paths': paths
              }
            ]
          }
        };
        assert.deepEqual(result, expectedResult);
      }).then(dfd.resolve, dfd.reject);
  };

  registerSuite(suite);
});

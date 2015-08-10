/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!request',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire'
], function (intern, registerSuite, assert, config, request, initLogging, fs, path, proxyquire) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var env = config.get('env');
  if (intern.config.fxaProduction) {
    env = 'production';
  }

  var suite = {
    name: 'metrics-errors'
  };

  suite['#get /config returns env that is used for error metrics'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request(serverUrl + '/config',
    dfd.callback(function (err, res) {
      var results = JSON.parse(res.body);

      assert.equal(results.env, env);
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /metrics-errors - returns 200 without query'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request.get(serverUrl + '/metrics-errors', dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
    }, dfd.reject.bind(dfd)));
  };

  suite['#get /metrics-errors - returns 200 with an error query'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    request.get(serverUrl + '/metrics-errors?sentry_version=4', dfd.callback(function (err, res) {
      assert.equal(res.statusCode, 200);
    }, dfd.reject.bind(dfd)));
  };

  // This test cannot be run remotely like the other tests in tests/server.
  if (! intern.config.fxaProduction) {
    suite['it gets the release information from package.json'] = function () {
      var contentServerVersion = JSON.parse(fs.readFileSync('./package.json')).version;

      var requestMock = function (req, cb) {
        var resp = {
          statusCode: 200
        };

        // quickly test the correct request is made
        assert.isTrue(req.indexOf('sentry_version=4&sentry_client=raven-js') > 0, 'sentry config is in the request');
        assert.isTrue(req.indexOf(contentServerVersion) > 0, 'version is present in the request');
        assert.isTrue(req.indexOf('release') > 0, 'release tag is present in the request');
        cb(null, resp, {});
      };

      var mocks = {
        'request': requestMock
      };
      var metricsRoute = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'get-metrics-errors'), mocks);
      var route = metricsRoute().process;
      var mockQuery = JSON.parse(fs.readFileSync('tests/server/fixtures/sentry_query.json'));
      var req = {
        query: mockQuery
      };
      var res = {
        json: function () {}
      };

      route(req, res);
    };
  }

  registerSuite(suite);
});

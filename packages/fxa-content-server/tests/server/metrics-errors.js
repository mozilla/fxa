/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!got',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!url'
], function (intern, registerSuite, assert, config, got, initLogging, fs, path, proxyquire, url) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'metrics-errors'
  };

  suite['#get deprecated /metrics-errors endpoint - returns 200'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.get(serverUrl + '/metrics-errors')
      .then(function (res) {
        assert.equal(res.statusCode, 200);
      })
      .then(dfd.resolve, dfd.reject);
  };

  suite['#post /metrics-errors - returns 200 without query'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.post(serverUrl + '/metrics-errors')
      .then(function (res) {
        assert.equal(res.statusCode, 200);
      })
      .then(dfd.resolve, dfd.reject);
  };

  suite['#post /metrics-errors - returns 200 with an error query'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.post(serverUrl + '/metrics-errors?sentry_version=4')
      .then(function (res) {
        assert.equal(res.statusCode, 200);
      })
      .then(dfd.resolve, dfd.reject);
  };

  suite['#post /metrics-errors - returns 200 with an error query and a body'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);

    got.post(serverUrl + '/metrics-errors?sentry_version=4', {
      body: JSON.stringify({ logger: 'javascript', project: 'metrics-errors' }),
    }).then(function (res) {
      assert.equal(res.statusCode, 200);
    }).then(dfd.resolve, dfd.reject);
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
      var metricsRoute = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-metrics-errors'), mocks);
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

    suite['it trims long stacktraces'] = function () {
      var requestMock = function (req, cb) {
        var resp = {
          statusCode: 200
        };

        var urlParts = url.parse(req, true);
        var frames = JSON.parse(urlParts.query.sentry_data).stacktrace.frames;
        assert.isTrue(req.indexOf('sentry_version=4&sentry_client=raven-js') > 0, 'sentry config is in the request');
        assert.isTrue(frames.length === 20, 'stacktrace is trimmed');
        cb(null, resp, {});
      };

      var mocks = {
        'request': requestMock
      };
      var metricsRoute = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-metrics-errors'), mocks);
      var route = metricsRoute().process;
      var mockQuery = JSON.parse(fs.readFileSync('tests/server/fixtures/sentry_query_long_trace.json'));
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!../../../server/lib/configuration',
  'intern/dojo/node!proxyquire'
], function (intern, registerSuite, assert, initLogging, fs, path, config, proxyquire) {
  // ensure we don't get any module from the cache, but to load it fresh every time
  proxyquire.noPreserveCache();
  var suite = {
    name: 'post-metrics'
  };
  var mockRequest = {
    body: {
      'csp-report': {
        'blocked-uri': 'http://bing.com'
      }
    }
  };
  var mockResponse = {
    json: function () {}
  };

  suite['it drops if no csp-report set'] = function () {
    var options = {
      reportSampleRate: 100
    };
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})(options);
    assert.isFalse(postCsp.process({
      body: {}
    }, mockResponse));

    assert.isTrue(postCsp.process({
      body: {
        'csp-report': {}
      }
    }, mockResponse));

    assert.isTrue(postCsp.process(mockRequest, mockResponse));
  };


  suite['it allows no messages with 0% sample rate '] = function () {
    var options = {
      reportSampleRate: 0
    };
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})(options);

    // check 5 times that all messages come through
    assert.isFalse(postCsp.process(mockRequest, mockResponse));
    assert.isFalse(postCsp.process(mockRequest, mockResponse));
    assert.isFalse(postCsp.process(mockRequest, mockResponse));
    assert.isFalse(postCsp.process(mockRequest, mockResponse));
    assert.isFalse(postCsp.process(mockRequest, mockResponse));
  };

  suite['it allows all messages with 100% sample rate'] = function () {
    var options = {
      reportSampleRate: 100
    };

    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})(options);
    // check 5 times that all messages drop
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
  };

  registerSuite(suite);
});

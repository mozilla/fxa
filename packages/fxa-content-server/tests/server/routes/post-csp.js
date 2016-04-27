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
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon'
], function (intern, registerSuite, assert, initLogging, fs, path, config,
  proxyquire, sinon) {
  // ensure we don't get any module from the cache, but to load it fresh every time
  proxyquire.noPreserveCache();
  var suite = {
    name: 'post-csp'
  };
  var mockRequest = {
    body: {
      'csp-report': {
        'blocked-uri': 'http://bing.com'
      }
    },
    'get': function () {}
  };

  var mockResponse = {
    json: function () {}
  };

  suite['it drops if no csp-report set'] = function () {
    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });
    assert.isFalse(postCsp.process({
      body: {},
      'get': function () {}
    }, mockResponse));

    assert.equal(writer.callCount, 0);
  };

  suite['it drops if csp-report is empty'] = function () {
    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });
    assert.isFalse(postCsp.process({
      body: {
        'csp-report': {}
      },
      'get': function () {}
    }, mockResponse));

    assert.equal(writer.callCount, 0);
  };

  suite['it works with csp reports'] = function () {
    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });
    // check 5 times that all messages drop
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));
    assert.isTrue(postCsp.process(mockRequest, mockResponse));

    assert.equal(writer.callCount, 5);
  };

  suite['it strips PII from the referrer and source fields'] = function () {
    var mockRequest = {
      body: {
        'csp-report': {
          'blocked-uri': 'http://bing.com',
          'referrer': 'https://addons.mozilla.org/?email=testuser@testuser.com&notaffected=1',
          'source-file': 'https://accounts.firefox.com/settings?uid=bigscaryuid&email=testuser@testuser.com&notaffected=1'
        }
      },
      'get': function () {}
    };

    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });

    postCsp.process(mockRequest, mockResponse);

    var entry = writer.args[0][0];
    assert.equal(entry.referrer, 'https://addons.mozilla.org/?notaffected=1');
    assert.equal(entry.source, 'https://accounts.firefox.com/settings?notaffected=1');
  };

  suite['works correctly if query params do not contain PII'] = function () {
    var mockRequest = {
      body: {
        'csp-report': {
          'blocked-uri': 'http://bing.com',
          'referrer': 'https://addons.mozilla.org/?notaffected=1',
          'source-file': 'https://accounts.firefox.com/settings?notaffected=1'
        }
      },
      'get': function () {}
    };

    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });

    postCsp.process(mockRequest, mockResponse);

    var entry = writer.args[0][0];
    assert.equal(entry.referrer, 'https://addons.mozilla.org/?notaffected=1');
    assert.equal(entry.source, 'https://accounts.firefox.com/settings?notaffected=1');
  };

  suite['works correctly if no query params'] = function () {
    var mockRequest = {
      body: {
        'csp-report': {
          'blocked-uri': 'http://bing.com',
          'referrer': 'https://addons.mozilla.org/?',
          'source-file': 'https://accounts.firefox.com'
        }
      },
      'get': function () {}
    };

    var writer = sinon.spy();
    var postCsp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'post-csp'), {})({ write: writer });

    postCsp.process(mockRequest, mockResponse);

    var entry = writer.args[0][0];
    assert.equal(entry.referrer, 'https://addons.mozilla.org/?');
    assert.equal(entry.source, 'https://accounts.firefox.com');
  };


  registerSuite(suite);
});

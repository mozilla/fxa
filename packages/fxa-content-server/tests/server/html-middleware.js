/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
// ensure we don't get any module from the cache, but to load it fresh every time
proxyquire.noPreserveCache();

const htmlMiddlware = proxyquire(
  path.join(process.cwd(), 'server', 'lib', 'html-middleware'),
  {
    'on-headers'(res, callback) {
      callback();
    },
  }
);

var originalMiddleware;
var wrappedMiddleware;

var req;
var res;
var next;

registerSuite('html-middleware', {
  beforeEach: function () {
    originalMiddleware = sinon.spy();
    wrappedMiddleware = htmlMiddlware(originalMiddleware);

    req = {};
    res = {
      getHeader() {},
    };
    next = sinon.spy();
  },
  tests: {
    'it calls middleware if an html response type': function () {
      sinon.stub(res, 'getHeader').callsFake(() => 'text/html; charset=UTF-8');
      wrappedMiddleware(req, res, next);

      assert.isTrue(originalMiddleware.calledOnce);
      assert.isTrue(originalMiddleware.calledWith(req, res));
      assert.isTrue(next.calledOnce);
    },

    'it does not call middleware if a non-html response type': function () {
      sinon
        .stub(res, 'getHeader')
        .callsFake(() => 'application/json; charset=UTF-8');
      wrappedMiddleware(req, res, next);

      assert.isFalse(originalMiddleware.called);
      assert.isTrue(next.calledOnce);
    },
  },
});

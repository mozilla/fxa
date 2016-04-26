/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var flowBeginMixin = require('views/mixins/flow-begin-mixin');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('views/mixins/flow-begin-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(flowBeginMixin), 1);
      assert.isFunction(flowBeginMixin.afterRender);
      assert.lengthOf(flowBeginMixin.afterRender, 0);
    });

    describe('afterRender', function () {
      beforeEach(function () {
        flowBeginMixin.metrics = {
          logFlowBegin: sinon.spy()
        };
        flowBeginMixin.user = {
          get: sinon.spy(function () {
            return 'foo';
          })
        };
        flowBeginMixin.sentryMetrics = {
          captureException: sinon.spy()
        };
        $('body').attr('data-flow-begin', '42');
        flowBeginMixin.afterRender();
      });

      it('called user.get correctly', function () {
        assert.strictEqual(flowBeginMixin.user.get.callCount, 1);
        var args = flowBeginMixin.user.get.args[0];
        assert.strictEqual(args.length, 1);
        assert.strictEqual(args[0], 'flowId');
      });

      it('called metrics.logFlowBegin correctly', function () {
        assert.strictEqual(flowBeginMixin.metrics.logFlowBegin.callCount, 1);
        var args = flowBeginMixin.metrics.logFlowBegin.args[0];
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], 'foo');
        assert.strictEqual(args[1], 42);
      });

      it('did not call sentryMetrics.captureException', function () {
        assert.strictEqual(flowBeginMixin.sentryMetrics.captureException.callCount, 0);
      });
    });

    describe('afterRender with invalid data-flow-begin attribute', function () {
      beforeEach(function () {
        flowBeginMixin.metrics = {
          logFlowBegin: sinon.spy()
        };
        flowBeginMixin.user = {
          get: sinon.spy(function () {
            return 'wibble';
          })
        };
        flowBeginMixin.sentryMetrics = {
          captureException: sinon.spy()
        };
        $('body').attr('data-flow-begin', 'bar');
        flowBeginMixin.afterRender();
      });

      it('called user.get correctly', function () {
        assert.strictEqual(flowBeginMixin.user.get.callCount, 1);
        var args = flowBeginMixin.user.get.args[0];
        assert.strictEqual(args.length, 1);
        assert.strictEqual(args[0], 'flowId');
      });

      it('called metrics.logFlowBegin correctly', function () {
        assert.strictEqual(flowBeginMixin.metrics.logFlowBegin.callCount, 1);
        var args = flowBeginMixin.metrics.logFlowBegin.args[0];
        assert.lengthOf(args, 2);
        assert.strictEqual(args[0], 'wibble');
        assert.isUndefined(args[1]);
      });

      it('called sentryMetrics.captureException correctly', function () {
        assert.strictEqual(flowBeginMixin.sentryMetrics.captureException.callCount, 1);
        var args = flowBeginMixin.sentryMetrics.captureException.args[0];
        assert.lengthOf(args, 1);
        assert.instanceOf(args[0], Error);
        assert.equal(args[0].message, 'Invalid data-flow-begin attribute');
      });
    });
  });
});


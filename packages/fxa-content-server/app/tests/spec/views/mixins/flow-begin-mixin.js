/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const chai = require('chai');
  const flowBeginMixin = require('views/mixins/flow-begin-mixin');
  const sinon = require('sinon');

  var assert = chai.assert;

  describe('views/mixins/flow-begin-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(flowBeginMixin), 1);
      assert.isFunction(flowBeginMixin.afterRender);
      assert.lengthOf(flowBeginMixin.afterRender, 0);
    });

    describe('afterRender', function () {
      var FLOW_ID = 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103';

      beforeEach(function () {
        flowBeginMixin.metrics = {
          logFlowBegin: sinon.spy(),
          setFlowEventMetadata: sinon.spy()
        };
        flowBeginMixin.logError = sinon.spy();
        $('body').data('flowId', FLOW_ID);
        $('body').data('flowBegin', 42);
        flowBeginMixin.viewName = 'wibble';
        flowBeginMixin.afterRender();
      });

      it('correctly created a Flow model instance', function () {
        assert.ok(flowBeginMixin.flow);
        assert.strictEqual(flowBeginMixin.flow.get('flowId'), FLOW_ID);
        assert.strictEqual(flowBeginMixin.flow.get('flowBegin'), 42);
      });

      it('called metrics.setFlowEventMetadata correctly', function () {
        assert.strictEqual(flowBeginMixin.metrics.setFlowEventMetadata.callCount, 1);
        var args = flowBeginMixin.metrics.setFlowEventMetadata.args[0];
        assert.lengthOf(args, 1);
        assert.lengthOf(Object.keys(args[0]), 2);
        assert.strictEqual(args[0].flowId, FLOW_ID);
        assert.strictEqual(args[0].flowBeginTime, 42);
      });

      it('called metrics.logFlowBegin correctly', function () {
        assert.strictEqual(flowBeginMixin.metrics.logFlowBegin.callCount, 1);
        var args = flowBeginMixin.metrics.logFlowBegin.args[0];
        assert.lengthOf(args, 3);
        assert.strictEqual(args[0], FLOW_ID);
        assert.strictEqual(args[1], 42);
        assert.strictEqual(args[2], 'wibble');
      });

      it('did not call view.logError', function () {
        assert.strictEqual(flowBeginMixin.logError.callCount, 0);
      });
    });
  });
});


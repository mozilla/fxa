/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const flowEventsMixin = require('views/mixins/flow-events-mixin');
  const sinon = require('sinon');

  const FLOW_ID = 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103';

  describe('views/mixins/flow-events-mixin', () => {
    it('exports correct interface', () => {
      assert.lengthOf(Object.keys(flowEventsMixin), 1);
      assert.isFunction(flowEventsMixin.afterRender);
      assert.lengthOf(flowEventsMixin.afterRender, 0);
      assert.notOk(flowEventsMixin.flow);
    });

    describe('mix in', () => {
      let isFormEnabled;

      beforeEach(() => {
        flowEventsMixin.metrics = {
          logFlowBegin: sinon.spy(),
          setFlowEventMetadata: sinon.spy()
        };
        flowEventsMixin.isFormEnabled = () => isFormEnabled;
        flowEventsMixin.logEvent = sinon.spy();
        flowEventsMixin.logEventOnce = sinon.spy();
        flowEventsMixin.logFlowEvent = sinon.spy();
        flowEventsMixin.logFlowEventOnce = sinon.spy();
        $('body').data('flowId', FLOW_ID);
        $('body').data('flowBegin', 42);
        flowEventsMixin.viewName = 'bar';
      });

      describe('afterRender', () => {
        beforeEach(() => {
          flowEventsMixin.afterRender();
          flowEventsMixin.flow.logError = sinon.spy();
        });

        it('correctly created a Flow model instance', () => {
          assert.ok(flowEventsMixin.flow);
          assert.strictEqual(flowEventsMixin.flow.get('flowId'), FLOW_ID);
          assert.strictEqual(flowEventsMixin.flow.get('flowBegin'), 42);
        });

        it('called metrics.setFlowEventMetadata correctly', () => {
          assert.strictEqual(flowEventsMixin.metrics.setFlowEventMetadata.callCount, 1);
          const args = flowEventsMixin.metrics.setFlowEventMetadata.args[0];
          assert.lengthOf(args, 1);
          assert.lengthOf(Object.keys(args[0]), 2);
          assert.strictEqual(args[0].flowId, FLOW_ID);
          assert.strictEqual(args[0].flowBeginTime, 42);
        });

        it('did not call metrics.logFlowBegin', () => {
          assert.strictEqual(flowEventsMixin.metrics.logFlowBegin.callCount, 0);
        });
      });
    });
  });
});

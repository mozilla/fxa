/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const { assert } = require('chai');
  const flowBeginMixin = require('views/mixins/flow-begin-mixin');
  const sinon = require('sinon');

  describe('views/mixins/flow-begin-mixin', () => {
    it('exports correct interface', () => {
      assert.lengthOf(Object.keys(flowBeginMixin), 1);
      assert.isFunction(flowBeginMixin.afterRender);
      assert.lengthOf(flowBeginMixin.afterRender, 0);
    });

    describe('afterRender', () => {
      beforeEach(() => {
        flowBeginMixin.metrics = {
          logFlowBegin: sinon.spy()
        };
        flowBeginMixin.flow = {
          get: sinon.spy(property => `mock ${property}`)
        };
        flowBeginMixin.viewName = 'wibble';
        flowBeginMixin.afterRender();
      });

      it('called metrics.logFlowBegin correctly', () => {
        assert.strictEqual(flowBeginMixin.metrics.logFlowBegin.callCount, 1);
        const args = flowBeginMixin.metrics.logFlowBegin.args[0];
        assert.lengthOf(args, 3);
        assert.strictEqual(args[0], 'mock flowId');
        assert.strictEqual(args[1], 'mock flowBegin');
        assert.strictEqual(args[2], 'wibble');
      });
    });
  });
});


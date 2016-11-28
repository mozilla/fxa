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
      assert.lengthOf(Object.keys(flowEventsMixin), 6);
      assert.isFunction(flowEventsMixin.afterRender);
      assert.lengthOf(flowEventsMixin.afterRender, 0);
      assert.notOk(flowEventsMixin.flow);
      assert.deepEqual(flowEventsMixin.events, {
        'click a': '_clickFlowEventsLink',
        'click input': '_engageFlowEventsForm',
        'input input': '_engageFlowEventsForm',
        'keyup input': '_keyupFlowEventsInput',
        submit: '_submitFlowEventsForm'
      });
      assert.isFunction(flowEventsMixin._clickFlowEventsLink);
      assert.isFunction(flowEventsMixin._engageFlowEventsForm);
      assert.isFunction(flowEventsMixin._keyupFlowEventsInput);
      assert.isFunction(flowEventsMixin._submitFlowEventsForm);
    });

    describe('mix in', () => {
      let isFormEnabled;

      beforeEach(() => {
        flowEventsMixin.metrics = {
          logFlowBegin: sinon.spy(),
          setFlowModel: sinon.spy()
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
        });

        it('correctly created a Flow model instance', () => {
          assert.ok(flowEventsMixin.flow);
          assert.strictEqual(flowEventsMixin.flow.get('flowId'), FLOW_ID);
          assert.strictEqual(flowEventsMixin.flow.get('flowBegin'), 42);
        });

        it('called metrics.setFlowModel correctly', () => {
          assert.strictEqual(flowEventsMixin.metrics.setFlowModel.callCount, 1);
          const args = flowEventsMixin.metrics.setFlowModel.args[0];
          assert.lengthOf(args, 1);
          assert.equal(args[0], flowEventsMixin.flow);
        });

        it('did not call metrics.logFlowBegin', () => {
          assert.strictEqual(flowEventsMixin.metrics.logFlowBegin.callCount, 0);
        });
      });

      describe('_clickFlowEventsLink with target id', () => {
        beforeEach(() => {
          flowEventsMixin._clickFlowEventsLink({
            target: {
              getAttribute () {
                return 'baz';
              },
              nodeType: 1
            }
          });
        });

        it('emits flow events correctly', () => {
          assert.equal(flowEventsMixin.logFlowEvent.callCount, 1);
          assert.equal(flowEventsMixin.logFlowEvent.args[0].length, 2);
          assert.equal(flowEventsMixin.logFlowEvent.args[0][0], 'baz');
          assert.equal(flowEventsMixin.logFlowEvent.args[0][1], 'bar');

          assert.strictEqual(flowEventsMixin.logFlowEventOnce.callCount, 0);
        });
      });

      describe('_clickFlowEventsLink without target id', () => {
        beforeEach(() => {
          flowEventsMixin._clickFlowEventsLink({
            target: {
              getAttribute () {},
              nodeType: 1
            }
          });
        });

        it('emits flow events correctly', () => {
          assert.equal(flowEventsMixin.logFlowEvent.callCount, 0);
          assert.strictEqual(flowEventsMixin.logFlowEventOnce.callCount, 0);
        });
      });

      describe('_engageFlowEventsForm', () => {
        beforeEach(() => {
          flowEventsMixin._engageFlowEventsForm();
        });

        it('emits flow event correctly', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);

          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 1);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0].length, 2);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][0], 'engage');
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][1], 'bar');
        });
      });

      describe('_keyupFlowEventsInput with TAB key', () => {
        beforeEach(() => {
          flowEventsMixin._keyupFlowEventsInput({
            which: 9
          });
        });

        it('emits flow event correctly', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);

          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 1);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0].length, 2);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][0], 'engage');
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][1], 'bar');
        });
      });

      describe('_keyupFlowEventsInput with META+TAB keys', () => {
        beforeEach(() => {
          flowEventsMixin._keyupFlowEventsInput({
            metaKey: true,
            which: 9
          });
        });

        it('does not emit flow event', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);
          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 0);
        });
      });

      describe('_keyupFlowEventsInput with CTRL+TAB keys', () => {
        beforeEach(() => {
          flowEventsMixin._keyupFlowEventsInput({
            ctrlKey: true,
            which: 9
          });
        });

        it('does not emit flow event', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);
          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 0);
        });
      });

      describe('_keyupFlowEventsInput with ALT+TAB keys', () => {
        beforeEach(() => {
          flowEventsMixin._keyupFlowEventsInput({
            altKey: true,
            which: 9
          });
        });

        it('does not emit flow event', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);
          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 0);
        });
      });

      describe('_keyupFlowEventsInput with SHIFT+TAB keys', () => {
        beforeEach(() => {
          flowEventsMixin._keyupFlowEventsInput({
            shiftKey: true,
            which: 9
          });
        });

        it('emits flow event correctly', () => {
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);

          assert.equal(flowEventsMixin.logFlowEventOnce.callCount, 1);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0].length, 2);
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][0], 'engage');
          assert.equal(flowEventsMixin.logFlowEventOnce.args[0][1], 'bar');
        });
      });

      describe('_submitFlowEventsForm with form enabled', () => {
        beforeEach(() => {
          isFormEnabled = true;
          flowEventsMixin._submitFlowEventsForm();
        });

        it('emits flow events correctly', () => {
          assert.strictEqual(flowEventsMixin.logFlowEventOnce.callCount, 0);

          assert.equal(flowEventsMixin.logFlowEvent.callCount, 1);
          assert.equal(flowEventsMixin.logFlowEvent.args[0].length, 2);
          assert.equal(flowEventsMixin.logFlowEvent.args[0][0], 'submit');
          assert.equal(flowEventsMixin.logFlowEvent.args[0][1], 'bar');
        });
      });

      describe('_submitFlowEventsForm with form disabled', () => {
        beforeEach(() => {
          isFormEnabled = false;
          flowEventsMixin._submitFlowEventsForm();
        });

        it('emits flow events correctly', () => {
          assert.strictEqual(flowEventsMixin.logFlowEventOnce.callCount, 0);
          assert.strictEqual(flowEventsMixin.logFlowEvent.callCount, 0);
        });
      });
    });
  });
});


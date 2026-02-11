/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import flowEventsMixin from 'views/mixins/flow-events-mixin';
import sinon from 'sinon';

describe('views/mixins/flow-events-mixin', () => {
  let isFormEnabled;

  beforeEach(() => {
    flowEventsMixin.isFormEnabled = () => isFormEnabled;
    flowEventsMixin.logFlowEvent = sinon.spy();
    flowEventsMixin.logFlowEventOnce = sinon.spy();
    flowEventsMixin.notifier = {
      trigger: sinon.spy(),
    };
    flowEventsMixin.viewName = 'bar';
  });

  it('exports correct interface', () => {
    assert.isFunction(flowEventsMixin.afterRender);
    assert.lengthOf(flowEventsMixin.afterRender, 0);
    assert.deepEqual(flowEventsMixin.events, {
      'click a': '_clickFlowEventsLink',
      'click input': '_engageFlowEventsForm',
      'input input': '_engageFlowEventsForm',
      'change select': '_engageFlowEventsForm',
      'keyup input': '_keyupFlowEventsInput',
      'keyup textarea': '_keyupFlowEventsInput',
      submit: '_submitFlowEventsForm',
    });
    assert.isFunction(flowEventsMixin._clickFlowEventsLink);
    assert.isFunction(flowEventsMixin._engageFlowEventsForm);
    assert.isFunction(flowEventsMixin._keyupFlowEventsInput);
    assert.isFunction(flowEventsMixin._submitFlowEventsForm);
  });

  describe('afterRender', () => {
    beforeEach(() => {
      flowEventsMixin.afterRender();
    });

    it('calls notifier.trigger correctly', () => {
      assert.equal(flowEventsMixin.notifier.trigger.callCount, 1);
      const args = flowEventsMixin.notifier.trigger.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'flow.initialize');
    });
  });

  describe('_clickFlowEventsLink with currentTarget id', () => {
    beforeEach(() => {
      flowEventsMixin._clickFlowEventsLink({
        currentTarget: {
          getAttribute() {
            return 'baz';
          },
          nodeType: 1,
        },
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

  describe('_clickFlowEventsLink without currentTarget id', () => {
    beforeEach(() => {
      flowEventsMixin._clickFlowEventsLink({
        currentTarget: {
          getAttribute() {},
          nodeType: 1,
        },
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
        which: 9,
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
        which: 9,
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
        which: 9,
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
        which: 9,
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
        which: 9,
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

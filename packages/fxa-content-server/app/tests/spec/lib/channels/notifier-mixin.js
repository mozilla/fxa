/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import BaseView from 'views/base';
import helpers from '../../../lib/helpers';
import Notifier from 'lib/channels/notifier';
import NotifierMixin from 'lib/channels/notifier-mixin';
import sinon from 'sinon';

const { createUid } = helpers;

describe('lib/channels/notifier-mixin', () => {
  const data = { uid: createUid() };
  let functionHandlerSpy;
  let notifier;
  let view;

  beforeEach(() => {
    functionHandlerSpy = sinon.spy();

    const ConsumingView = BaseView.extend({
      notificationHandler() {
        // intentionally empty, a spy is added later.
      },

      callOnceHandler() {
        // intentionally empty, a spy is added later.
      },

      notifications: {
        'function-handler': functionHandlerSpy,
        'once!call-once': 'callOnceHandler',
        'string-handler': 'notificationHandler',
      },
    });

    // BaseView mixes in NotifierMixin already, no need
    // to re-add it.

    notifier = new Notifier();
    view = new ConsumingView({
      notifier,
    });
  });

  afterEach(() => {
    view.destroy();
    view = null;
  });

  it('exports correct interface', () => {
    const expectedFunctions = ['initialize'];
    assert.lengthOf(Object.keys(NotifierMixin), expectedFunctions.length);
    expectedFunctions.forEach(function(expectedFunction) {
      assert.isFunction(NotifierMixin[expectedFunction]);
    });
  });

  describe('auto-binding of notifier', () => {
    describe('with a string for the handler', () => {
      beforeEach(() => {
        sinon.spy(view, 'notificationHandler');
        notifier.trigger('string-handler');
      });

      it('calls the correct handler, even if handler is a spy', () => {
        assert.isTrue(view.notificationHandler.calledOnce);
      });
    });

    describe('with a function for the handler', () => {
      beforeEach(() => {
        notifier.trigger('function-handler');
      });

      it('calls the correct handler', () => {
        assert.isTrue(functionHandlerSpy.calledOnce);
      });
    });

    describe('with a handler that should be invoked once', () => {
      beforeEach(() => {
        sinon.spy(view, 'callOnceHandler');

        notifier.trigger('call-once');
        notifier.trigger('call-once');
        notifier.trigger('call-once');
      });

      it('invokes the handler only once', () => {
        assert.isTrue(view.callOnceHandler.calledOnce);
      });
    });
  });

  describe('notifier.on', () => {
    let callback;

    beforeEach(() => {
      callback = sinon.spy();
      sinon.spy(notifier, 'on');

      view.notifier.on('message', callback);
      notifier.trigger('message');
    });

    it('registers a message with the notifier', () => {
      assert.isTrue(notifier.on.calledWith('message', callback));
      assert.isTrue(callback.calledOnce);
    });
  });

  describe('notifier.once', () => {
    let callback;

    beforeEach(() => {
      callback = sinon.spy();
      sinon.spy(view, 'listenToOnce');

      view.notifier.once('handle-once', callback);
      notifier.trigger('handle-once');
      notifier.trigger('handle-once');
      notifier.trigger('handle-once');
    });

    it('registers a message with the notifier', () => {
      assert.isTrue(
        view.listenToOnce.calledWith(notifier, 'handle-once', callback)
      );
      assert.isTrue(callback.calledOnce);
    });
  });

  describe('notifcations.off', () => {
    describe('with an event name attached using `on` and a callback', () => {
      let callback;

      beforeEach(() => {
        sinon.spy(notifier, 'off');

        callback = sinon.spy();

        view.notifier.on('message', callback);
        view.notifier.off('message', callback);
        view.notifier.trigger('message');
      });

      it('unregisters a message with the notifier', () => {
        assert.isTrue(notifier.off.calledWith('message'));
        // A second argument is passed, but it's opaque to us.
        assert.isFunction(notifier.off.args[0][1]);
        assert.isFalse(callback.called);
      });
    });

    describe('with an event attached using `once` and a callback', () => {
      let callback;

      beforeEach(() => {
        sinon.spy(notifier, 'off');

        callback = sinon.spy();

        view.notifier.once('message', callback);
        view.notifier.off('message', callback);
        view.notifier.trigger('message');
      });

      it('unregisters a message with the notifier', () => {
        assert.isTrue(notifier.off.calledWith('message'));
        // A second argument is passed, but it's opaque to us.
        assert.isFunction(notifier.off.args[0][1]);
        assert.isFalse(callback.called);
      });
    });

    describe('without an event name and callback', () => {
      let callback1;
      let callback2;

      beforeEach(() => {
        callback1 = sinon.spy();
        callback2 = sinon.spy();

        view.notifier.on('message1', callback1);
        view.notifier.on('message2', callback2);

        view.notifier.off();

        notifier.trigger('message1');
        notifier.trigger('message2');
      });

      it("unregisters all of the view's handlers from the notifier", () => {
        assert.isFalse(callback1.called);
        assert.isFalse(callback2.called);
      });
    });
  });

  describe('notifier.trigger', () => {
    beforeEach(() => {
      sinon.spy(notifier, 'trigger');
      view.notifier.trigger('fxaccounts:logout', data);
    });

    it('delegates to notifier.trigger', () => {
      assert.isTrue(
        notifier.trigger.calledWith('fxaccounts:logout', data, view)
      );
    });
  });

  describe('notifier.triggerAll', () => {
    beforeEach(() => {
      sinon.spy(notifier, 'triggerAll');
      view.notifier.triggerAll('fxaccounts:logout', data);
    });

    it('delegates to notifier.triggerAll', () => {
      assert.isTrue(
        notifier.triggerAll.calledWith('fxaccounts:logout', data, view)
      );
    });
  });

  describe('notifier.triggerRemote', () => {
    beforeEach(() => {
      sinon.spy(notifier, 'triggerRemote');
      view.notifier.triggerRemote('fxaccounts:logout', data);
    });

    it('delegates to notifier.triggerRemote', () => {
      assert.isTrue(
        notifier.triggerRemote.calledWith('fxaccounts:logout', data)
      );
    });
  });

  describe('destroy', () => {
    let callback1;
    let callback2;

    beforeEach(() => {
      callback1 = sinon.spy();
      callback2 = sinon.spy();

      view.notifier.on('message1', callback1);
      view.notifier.on('message2', callback2);

      view.destroy();

      notifier.trigger('message1');
      notifier.trigger('message2');
    });

    it("unregisters all of the view's handlers from the notifier", () => {
      assert.isFalse(callback1.called);
      assert.isFalse(callback2.called);
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const Notifier = require('lib/channels/notifier');
  const NotifierMixin = require('lib/channels/notifier-mixin');
  const sinon = require('sinon');

  describe('lib/channels/notifier-mixin', function () {
    var data = { uid: 'foo' };
    var functionHandlerSpy;
    var notifier;
    var view;

    beforeEach(function () {
      functionHandlerSpy = sinon.spy();

      var ConsumingView = BaseView.extend({
        notificationHandler () {
          // intentionally empty, a spy is added later.
        },

        notifications: {
          'function-handler': functionHandlerSpy,
          'string-handler': 'notificationHandler'
        }
      });

      Cocktail.mixin(ConsumingView, NotifierMixin);

      notifier = new Notifier();
      view = new ConsumingView({
        notifier: notifier
      });
    });

    afterEach(function () {
      view.destroy();
      view = null;
    });

    it('exports correct interface', function () {
      var expectedFunctions = [
        'initialize',
      ];
      assert.lengthOf(Object.keys(NotifierMixin), expectedFunctions.length);
      expectedFunctions.forEach(function (expectedFunction) {
        assert.isFunction(NotifierMixin[expectedFunction]);
      });
    });

    describe('auto-binding of notifier', function () {
      describe('with a string for the handler', function () {
        beforeEach(function () {
          sinon.spy(view, 'notificationHandler');
          notifier.trigger('string-handler');
        });

        it('calls the correct handler, even if handler is a spy', function () {
          assert.isTrue(view.notificationHandler.called);
        });
      });

      describe('with a function for the handler', function () {
        beforeEach(function () {
          notifier.trigger('function-handler');
        });

        it('calls the correct handler', function () {
          assert.isTrue(functionHandlerSpy.called);
        });
      });
    });

    describe('notifier.on', function () {
      var callback = function () {};

      beforeEach(function () {
        sinon.spy(notifier, 'on');

        view.notifier.on('message', callback);
      });

      it('registers a message with the notifier', function () {
        assert.isTrue(notifier.on.calledWith('message', callback));
      });
    });

    describe('notifcations.off', function () {
      describe('with an event name and callback', function () {
        beforeEach(function () {
          sinon.spy(notifier, 'off');

          var callback = function () {};

          view.notifier.on('message', callback);
          view.notifier.off('message', callback);
        });

        it('unregisters a message with the notifier', function () {
          assert.isTrue(notifier.off.calledWith('message'));
          // A second argument is passed, but it's opaque to us.
          assert.ok(notifier.off.args[0][1]);
        });
      });

      describe('without an event name and callback', function () {
        beforeEach(function () {
          sinon.spy(notifier, 'off');

          var callback1 = function () {};
          var callback2 = function () {};

          view.notifier.on('message1', callback1);
          view.notifier.on('message2', callback2);
        });

        it('unregisters all of the view\'s handlers from the notifier', function () {
          view.notifier.off();

          assert.isTrue(notifier.off.calledWith('message1'));
          // A second argument is passed, but it's opaque to us.
          assert.ok(notifier.off.args[0][1]);

          assert.isTrue(notifier.off.calledWith('message2'));
          // A second argument is passed, but it's opaque to us.
          assert.ok(notifier.off.args[1][1]);
        });
      });
    });

    describe('notifier.trigger', function () {
      beforeEach(function () {
        sinon.spy(notifier, 'trigger');
        view.notifier.trigger('fxaccounts:logout', data);
      });

      it('delegates to notifier.trigger', function () {
        assert.isTrue(notifier.trigger.calledWith('fxaccounts:logout', data, view));
      });
    });

    describe('notifier.triggerAll', function () {
      beforeEach(function () {
        sinon.spy(notifier, 'triggerAll');
        view.notifier.triggerAll('fxaccounts:logout', data);
      });

      it('delegates to notifier.triggerAll', function () {
        assert.isTrue(notifier.triggerAll.calledWith('fxaccounts:logout', data, view));
      });
    });

    describe('notifier.triggerRemote', function () {
      beforeEach(function () {
        sinon.spy(notifier, 'triggerRemote');
        view.notifier.triggerRemote('fxaccounts:logout', data);
      });

      it('delegates to notifier.triggerRemote', function () {
        assert.isTrue(notifier.triggerRemote.calledWith('fxaccounts:logout', data));
      });
    });
  });
});

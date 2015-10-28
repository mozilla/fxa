/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'cocktail',
  'lib/channels/inter-tab',
  'sinon',
  'views/base',
  'views/mixins/inter-tab-channel-mixin',
], function (chai, Cocktail, InterTabChannel, sinon, BaseView,
  InterTabChannelMixin) {
  'use strict';

  var assert = chai.assert;

  var ConsumingView = BaseView.extend({});
  Cocktail.mixin(ConsumingView, InterTabChannelMixin);

  describe('views/mixins/inter-tab-channel-mixin', function () {
    var interTabChannel;
    var view;

    beforeEach(function () {
      interTabChannel = new InterTabChannel();

      view = new ConsumingView({
        interTabChannel: interTabChannel
      });
    });

    afterEach(function () {
      view.destroy();
      view = null;
    });

    it('exports correct interface', function () {
      var expectedFunctions = [
        'initialize',
        'interTabOn',
        'interTabOff',
        'interTabOffAll',
        'interTabSend',
        'interTabClear'
      ];
      assert.lengthOf(Object.keys(InterTabChannelMixin), expectedFunctions.length);
      expectedFunctions.forEach(function (expectedFunction) {
        assert.isFunction(InterTabChannelMixin[expectedFunction]);
      });
    });

    describe('interTabOn', function () {
      it('registers a message with the inter-tab-channel', function () {
        sinon.spy(interTabChannel, 'on');

        var callback = function () {};

        view.interTabOn('message', callback);
        assert.isTrue(interTabChannel.on.calledWith('message', callback));
      });
    });

    describe('interTabOff', function () {
      it('unregisters a message with the inter-tab-channel', function () {
        sinon.spy(interTabChannel, 'off');

        var callback = function () {};

        view.interTabOn('message', callback);
        view.interTabOff('message', callback);

        assert.isTrue(interTabChannel.off.calledWith('message'));
        // A second argument is passed, but it's opaque to us.
        assert.ok(interTabChannel.off.args[0][1]);
      });
    });

    describe('interTabOffAll', function () {
      it('unregisters all of the view\'s handlers from the inter-tab-channel', function () {
        sinon.spy(interTabChannel, 'off');

        var callback1 = function () {};
        var callback2 = function () {};

        view.interTabOn('message1', callback1);
        view.interTabOn('message2', callback2);

        view.interTabOffAll();

        assert.isTrue(interTabChannel.off.calledWith('message1'));
        // A second argument is passed, but it's opaque to us.
        assert.ok(interTabChannel.off.args[0][1]);
        assert.isTrue(interTabChannel.off.calledWith('message2'));
        // A second argument is passed, but it's opaque to us.
        assert.ok(interTabChannel.off.args[1][1]);
      });
    });

    describe('interTabSend', function () {
      it('sends a message over the inter tab channel', function () {
        sinon.spy(interTabChannel, 'send');

        var data = { token: 'token' };
        view.interTabSend('message1', data);
        assert.isTrue(interTabChannel.send.calledWith('message1', data));
      });
    });

    describe('interTabClear', function () {
      it('clears inter tab channel data', function () {
        sinon.spy(interTabChannel, 'clear');

        view.interTabClear();
        assert.isTrue(interTabChannel.clear.called);
      });
    });
  });
});


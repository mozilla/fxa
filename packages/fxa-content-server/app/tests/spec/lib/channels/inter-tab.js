/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BroadcastChannelMock from '../../../mocks/broadcast-channel';
import { assert } from 'chai';
import InterTabChannel from 'lib/channels/inter-tab';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('lib/channels/inter-tab', function() {
  describe('InterTabChannel', function() {
    var interTabChannel;

    describe('instantiation', function() {
      describe('with `BroadcastChannel` support', function() {
        beforeEach(function() {
          var windowMock = new WindowMock();
          windowMock.BroadcastChannel = BroadcastChannelMock;

          interTabChannel = new InterTabChannel({
            window: windowMock,
          });
        });

        it('creates a BroadcastChannel', function() {
          assert.ok(interTabChannel._broadcastChannel);
        });
      });

      describe('without `BroadcastChannel` support', function() {
        beforeEach(function() {
          var windowMock = new WindowMock();

          interTabChannel = new InterTabChannel({
            window: windowMock,
          });
        });

        it('does not create a BroadcastChannel', function() {
          assert.notOk(interTabChannel._broadcastChannel);
        });
      });
    });

    describe('public methods', function() {
      var adapter;

      beforeEach(function() {
        adapter = {
          off: sinon.spy(),
          on: sinon.spy(),
          send: sinon.spy(),
        };

        interTabChannel = new InterTabChannel({
          adapter: adapter,
        });
      });
    });
  });

  describe('BroadcastChannelAdapter', function() {
    var broadcastChannel;
    var interTabChannel;
    var windowMock;

    beforeEach(function() {
      windowMock = new WindowMock();
      windowMock.BroadcastChannel = BroadcastChannelMock;

      interTabChannel = new InterTabChannel({
        window: windowMock,
      });

      broadcastChannel = interTabChannel._broadcastChannel;
    });

    describe('send', function() {
      beforeEach(function() {
        interTabChannel.send('message', { key: 'value' });
      });

      it('send a message to the broadcast channel', function() {
        var serializedMessage = interTabChannel.stringify('message', {
          key: 'value',
        });

        assert.isTrue(
          broadcastChannel.postMessage.calledWith(serializedMessage)
        );
      });
    });

    describe('on/onMessage', function() {
      let onMessageHandlerSpy;

      beforeEach(function() {
        sinon.spy(interTabChannel, 'trigger');

        onMessageHandlerSpy = sinon.spy();

        interTabChannel.on('message', onMessageHandlerSpy);

        interTabChannel.onMessage({
          data: JSON.stringify({
            data: {
              key: 'value',
            },
            name: 'message',
          }),
        });
      });

      it('triggers a message with the event and data', function() {
        assert.isTrue(
          interTabChannel.trigger.calledWith('message', {
            key: 'value',
          })
        );
      });

      it('calls the registered `message` handler', () => {
        assert.isTrue(onMessageHandlerSpy.called);
      });
    });

    describe('off/onMessage', () => {
      let onRemovedHandlerSpy;

      beforeEach(function() {
        onRemovedHandlerSpy = sinon.spy();

        interTabChannel.on('removed', onRemovedHandlerSpy);
        interTabChannel.off('removed', onRemovedHandlerSpy);

        interTabChannel.onMessage({
          data: JSON.stringify({
            name: 'removed',
          }),
        });
      });

      it('does not call the removed `removed` handler', () => {
        assert.isFalse(onRemovedHandlerSpy.called);
      });
    });
  });
});

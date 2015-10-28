/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  '../../../mocks/broadcast-channel',
  '../../../mocks/crosstab',
  '../../../mocks/window',
  'lib/channels/inter-tab'
], function (chai, sinon, BroadcastChannelMock, CrossTabMock, WindowMock,
  InterTabChannel) {
  'use strict';

  var assert = chai.assert;

  describe('lib/channels/inter-tab', function () {
    describe('InterTabChannel', function () {
      var interTabChannel;

      describe('instantiation', function () {
        describe('with `BroadcastChannel` support', function () {
          beforeEach(function () {
            var windowMock = new WindowMock();
            windowMock.BroadcastChannel = BroadcastChannelMock;

            interTabChannel = new InterTabChannel({
              window: windowMock
            });
          });

          it('creates a BroadcastChannelAdapter', function () {
            assert.instanceOf(interTabChannel._adapter,
                        InterTabChannel.BroadcastChannelAdapter);
          });
        });

        describe('without `BroadcastChannel` support', function () {
          beforeEach(function () {
            var windowMock = new WindowMock();

            interTabChannel = new InterTabChannel({
              window: windowMock
            });
          });

          it('creates a LocalStorageAdapter', function () {
            assert.instanceOf(interTabChannel._adapter,
                        InterTabChannel.LocalStorageAdapter);
          });
        });
      });

      describe('public methods', function () {
        var adapter;

        beforeEach(function () {
          adapter = {
            clear: sinon.spy(),
            off: sinon.spy(),
            on: sinon.spy(),
            send: sinon.spy()
          };

          interTabChannel = new InterTabChannel({
            adapter: adapter
          });
        });

        describe('send', function () {
          beforeEach(function () {
            interTabChannel.send('name', { key: 'value' });
          });

          it('delegates to the adapter', function () {
            assert.isTrue(adapter.send.calledWith('name', { key: 'value' }));
          });
        });

        describe('on', function () {
          var callback = function () {};

          beforeEach(function () {
            interTabChannel.on('name', callback);
          });

          it('delegates to the adapter', function () {
            assert.isTrue(adapter.on.calledWith('name', callback));
          });
        });

        describe('off', function () {
          var callback = function () {};

          beforeEach(function () {
            interTabChannel.off('name', callback);
          });

          it('delegates to the adapter', function () {
            assert.isTrue(adapter.off.calledWith('name', callback));
          });
        });

        describe('clear', function () {
          beforeEach(function () {
            interTabChannel.clear();
          });

          it('delegates to the adapter', function () {
            assert.isTrue(adapter.clear.called);
          });
        });
      });
    });


    describe('LocalStorageAdapter', function () {
      var localStorageAdapter;
      var crossTabMock;

      beforeEach(function () {
        crossTabMock = new CrossTabMock();

        localStorageAdapter = new InterTabChannel.LocalStorageAdapter({
          crosstab: crossTabMock
        });
      });

      describe('send', function () {
        describe('with no other tab is ready', function () {
          beforeEach(function () {
            sinon.stub(crossTabMock.util, 'tabCount', function () {
              return 1;
            });

            sinon.spy(crossTabMock, 'broadcast');

            localStorageAdapter.send('message');
          });

          it('does not send a message', function () {
            assert.isFalse(crossTabMock.broadcast.called);
          });
        });

        describe('if another tab is ready', function () {
          beforeEach(function () {
            sinon.stub(crossTabMock.util, 'tabCount', function () {
              return 2;
            });

            sinon.spy(crossTabMock, 'broadcast');

            localStorageAdapter.send('message');
          });

          it('sends a message', function () {
            assert.isTrue(crossTabMock.broadcast.called);
          });
        });

        describe('if browser is not supported', function () {
          beforeEach(function () {
            sinon.stub(crossTabMock.util, 'tabCount', function () {
              return 2;
            });

            sinon.stub(crossTabMock, 'broadcast', function () {
              throw new Error('unsupported browser');
            });
          });

          it('does not blow up', function () {
            localStorageAdapter.send('message');
          });
        });
      });

      describe('on', function () {
        var key;

        beforeEach(function () {
          sinon.spy(crossTabMock.util.events, 'on');
          key = localStorageAdapter.on('message', function () {});
        });

        it('register a callback to be called when a message is sent', function () {
          assert.isTrue(crossTabMock.util.events.on.called);
          assert.ok(key);
        });
      });

      describe('off', function () {
        var key;

        beforeEach(function () {
          sinon.spy(crossTabMock.util.events, 'off');

          var callback = function () {};
          key = localStorageAdapter.on('message', callback);
          localStorageAdapter.off('message', key);
        });

        it('unregister a callback to be called when a message is sent', function () {
          assert.isTrue(
            crossTabMock.util.events.off.calledWith('message', key));
        });
      });

      describe('clear', function () {
        beforeEach(function () {
          sinon.spy(crossTabMock.util, 'clearMessages');
          localStorageAdapter.clear();
        });

        it('clears all stored messages', function () {
          assert.isTrue(crossTabMock.util.clearMessages.called);
        });
      });
    });

    describe('BroadcastChannelAdapter', function () {
      var broadcastChannelAdapter;
      var broadcastChannel;
      var windowMock;

      beforeEach(function () {
        windowMock = new WindowMock();
        windowMock.BroadcastChannel = BroadcastChannelMock;

        broadcastChannelAdapter = new InterTabChannel.BroadcastChannelAdapter({
          window: windowMock
        });

        broadcastChannel = broadcastChannelAdapter._broadcastChannel;
      });

      describe('send', function () {
        beforeEach(function () {
          broadcastChannelAdapter.send('message', { key: 'value' });
        });

        it('send a message to the broadcast channel', function () {
          var serializedMessage =
            broadcastChannelAdapter.stringify('message', { key: 'value' });

          assert.isTrue(
            broadcastChannel.postMessage.calledWith(serializedMessage));
        });
      });

      describe('onMessage', function () {
        beforeEach(function () {
          sinon.spy(broadcastChannelAdapter, 'trigger');

          broadcastChannelAdapter.onMessage({
            data: JSON.stringify({
              data: {
                key: 'value'
              },
              name: 'message'
            })
          });
        });

        it('triggers a message with the event and data', function () {
          assert.isTrue(
            broadcastChannelAdapter.trigger.calledWith('message', {
              data: {
                key: 'value'
              }
            }));
        });
      });
    });
  });
});



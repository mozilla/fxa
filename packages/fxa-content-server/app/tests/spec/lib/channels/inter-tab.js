/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BroadcastChannelMock = require('../../../mocks/broadcast-channel');
  var chai = require('chai');
  var CrossTabMock = require('../../../mocks/crosstab');
  var InterTabChannel = require('lib/channels/inter-tab');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

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
          describe('from the current tab\'s P.O.V.', function () {
            var handler;
            beforeEach(function () {
              handler = sinon.spy();

              sinon.stub(crossTabMock.util, 'tabCount', function () {
                return 2;
              });

              // synthesize crosstab's behavior to send messages to
              // the tab that sent the message.
              var registeredHandler;
              sinon.stub(crossTabMock, 'broadcast', function (event, data) {
                registeredHandler({
                  data: data,
                  event: event
                });
              });

              sinon.stub(crossTabMock.util.events, 'on', function (event, _registeredHandler) {
                registeredHandler = _registeredHandler;
              });

              localStorageAdapter.on('message', handler);
              localStorageAdapter.send('message');
            });

            it('sends a message', function () {
              assert.isTrue(crossTabMock.broadcast.called);
            });

            it('does not trigger a callback for this tab', function () {
              assert.isFalse(handler.called);
            });
          });

          describe('from the remote tab\'s P.O.V.', function () {
            var handler;
            beforeEach(function () {
              handler = sinon.spy();

              var registeredHandler;
              sinon.stub(crossTabMock.util.events, 'on', function (event, _registeredHandler) {
                registeredHandler = _registeredHandler;
              });

              localStorageAdapter.on('message', handler);

              // synthesize crosstab calling the registered handler
              registeredHandler({
                data: {
                  data: {
                    field: 'value'
                  },
                  id: 1
                },
                event: 'message',
              });
            });

            it('triggers the callback for this tab', function () {
              assert.isTrue(handler.calledWith({
                field: 'value'
              }));
            });
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
        var handler;

        beforeEach(function () {
          sinon.stub(crossTabMock.util, 'tabCount', function () {
            return 2;
          });
          sinon.stub(crossTabMock.util, 'generateId', function () {
            return 'wibble';
          });
          sinon.spy(crossTabMock.util.events, 'on');
          sinon.spy(crossTabMock.util.events, 'off');
          sinon.spy(crossTabMock, 'broadcast');
          handler = function () {};
          localStorageAdapter.on('message', handler);
        });

        it('calls crosstab.util.events.on correctly', function () {
          assert.equal(crossTabMock.util.events.on.callCount, 1);
          var args = crossTabMock.util.events.on.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'message');
          assert.isFunction(args[1]);
        });

        describe('send', function () {
          beforeEach(function () {
            localStorageAdapter.send('message', 'data');
          });

          it('calls crosstab.broadcast correctly', function () {
            assert.equal(crossTabMock.broadcast.callCount, 1);
            var args = crossTabMock.broadcast.args[0];
            assert.lengthOf(args, 3);
            assert.equal(args[0], 'message');
            assert.deepEqual(args[1], { data: 'data', id: 'wibble' });
            assert.isNull(args[2]);
          });
        });
      });

      describe('off', function () {
        beforeEach(function () {
          sinon.spy(crossTabMock.util.events, 'off');

          var handler = function () {};

          localStorageAdapter.on('message', handler);
          localStorageAdapter.off('message', handler);
        });

        it('unregister a callback to be called when a message is sent', function () {
          assert.isTrue(
            crossTabMock.util.events.off.calledWith('message'));
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
              key: 'value'
            }));
        });
      });
    });
  });
});



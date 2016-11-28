/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const sinon = require('sinon');
  const WebChannelReceiver = require('lib/channels/receivers/web-channel');
  const WindowMock = require('../../../../mocks/window');

  var windowMock;
  var receiver;

  var assert = chai.assert;

  describe('lib/channels/receivers/web-channel', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      receiver = new WebChannelReceiver();
      receiver.initialize({
        webChannelId: 'channel_id',
        window: windowMock
      });
    });

    afterEach(function () {
      receiver.teardown();
    });

    describe('receiveMessage', function () {
      it('prints an error to the console if the message is malformed', function () {
        sinon.spy(windowMock.console, 'error');

        // missing detail
        receiver.receiveMessage({});
        assert.equal(windowMock.console.error.callCount, 1);

        // missing id
        receiver.receiveMessage({
          detail: {
            message: {}
          }
        });
        assert.equal(windowMock.console.error.callCount, 2);

        windowMock.console.error.restore();
      });

      it('ignores messages without a `message`', function () {
        sinon.spy(receiver, 'trigger');

        receiver.receiveMessage({
          detail: {
            id: 'channel_id'
          }
        });

        assert.isFalse(receiver.trigger.called);
      });

      it('ignores messages from other channels', function () {
        sinon.spy(receiver, 'trigger');

        receiver.receiveMessage({
          detail: {
            id: 'another_channel',
            message: {
              key: 'value'
            }
          }
        });

        assert.isFalse(receiver.trigger.called);
      });

      it('triggers a `message` event with event\'s message', function () {
        sinon.spy(receiver, 'trigger');

        receiver.receiveMessage({
          detail: {
            id: 'channel_id',
            message: {
              key: 'value'
            }
          }
        });

        assert.isTrue(receiver.trigger.calledWith('message', { key: 'value' }));
      });

      it('can handle errors triggered by the WebChannel component', function () {
        sinon.spy(windowMock.console, 'error');
        sinon.spy(receiver, 'trigger');

        receiver.receiveMessage({
          detail: {
            id: 'channel_id',
            message: {
              error: 'Permission denied'
            }
          }
        });

        assert.equal(windowMock.console.error.callCount, 1);
        assert.isTrue(windowMock.console.error.calledWith('WebChannel error:', 'Permission denied'));
        assert.isFalse(receiver.trigger.called);
      });

      it('can handle errors that have a stack in data', function () {
        sinon.spy(windowMock.console, 'error');
        sinon.spy(receiver, 'trigger');

        receiver.receiveMessage({
          detail: {
            id: 'channel_id',
            message: {
              data: {
                error: {
                  message: 'Permission denied',
                  stack: 'foo \n bar'
                }
              }
            }
          }
        });

        assert.equal(windowMock.console.error.callCount, 1);
        assert.isTrue(windowMock.console.error.calledWith('WebChannel error:', 'Permission denied'));
        assert.isFalse(receiver.trigger.called);
      });
    });

    describe('_reportCaughtErrors', function () {

      it('reports error if it gets an error from WebChannels', function () {
        assert.isFalse(receiver._reportCaughtErrors({ data: 'ok'}), 'false if no error');
        assert.isTrue(receiver._reportCaughtErrors({ error: 'fail'}), 'true if error');
        assert.isFalse(receiver._reportCaughtErrors({ error: { shouldNotBeObject: true}}), 'false if direct object');
        assert.isTrue(receiver._reportCaughtErrors({ data: { error: { message: 'error'}}}), 'true if nested error object');
      });

    });
  });
});

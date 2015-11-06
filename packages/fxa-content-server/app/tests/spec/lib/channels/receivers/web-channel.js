/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var sinon = require('sinon');
  var WebChannelReceiver = require('lib/channels/receivers/web-channel');
  var WindowMock = require('../../../../mocks/window');

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
    });
  });
});

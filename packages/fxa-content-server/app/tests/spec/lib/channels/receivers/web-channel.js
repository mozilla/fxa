/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/channels/receivers/web-channel',
  '../../../../mocks/window'
],
function (chai, sinon, WebChannelReceiver, WindowMock) {
  var windowMock;
  var receiver;

  var assert = chai.assert;

  describe('lib/channels/receivers/web-channel', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      receiver = new WebChannelReceiver();
      receiver.initialize({
        window: windowMock,
        webChannelId: 'channel_id'
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

        // missing message
        receiver.receiveMessage({
          detail: {
            id: 'channel_id'
          }
        });
        assert.equal(windowMock.console.error.callCount, 3);

        windowMock.console.error.restore();
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

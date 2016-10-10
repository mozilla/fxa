/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const sinon = require('sinon');
  const WebChannelSender = require('lib/channels/senders/web-channel');
  const WindowMock = require('../../../../mocks/window');

  var windowMock;
  var sender;

  var assert = chai.assert;

  describe('lib/channels/senders/web-channel', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      sender = new WebChannelSender();
      sender.initialize({
        webChannelId: 'channel_id',
        window: windowMock
      });
    });

    afterEach(function () {
      sender.teardown();
    });

    describe('send', function () {
      it('dispatches a CustomEvent to the window', function () {
        sinon.spy(windowMock, 'dispatchEvent');
        sinon.spy(windowMock, 'CustomEvent');

        var messageId = Date.now();
        return sender.send('ping', { key: 'value' }, messageId)
          .then(function () {
            assert.isTrue(windowMock.dispatchEvent.called);

            var eventType = windowMock.CustomEvent.args[0][0];
            assert.equal(eventType, 'WebChannelMessageToChrome');

            var eventData = windowMock.CustomEvent.args[0][1].detail;
            assert.equal(eventData.id, 'channel_id');
            assert.equal(eventData.message.messageId, messageId);
            assert.equal(eventData.message.command, 'ping');
            assert.equal(eventData.message.data.key, 'value');
          });
      });
    });

    describe('_saveEventName', function () {
      it('saves a dispatched command into sessionStorage', function () {
        sender._saveEventName('some:test');
        assert.equal(windowMock.sessionStorage.getItem('webChannelEvents'), '["some:test"]');
        sender._saveEventName('some:othertest');
        assert.equal(windowMock.sessionStorage.getItem('webChannelEvents'), '["some:test","some:othertest"]');
      });
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('lib/auth-errors');
  const chai = require('chai');
  const IFrameChannel = require('lib/channels/iframe');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  var channel;
  var windowMock;
  var parentMock;

  var assert = chai.assert;

  describe('lib/channels/iframe', function () {
    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();
      windowMock.parent = parentMock;

      channel = new IFrameChannel();
      return channel.initialize({
        origin: 'https://trusted-parent.org',
        window: windowMock
      });
    });

    afterEach(function () {
      channel.teardown();
    });

    describe('send', function () {
      it('sends a message to the parent, at specified origin', function () {
        sinon.stub(parentMock, 'postMessage').callsFake(sinon.spy());

        return channel.send('ping', { key: 'value' })
          .then(function () {
            var msg = parentMock.postMessage.args[0][0];
            var targetOrigin = parentMock.postMessage.args[0][1];

            var parsed = IFrameChannel.parse(msg);
            var command = parsed.command;
            var data = parsed.data;

            assert.equal(command, 'ping');
            assert.equal(data.key, 'value');
            assert.equal(targetOrigin, 'https://trusted-parent.org');
          });
      });

      it('can send a message with no data', function () {
        sinon.stub(parentMock, 'postMessage').callsFake(sinon.spy());

        return channel.send('ping')
          .then(function () {
            var msg = parentMock.postMessage.args[0][0];

            var parsed = IFrameChannel.parse(msg);
            var command = parsed.command;
            var data = parsed.data;

            assert.equal(command, 'ping');
            assert.equal(Object.keys(data).length, 0);
          });
      });
    });

    describe('request', function () {
      it('prints a message to the console if there is no response', function (done) {
        // drop the message on the ground.
        sinon.stub(parentMock, 'postMessage').callsFake(sinon.spy());

        sinon.stub(windowMock, 'setTimeout').callsFake(function (callback) {
          // force the wait timeout to expire immediately.
          callback();
        });

        sinon.stub(windowMock.console, 'error').callsFake(() => {
          done();
        });

        channel.request('wait-for-response', {});
      });
    });

    describe('receiveEvent', function () {
      it('triggers an event if message is from trusted origin', function () {
        sinon.spy(channel, 'trigger');

        channel.receiveEvent({
          data: IFrameChannel.stringify('message_type', { key: 'value' }),
          origin: 'https://trusted-parent.org',
          type: 'message'
        });

        assert.isTrue(
          channel.trigger.calledWith('message_type', { key: 'value' }));
      });

      it('ignores and logs messages from untrusted origins', function () {
        var errorSpy = sinon.spy();
        channel.on('error', errorSpy);

        channel.receiveEvent({
          data: IFrameChannel.stringify('message_type', { key: 'value' }),
          origin: 'https://untrusted-parent.org',
          type: 'message'
        });

        var error = errorSpy.args[0][0];
        assert.isTrue(AuthErrors.is(error, 'UNEXPECTED_POSTMESSAGE_ORIGIN'));
        assert.equal(error.context, 'https://untrusted-parent.org');
      });

      it('can handle a malformed message', function () {
        var invalidMsg = '{';
        channel.receiveEvent({
          data: invalidMsg,
          type: 'message'
        });
      });
    });

    describe('parseMessage', function () {
      it('can handle a malformed message', function () {
        assert.equal(JSON.stringify(channel.parseMessage('{')), '{}');
      });
    });

    describe('the full cycle', function () {
      it('calls the callback with the data received from the parentWindow', function () {
        sinon.stub(windowMock.parent, 'postMessage').callsFake(function (message) {
          var parsed = JSON.parse(message);
          channel.receiveEvent({
            data: JSON.stringify({
              command: parsed.command,
              data: { key: 'value' },
              messageId: parsed.messageId
            }),
            origin: 'https://trusted-parent.org',
            type: 'message'
          });
        });

        // synthesize receiving a message over postMessage
        return channel.request('ping', {})
          .then(function (data) {
            assert.equal(data.key, 'value');
          });
      });
    });
  });
});
